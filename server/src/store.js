import { randomUUID } from "node:crypto";

const rooms = new Map();

function makeRoomId() {
  return `SM-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function normalizeName(value) {
  return value.trim();
}

function buildPublicRoom(room) {
  return {
    roomId: room.roomId,
    title: room.title,
    hostName: room.hostName,
    date: room.date,
    time: room.time,
    mode: room.mode,
    createdAt: room.createdAt,
    participants: room.participants,
  };
}

export function createRoom({ title, hostName, date, time, mode }) {
  const roomId = makeRoomId();
  const createdAt = new Date().toISOString();
  const room = {
    roomId,
    title: title.trim(),
    hostName: normalizeName(hostName),
    date,
    time,
    mode,
    createdAt,
    participants: [
      {
        id: randomUUID(),
        name: normalizeName(hostName),
        role: "host",
        joinedAt: createdAt,
      },
    ],
  };

  rooms.set(roomId, room);
  return buildPublicRoom(room);
}

export function joinRoom(roomId, displayName) {
  const room = rooms.get(roomId);

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  const participantName = normalizeName(displayName);
  const existingParticipant = room.participants.find(
    (participant) => participant.name.toLowerCase() === participantName.toLowerCase(),
  );

  if (!existingParticipant) {
    if (room.participants.length >= 2) {
      const error = new Error("This room already has both participants joined");
      error.statusCode = 409;
      throw error;
    }

    room.participants.push({
      id: randomUUID(),
      name: participantName,
      role: "guest",
      joinedAt: new Date().toISOString(),
    });
  }

  return buildPublicRoom(room);
}

export function leaveRoom(roomId, displayName) {
  const room = rooms.get(roomId);

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  const participantName = normalizeName(displayName).toLowerCase();
  const nextParticipants = room.participants.filter(
    (participant) => participant.name.toLowerCase() !== participantName,
  );

  room.participants = nextParticipants;

  if (room.participants.length === 0) {
    rooms.delete(roomId);
    return null;
  }

  return buildPublicRoom(room);
}

export function getRoom(roomId) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  return buildPublicRoom(room);
}