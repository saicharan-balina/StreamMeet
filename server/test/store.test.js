import test from "node:test";
import assert from "node:assert/strict";
import { createRoom, joinRoom, queueSignal, takeSignals, touchParticipant } from "../src/store.js";

function newRoom() {
  return createRoom({
    title: "WebRTC test",
    hostName: "Alex",
    date: "2026-07-02",
    time: "12:00",
    mode: "quick",
    clientId: "host-session",
  });
}

test("keeps duplicate display names as separate sessions", () => {
  const room = newRoom();
  joinRoom(room.roomId, "Alex", "guest-session");
  const refreshed = touchParticipant(room.roomId, "guest-session", {
    mic: false, camera: true, screen: false,
  });
  assert.equal(refreshed.participants.length, 2);
  assert.equal(refreshed.participants.find((item) => item.clientId === "guest-session").media.mic, false);
});

test("delivers each WebRTC signal only to its recipient", () => {
  const room = newRoom();
  joinRoom(room.roomId, "Guest", "guest-session");
  queueSignal(room.roomId, {
    senderId: "host-session",
    recipientId: "guest-session",
    type: "offer",
    payload: { type: "offer", sdp: "test-sdp" },
  });
  assert.equal(takeSignals(room.roomId, "host-session").length, 0);
  assert.equal(takeSignals(room.roomId, "guest-session").length, 1);
  assert.equal(takeSignals(room.roomId, "guest-session").length, 0);
});
