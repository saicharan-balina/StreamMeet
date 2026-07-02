import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalMedia() {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function requestMedia() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera and microphone access are not supported in this browser.");
        setMicOn(false);
        setCameraOn(false);
        return;
      }

      const [audioResult, videoResult] = await Promise.allSettled([
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        }),
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        }),
      ]);
      const tracks = [
        ...(audioResult.status === "fulfilled" ? audioResult.value.getAudioTracks() : []),
        ...(videoResult.status === "fulfilled" ? videoResult.value.getVideoTracks() : []),
      ];
      if (!active) return tracks.forEach((track) => track.stop());
      if (tracks.length) {
        const nextStream = new MediaStream(tracks);
        streamRef.current = nextStream;
        setStream(nextStream);
      }
      if (audioResult.status === "rejected") setMicOn(false);
      if (videoResult.status === "rejected") setCameraOn(false);
      if (audioResult.status === "rejected" || videoResult.status === "rejected") {
        setError(tracks.length
          ? "Some media is unavailable. Check the blocked device in your browser permissions."
          : "Camera and microphone permission was denied. Check your browser permissions and try again.");
      }
    }

    requestMedia();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleMic = useCallback(() => {
    if (!streamRef.current?.getAudioTracks().length) return;
    const next = !micOn;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setMicOn(next);
  }, [micOn]);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current?.getVideoTracks().length) return;
    const next = !cameraOn;
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setCameraOn(next);
  }, [cameraOn]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return { stream, streamRef, micOn, cameraOn, error, toggleMic, toggleCamera, stop };
}
