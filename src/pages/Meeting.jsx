import { useState, useRef, useEffect } from "react";
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdScreenShare,
  MdStopScreenShare,
  MdCallEnd,
  MdChat,
  MdSend,
  MdPerson,
} from "react-icons/md";
import { useNotification } from "../components/NotificationProvider";
import Navbar from "../components/Navbar";
import {
  fetchMeetingMessages,
  fetchMeetingRoom,
  leaveMeetingRoom,
  sendMeetingMessage,
} from "../lib/meetingApi";

export default function Meeting() {
  const { addNotification } = useNotification();
  const query = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const roomId = query.get("room") || "";
  const displayName = query.get("name") || "You";
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [room, setRoom] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState("");
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRoomError("Missing room id in the meeting link.");
      setIsLoadingRoom(false);
      return;
    }

    let isMounted = true;

    const loadRoom = async () => {
      setIsLoadingRoom(true);
      setRoomError("");

      try {
        const { room: fetchedRoom } = await fetchMeetingRoom(roomId);

        if (isMounted) {
          setRoom(fetchedRoom);
        }
      } catch (fetchError) {
        if (isMounted) {
          setRoomError(fetchError.message || "Unable to load the room.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoom(false);
        }
      }
    };

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        const { messages } = await fetchMeetingMessages(roomId);

        if (isMounted) {
          setChatMessages(messages);
          setChatError("");
        }
      } catch (fetchError) {
        if (isMounted) {
          setChatError(fetchError.message || "Unable to load chat messages.");
        }
      }
    };

    loadMessages();
    const intervalId = window.setInterval(loadMessages, 4000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [roomId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!roomId || !displayName) {
        return;
      }

      const payload = JSON.stringify({ displayName });
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/rooms/${encodeURIComponent(roomId)}/leave`,
        new Blob([payload], { type: "application/json" }),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [displayName, roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const participants = room?.participants ?? [];
  const activeParticipants = participants.filter(
    (participant) => participant.role === "host" || participant.role === "guest",
  );

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    addNotification(
      isMicOn ? "Microphone muted" : "Microphone unmuted",
      "info",
      2000
    );
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    addNotification(
      isCameraOn ? "Camera turned off" : "Camera turned on",
      "info",
      2000
    );
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    addNotification(
      isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      "success",
      2000
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMessageTimestamp = (message) => {
    if (message.sentAt) {
      return message.sentAt;
    }

    if (!message.createdAt) {
      return "Now";
    }

    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(message.createdAt));
  };

  const endCall = () => {
    if (confirm("Are you sure you want to end the call?")) {
      leaveMeetingRoom(roomId, displayName)
        .catch(() => {})
        .finally(() => {
          addNotification("Call ended", "info", 2000);
          setTimeout(() => {
            window.location.hash = "#";
          }, 500);
        });
    }
  };

  const sendChatMessage = (event) => {
    event.preventDefault();

    if (!roomId || roomError) {
      return;
    }

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) {
      return;
    }

    sendMeetingMessage(roomId, displayName, trimmedMessage)
      .then(({ message }) => {
        setChatMessages((messages) => {
          if (messages.some((existingMessage) => existingMessage.id === message.id)) {
            return messages;
          }

          return [...messages, message];
        });
        setChatInput("");
        setChatError("");
      })
      .catch((sendError) => {
        setChatError(sendError.message || "Unable to send the message.");
        addNotification("Message failed to send", "error", 2500);
      });
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900 lg:h-screen lg:overflow-hidden">
      <Navbar />

      {/* Video Grid */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 xl:flex-row xl:overflow-hidden">
        {/* Main Video Area */}
        <div className="flex min-h-[520px] flex-1 flex-col xl:min-h-0">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-sm">
            {isLoadingRoom ? (
              <span>Loading room {roomId}...</span>
            ) : roomError ? (
              <span className="text-red-600">{roomError}</span>
            ) : (
              <span>
                {room?.title || "Meeting room"} | Room {room?.roomId} | Hosted by {room?.hostName}
              </span>
            )}
          </div>

          {/* Primary Video */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden group shadow-lg border border-slate-200">
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              {isCameraOn ? (
                <div ref={videoRef} className="w-full h-full bg-slate-100" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center">
                    <MdPerson className="text-4xl text-sky-600" />
                  </div>
                  <p className="text-lg text-slate-600 font-medium">Camera is off</p>
                </div>
              )}
            </div>

            {/* Participant Name Overlay */}
            <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMicOn ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="text-sm font-semibold bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-slate-900 border border-slate-200">
                {displayName}
              </span>
            </div>

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full text-xs font-semibold">
                Sharing Screen
              </div>
            )}
          </div>

          {/* Participants Grid */}
          {activeParticipants.length > 1 && (
            <div className="mt-4 grid max-h-[220px] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {activeParticipants.slice(1).map((participant) => (
                <div
                  key={participant.id}
                  className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden aspect-video group shadow-md border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                        <MdPerson className="text-xl text-sky-600" />
                      </div>
                      <span className="text-xs font-medium text-slate-700">
                        {participant.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="flex w-full flex-col gap-4 xl:w-[360px] xl:flex-shrink-0 xl:overflow-hidden">
        {/* Sidebar - Participants List */}
        <section className="flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur-sm xl:max-h-[36%]">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Participants ({activeParticipants.length || 1})</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeParticipants.length > 0 ? (
              activeParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-sky-50/50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <MdPerson className="text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{participant.name}</p>
                    <p className="text-xs text-slate-500">
                      {participant.role === "host" ? "Host" : "Guest"}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-slate-500">No participants loaded yet.</div>
            )}
          </div>

          {/* Participants Actions */}
          <div className="p-4 border-t border-slate-200">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                addNotification("Invite link copied", "success", 2000);
              }}
              className="w-full text-sm font-semibold text-sky-600 hover:text-sky-700 transition py-2 px-3 rounded-lg hover:bg-sky-50"
            >
              Share Invite Link
            </button>
          </div>
        </section>

        {/* Meeting Chat */}
        <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm xl:min-h-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <MdChat className="text-xl" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Meeting Chat</h2>
                <p className="text-xs text-slate-500">{chatMessages.length} messages</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Live
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {chatMessages.map((chatMessage) => {
              const isOwnMessage = chatMessage.sender === displayName;

              return (
                <div
                  key={chatMessage.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3 py-2 shadow-sm ${
                      isOwnMessage
                        ? "bg-sky-600 text-white"
                        : chatMessage.role === "system"
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-100"
                          : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span
                        className={`text-xs font-semibold ${
                          isOwnMessage ? "text-sky-50" : "text-slate-600"
                        }`}
                      >
                        {chatMessage.sender}
                      </span>
                      <span
                        className={`text-[11px] ${
                          isOwnMessage ? "text-sky-100" : "text-slate-400"
                        }`}
                      >
                        {formatMessageTimestamp(chatMessage)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{chatMessage.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {chatError && (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {chatError}
            </div>
          )}

          <form onSubmit={sendChatMessage} className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Message everyone"
                disabled={!roomId || Boolean(roomError)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || !roomId || Boolean(roomError)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                title="Send message"
              >
                <MdSend className="text-lg" />
              </button>
            </div>
          </form>
        </section>
        </aside>
      </div>

      {/* Control Bar */}
      <div className="bg-gradient-to-t from-white/80 via-white/60 to-transparent backdrop-blur-sm border-t border-slate-200 pt-6 pb-6">
        <div className="flex items-center justify-center gap-4 px-4">
          {/* Microphone Control */}
          <button
            onClick={toggleMic}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-md border-2 ${
              isMicOn
                ? "bg-white border-sky-300 hover:bg-sky-50 text-sky-600"
                : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
            }`}
            title={isMicOn ? "Mute" : "Unmute"}
          >
            {isMicOn ? (
              <MdMic className="text-2xl" />
            ) : (
              <MdMicOff className="text-2xl" />
            )}
          </button>

          {/* Camera Control */}
          <button
            onClick={toggleCamera}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-md border-2 ${
              isCameraOn
                ? "bg-white border-sky-300 hover:bg-sky-50 text-sky-600"
                : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
            }`}
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? (
              <MdVideocam className="text-2xl" />
            ) : (
              <MdVideocamOff className="text-2xl" />
            )}
          </button>

          {/* Screen Share Control */}
          <button
            onClick={toggleScreenShare}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-md border-2 ${
              isScreenSharing
                ? "bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                : "bg-white border-slate-300 hover:bg-slate-50 text-slate-600"
            }`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            {isScreenSharing ? (
              <MdStopScreenShare className="text-2xl" />
            ) : (
              <MdScreenShare className="text-2xl" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 transition-all text-white shadow-md border-2 border-red-600 ml-4"
            title="End call"
          >
            <MdCallEnd className="text-2xl" />
          </button>
        </div>

        {/* Call Duration */}
        <div className="text-center mt-4 text-slate-600 text-sm font-medium">
          Call Duration: {formatDuration(callDuration)}
        </div>
      </div>
    </main>
  );
}
