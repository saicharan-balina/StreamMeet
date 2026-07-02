import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdCallEnd,
  MdChat,
  MdClose,
  MdContentCopy,
  MdMic,
  MdMicOff,
  MdPeople,
  MdPerson,
  MdScreenShare,
  MdSend,
  MdStopScreenShare,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";
import { useNotification } from "../components/NotificationProvider";
import {
  fetchMeetingMessages,
  fetchMeetingRoom,
  leaveMeetingRoom,
  sendMeetingMessage,
} from "../lib/meetingApi";

const POLL_INTERVAL = 1500;

export default function Meeting() {
  const { addNotification } = useNotification();
  const query = useMemo(() => new URLSearchParams(window.location.hash.split("?")[1] || ""), []);
  const roomId = query.get("room") || "";
  const displayName = query.get("name") || "You";
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [room, setRoom] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  const participants = room?.participants ?? [];
  const role = room?.hostName?.toLowerCase() === displayName.toLowerCase() ? "host" : "guest";

  useEffect(() => {
    const timer = window.setInterval(() => setDuration((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    if (!roomId) {
      setRoomError("This meeting link is missing a room ID.");
      return undefined;
    }

    const syncRoom = async () => {
      try {
        const result = await fetchMeetingRoom(roomId);
        if (alive) {
          setRoom(result.room);
          setRoomError("");
        }
      } catch (error) {
        if (alive) setRoomError(error.message || "Could not connect to this meeting.");
      }
    };

    syncRoom();
    const timer = window.setInterval(syncRoom, POLL_INTERVAL);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [roomId]);

  useEffect(() => {
    let alive = true;
    if (!roomId) return undefined;

    const syncMessages = async () => {
      try {
        const result = await fetchMeetingMessages(roomId);
        if (alive) {
          setMessages(result.messages);
          setChatError("");
        }
      } catch (error) {
        if (alive) setChatError(error.message || "Chat is temporarily unavailable.");
      }
    };

    syncMessages();
    const timer = window.setInterval(syncMessages, POLL_INTERVAL);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") syncMessages();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [roomId]);

  useEffect(() => {
    let alive = true;
    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError("Camera access is not supported in this browser.");
        setIsCameraOn(false);
        setIsMicOn(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!alive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setMediaError("Camera and microphone permission was not granted. You can still use meeting chat.");
        setIsCameraOn(false);
        setIsMicOn(false);
      }
    };
    startCamera();
    return () => {
      alive = false;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePanel]);

  useEffect(() => {
    const leave = () => {
      if (!roomId) return;
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/rooms/${encodeURIComponent(roomId)}/leave`,
        new Blob([JSON.stringify({ displayName })], { type: "application/json" }),
      );
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [displayName, roomId]);

  const toggleMic = () => {
    const next = !isMicOn;
    cameraStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setIsMicOn(next);
  };

  const toggleCamera = () => {
    const next = !isCameraOn;
    cameraStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setIsCameraOn(next);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = cameraStreamRef.current;
      setIsScreenSharing(false);
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      addNotification("Screen sharing is not supported in this browser", "error", 2500);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (videoRef.current) videoRef.current.srcObject = cameraStreamRef.current;
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      }, { once: true });
    } catch (error) {
      if (error.name !== "NotAllowedError") addNotification("Screen sharing could not start", "error", 2500);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || isSending) return;
    setIsSending(true);
    try {
      const result = await sendMeetingMessage(roomId, displayName, text, role);
      setMessages((current) => current.some((item) => item.id === result.message.id)
        ? current : [...current, result.message]);
      setChatInput("");
      setChatError("");
    } catch (error) {
      setChatError(error.message || "Your message could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.replace(/&name=[^&]*/i, ""));
      addNotification("Meeting link copied", "success", 2000);
    } catch {
      addNotification("Could not copy the meeting link", "error", 2000);
    }
  };

  const endCall = async () => {
    if (!window.confirm("Leave this meeting?")) return;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    try { await leaveMeetingRoom(roomId, displayName); } catch { /* room may already be closed */ }
    window.location.hash = "#home";
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours ? `${hours}:` : ""}${String(minutes).padStart(hours ? 2 : 1, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const messageTime = (date) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(date));

  return (
    <main className="flex h-screen min-h-[620px] flex-col overflow-hidden bg-[#111318] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold sm:text-base">{room?.title || "StreamMeet meeting"}</h1>
          <p className="mt-0.5 truncate text-xs text-slate-400">{roomError || `${roomId} · ${formatTime(duration)}`}</p>
        </div>
        <button type="button" onClick={copyInvite} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10">
          <MdContentCopy /> <span className="hidden sm:inline">Copy invite</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="relative flex min-w-0 flex-1 items-center justify-center p-3 sm:p-5">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1b1e25] shadow-2xl">
            <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${isCameraOn || isScreenSharing ? "block" : "hidden"}`} />
            {!isCameraOn && !isScreenSharing && (
              <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#273242,#181b21_65%)]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-500 text-3xl font-semibold shadow-xl">
                  {displayName.trim().charAt(0).toUpperCase() || <MdPerson />}
                </div>
                <p className="mt-4 text-sm font-medium text-slate-200">Camera is off</p>
                {mediaError && <p className="mt-2 max-w-md px-6 text-center text-xs text-slate-400">{mediaError}</p>}
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-sm backdrop-blur">
              {!isMicOn && <MdMicOff className="text-red-400" />} {displayName} {role === "host" && <span className="text-xs text-slate-400">(Host)</span>}
            </div>
            {isScreenSharing && <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold">You are presenting</div>}
          </div>
        </section>

        {activePanel && (
          <aside className="absolute inset-y-16 right-0 z-30 flex w-full max-w-[380px] flex-col border-l border-white/10 bg-[#181b21] shadow-2xl sm:relative sm:inset-y-0 sm:z-auto sm:w-[360px]">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <div>
                <h2 className="font-semibold">{activePanel === "people" ? "Participants" : "In-call messages"}</h2>
                <p className="text-xs text-slate-400">{activePanel === "people" ? `${participants.length} in the meeting` : "Visible to everyone here"}</p>
              </div>
              <button type="button" aria-label="Close panel" onClick={() => setActivePanel(null)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><MdClose className="text-xl" /></button>
            </div>

            {activePanel === "people" ? (
              <div className="flex-1 overflow-y-auto p-3">
                {participants.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-slate-400">Waiting for participant details…</p>
                )}
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 font-semibold">{participant.name.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{participant.name}{participant.name.toLowerCase() === displayName.toLowerCase() ? " (You)" : ""}</p><p className="text-xs capitalize text-slate-400">{participant.role}</p></div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                  {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MdChat className="text-3xl text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-slate-300">No messages yet</p>
                      <p className="mt-1 text-xs text-slate-500">Start the conversation with everyone here.</p>
                    </div>
                  )}
                  {messages.map((item) => {
                    const own = item.sender.toLowerCase() === displayName.toLowerCase();
                    if (item.role === "system") return <p key={item.id} className="text-center text-xs text-slate-500">{item.message}</p>;
                    return (
                      <div key={item.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${own ? "rounded-br-sm bg-sky-600" : "rounded-bl-sm bg-white/10"}`}>
                          <div className="mb-1 flex items-center gap-2 text-[11px]"><span className="font-semibold">{own ? "You" : item.sender}</span><span className={own ? "text-sky-100" : "text-slate-500"}>{messageTime(item.createdAt)}</span></div>
                          <p className="break-words text-sm leading-5">{item.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                {chatError && <p className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">{chatError}</p>}
                <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
                  <div className="flex items-end gap-2 rounded-xl bg-white/10 p-2 focus-within:ring-2 focus-within:ring-sky-500/60">
                    <textarea rows="1" maxLength="500" value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) sendMessage(event); }} placeholder="Send a message" className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500" />
                    <button type="submit" disabled={!chatInput.trim() || isSending || Boolean(roomError)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40"><MdSend /></button>
                  </div>
                </form>
              </>
            )}
          </aside>
        )}
      </div>

      <footer className="relative flex h-20 shrink-0 items-center justify-center border-t border-white/10 bg-[#181b21] px-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <ControlButton label={isMicOn ? "Mute" : "Unmute"} active={isMicOn} danger={!isMicOn} onClick={toggleMic}>{isMicOn ? <MdMic /> : <MdMicOff />}</ControlButton>
          <ControlButton label={isCameraOn ? "Stop video" : "Start video"} active={isCameraOn} danger={!isCameraOn} onClick={toggleCamera}>{isCameraOn ? <MdVideocam /> : <MdVideocamOff />}</ControlButton>
          <ControlButton label={isScreenSharing ? "Stop sharing" : "Present"} active={isScreenSharing} onClick={toggleScreenShare}>{isScreenSharing ? <MdStopScreenShare /> : <MdScreenShare />}</ControlButton>
          <ControlButton label="Participants" active={activePanel === "people"} onClick={() => setActivePanel((panel) => panel === "people" ? null : "people")} badge={participants.length}><MdPeople /></ControlButton>
          <ControlButton label="Chat" active={activePanel === "chat"} onClick={() => setActivePanel((panel) => panel === "chat" ? null : "chat")} badge={messages.filter((item) => item.role !== "system").length || null}><MdChat /></ControlButton>
          <button type="button" onClick={endCall} aria-label="Leave call" title="Leave call" className="ml-1 flex h-11 w-16 items-center justify-center rounded-full bg-red-600 text-xl hover:bg-red-500 sm:ml-3"><MdCallEnd /></button>
        </div>
      </footer>
    </main>
  );
}

function ControlButton({ children, label, active, danger = false, onClick, badge }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} title={label} className="group relative flex flex-col items-center gap-1">
      <span className={`relative flex h-11 w-11 items-center justify-center rounded-full text-xl transition sm:w-12 ${danger ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : active ? "bg-sky-600 text-white hover:bg-sky-500" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}>
        {children}{badge ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-emerald-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{badge}</span> : null}
      </span>
      <span className="hidden text-[10px] text-slate-400 sm:block">{label}</span>
    </button>
  );
}
