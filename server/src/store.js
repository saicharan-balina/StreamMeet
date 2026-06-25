import { randomUUID } from "node:crypto";

const rooms = new Map();
const DEFAULT_MAX_PARTICIPANTS = 12;
const VALID_ROOM_MODES = new Set(["quick", "private", "recurring"]);

function makeRoomId() {
  return `SM-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function normalizeName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeRoomId(roomId) {
  return String(roomId ?? "").trim().toUpperCase();
}

function normalizeMode(mode) {
  return VALID_ROOM_MODES.has(mode) ? mode : "quick";
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
    updatedAt: room.updatedAt,
    maxParticipants: room.maxParticipants,
    participants: room.participants.map((participant) => ({ ...participant })),
  };
}

function createNotFoundError() {
  const error = new Error("Room not found");
  error.statusCode = 404;
  return error;
}

export function createRoom({ title, hostName, date, time, mode, maxParticipants }) {
  const roomId = makeRoomId();
  const createdAt = new Date().toISOString();
  const room = {
    roomId,
    title: normalizeText(title),
    hostName: normalizeName(hostName),
    date,
    time,
    mode: normalizeMode(mode),
    createdAt,
    updatedAt: createdAt,
    maxParticipants: Number.isInteger(maxParticipants) && maxParticipants > 0
      ? maxParticipants
      : DEFAULT_MAX_PARTICIPANTS,
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
  const normalizedRoomId = normalizeRoomId(roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    throw createNotFoundError();
  }

  const participantName = normalizeName(displayName);
  if (!participantName) {
    const error = new Error("displayName is required");
    error.statusCode = 400;
    throw error;
  }

  const existingParticipant = room.participants.find(
    (participant) => participant.name.toLowerCase() === participantName.toLowerCase(),
  );

  if (existingParticipant) {
    existingParticipant.lastSeenAt = new Date().toISOString();
    room.updatedAt = existingParticipant.lastSeenAt;
    return buildPublicRoom(room);
  }

  if (room.participants.length >= room.maxParticipants) {
    const error = new Error("This room is full");
    error.statusCode = 409;
    throw error;
  }

  const joinedAt = new Date().toISOString();
  room.participants.push({
    id: randomUUID(),
    name: participantName,
    role: "guest",
    joinedAt,
    lastSeenAt: joinedAt,
  });
  room.updatedAt = joinedAt;

  return buildPublicRoom(room);
}

export function leaveRoom(roomId, displayName) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    throw createNotFoundError();
  }

  const participantName = normalizeName(displayName).toLowerCase();
  const nextParticipants = room.participants.filter(
    (participant) => participant.name.toLowerCase() !== participantName,
  );

  room.participants = nextParticipants;

  if (room.participants.length === 0) {
    rooms.delete(normalizedRoomId);
    return null;
  }

  room.updatedAt = new Date().toISOString();
  return buildPublicRoom(room);
}

export function getRoom(roomId) {
  const room = rooms.get(normalizeRoomId(roomId));

  if (!room) {
    return null;
  }

  return buildPublicRoom(room);
}

export function getRoomCount() {
  return rooms.size;
}
