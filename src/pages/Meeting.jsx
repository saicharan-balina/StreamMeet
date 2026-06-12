import { useState, useRef, useEffect } from "react";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare, MdStopScreenShare, MdCallEnd, MdPerson } from "react-icons/md";

export default function Meeting() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: "You", isActive: true },
    { id: 2, name: "John Doe", isActive: true },
    { id: 3, name: "Jane Smith", isActive: false },
  ]);
  const videoRef = useRef(null);

  useEffect(() => {
    // Simulate getting user media
    console.log("Initializing video stream...");
  }, []);

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCamera = () => setIsCameraOn(!isCameraOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const endCall = () => {
    if (confirm("Are you sure you want to end the call?")) {
      window.location.hash = "#";
    }
  };

  return (
    <main className="h-screen bg-slate-900 text-white overflow-hidden">
      {/* Video Grid */}
      <div className="flex h-full gap-4 p-4">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Primary Video */}
          <div className="flex-1 relative bg-slate-800 rounded-xl overflow-hidden group">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              {isCameraOn ? (
                <div ref={videoRef} className="w-full h-full bg-slate-800" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                    <MdPerson className="text-4xl text-slate-500" />
                  </div>
                  <p className="text-lg text-slate-300">Camera is off</p>
                </div>
              )}
            </div>

            {/* Participant Name Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMicOn ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
                You
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
          {participants.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3 max-h-[200px]">
              {participants.slice(1).map((participant) => (
                <div
                  key={participant.id}
                  className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video group"
                >
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
                        <MdPerson className="text-xl text-slate-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">
                        {participant.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-2 h-2 rounded-full ${participant.isActive ? "bg-green-500" : "bg-slate-500"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Participants List */}
        <div className="w-80 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-4 border-b border-slate-700 hover:bg-slate-700/50 transition"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <MdPerson className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.name}</p>
                  <p className="text-xs text-slate-400">
                    {participant.isActive ? "Active" : "Idle"}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${participant.isActive ? "bg-green-500" : "bg-slate-500"}`} />
              </div>
            ))}
          </div>

          {/* Participants Actions */}
          <div className="p-4 border-t border-slate-700">
            <button className="w-full text-sm font-semibold text-slate-300 hover:text-white transition py-2 px-3 rounded-lg hover:bg-slate-700">
              Share Invite Link
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-8 pb-6">
        <div className="flex items-center justify-center gap-4 px-4">
          {/* Microphone Control */}
          <button
            onClick={toggleMic}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${
              isMicOn
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-red-600 hover:bg-red-700"
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
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${
              isCameraOn
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-red-600 hover:bg-red-700"
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
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${
              isScreenSharing
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-700 hover:bg-slate-600"
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
            className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-4"
            title="End call"
          >
            <MdCallEnd className="text-2xl" />
          </button>
        </div>

        {/* Call Duration */}
        <div className="text-center mt-4 text-slate-400 text-sm">
          Meeting Duration: 15:42
        </div>
      </div>
    </main>
  );
}
