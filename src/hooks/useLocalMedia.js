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

      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        });
        if (!active) return nextStream.getTracks().forEach((track) => track.stop());
        streamRef.current = nextStream;
        setStream(nextStream);
      } catch {
        setError("Camera or microphone permission was denied. Check your browser permissions and try again.");
        setMicOn(false);
        setCameraOn(false);
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
    const next = !micOn;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setMicOn(next);
  }, [micOn]);

  const toggleCamera = useCallback(() => {
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
