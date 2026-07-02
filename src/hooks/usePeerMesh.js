import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMeetingSignals, sendMeetingSignal } from "../lib/meetingApi";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function usePeerMesh({ roomId, clientId, participantIds, localStream }) {
  const peersRef = useRef(new Map());
  const candidateQueuesRef = useRef(new Map());
  const localStreamRef = useRef(localStream);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStates, setConnectionStates] = useState({});

  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

  const removePeer = useCallback((peerId) => {
    peersRef.current.get(peerId)?.close();
    peersRef.current.delete(peerId);
    candidateQueuesRef.current.delete(peerId);
    setRemoteStreams((current) => {
      const next = { ...current };
      delete next[peerId];
      return next;
    });
    setConnectionStates((current) => {
      const next = { ...current };
      delete next[peerId];
      return next;
    });
  }, []);

  const sendSignal = useCallback((peerId, type, payload) => (
    sendMeetingSignal(roomId, clientId, peerId, type, payload).catch(() => undefined)
  ), [clientId, roomId]);

  const createPeer = useCallback((peerId) => {
    const existing = peersRef.current.get(peerId);
    if (existing) return existing;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(peerId, peer);
    candidateQueuesRef.current.set(peerId, []);

    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    peer.onicecandidate = ({ candidate }) => {
      if (candidate) sendSignal(peerId, "candidate", candidate.toJSON());
    };
    peer.ontrack = ({ streams, track }) => {
      const remoteStream = streams[0] || new MediaStream([track]);
      setRemoteStreams((current) => ({ ...current, [peerId]: remoteStream }));
    };
    peer.onconnectionstatechange = () => {
      setConnectionStates((current) => ({ ...current, [peerId]: peer.connectionState }));
      if (peer.connectionState === "failed") peer.restartIce();
    };
    return peer;
  }, [sendSignal]);

  const makeOffer = useCallback(async (peerId) => {
    const peer = createPeer(peerId);
    if (peer.signalingState !== "stable") return;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await sendSignal(peerId, "offer", peer.localDescription.toJSON());
  }, [createPeer, sendSignal]);

  const flushCandidates = useCallback(async (peerId, peer) => {
    const candidates = candidateQueuesRef.current.get(peerId) || [];
    candidateQueuesRef.current.set(peerId, []);
    for (const candidate of candidates) await peer.addIceCandidate(candidate);
  }, []);

  const handleSignal = useCallback(async (signal) => {
    const peer = createPeer(signal.senderId);
    if (signal.type === "offer") {
      await peer.setRemoteDescription(signal.payload);
      await flushCandidates(signal.senderId, peer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await sendSignal(signal.senderId, "answer", peer.localDescription.toJSON());
    } else if (signal.type === "answer") {
      await peer.setRemoteDescription(signal.payload);
      await flushCandidates(signal.senderId, peer);
    } else if (signal.type === "candidate") {
      if (peer.remoteDescription) await peer.addIceCandidate(signal.payload);
      else candidateQueuesRef.current.get(signal.senderId)?.push(signal.payload);
    }
  }, [createPeer, flushCandidates, sendSignal]);

  useEffect(() => {
    if (!roomId || !clientId || !window.RTCPeerConnection) return undefined;
    let active = true;
    let busy = false;
    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const { signals } = await fetchMeetingSignals(roomId, clientId);
        for (const signal of signals) {
          if (!active) break;
          await handleSignal(signal);
        }
      } catch { /* presence polling surfaces server errors */ }
      finally { busy = false; }
    };
    poll();
    const timer = window.setInterval(poll, 500);
    return () => { active = false; window.clearInterval(timer); };
  }, [clientId, handleSignal, roomId]);

  useEffect(() => {
    const wanted = new Set(participantIds.filter((id) => id && id !== clientId));
    peersRef.current.forEach((_peer, peerId) => {
      if (!wanted.has(peerId)) removePeer(peerId);
    });
    wanted.forEach((peerId) => {
      if (!peersRef.current.has(peerId) && clientId.localeCompare(peerId) < 0) {
        makeOffer(peerId).catch(() => removePeer(peerId));
      }
    });
  }, [clientId, makeOffer, participantIds, removePeer]);

  useEffect(() => {
    if (!localStream) return;
    peersRef.current.forEach((peer, peerId) => {
      const senderKinds = new Set(peer.getSenders().map((sender) => sender.track?.kind));
      localStream.getTracks().forEach((track) => {
        if (!senderKinds.has(track.kind)) peer.addTrack(track, localStream);
      });
      if (clientId.localeCompare(peerId) < 0) makeOffer(peerId).catch(() => undefined);
    });
  }, [clientId, localStream, makeOffer]);

  useEffect(() => () => {
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
  }, []);

  return { peersRef, remoteStreams, connectionStates };
}
