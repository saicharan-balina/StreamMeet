import { randomUUID } from "node:crypto";

const rooms = new Map();
const DEFAULT_MAX_PARTICIPANTS = 12;
const VALID_ROOM_MODES = new Set(["quick", "private", "recurring"]);
const WELCOME_MESSAGE = "Chat is ready for meeting notes, quick links, and questions.";
const PARTICIPANT_TIMEOUT_MS = 30_000;

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

function buildPublicMessage(message) {
  return {
    id: message.id,
    sender: message.sender,
    role: message.role,
    message: message.message,
    createdAt: message.createdAt,
  };
}

function createSystemMessage(message) {
  const createdAt = new Date().toISOString();
  return {
    id: randomUUID(),
    sender: "StreamMeet",
    role: "system",
    message,
    createdAt,
  };
}

function createChatMessage({ sender, role, message }) {
  const createdAt = new Date().toISOString();
  return {
    id: randomUUID(),
    sender: normalizeName(sender),
    role: role === "system" ? "system" : "guest",
    message: normalizeText(message),
    createdAt,
  };
}

function buildPublicRoom(room) {
  const cutoff = Date.now() - PARTICIPANT_TIMEOUT_MS;
  room.participants = room.participants.filter((participant) => {
    const seenAt = participant.lastSeenAt || participant.joinedAt;
    return new Date(seenAt).getTime() >= cutoff;
  });
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
    messageCount: room.chatMessages.length,
    participants: room.participants.map((participant) => ({ ...participant })),
  };
}

function createNotFoundError() {
  const error = new Error("Room not found");
  error.statusCode = 404;
  return error;
}

export function createRoom({ title, hostName, date, time, mode, maxParticipants, clientId }) {
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
        clientId: normalizeText(clientId),
        name: normalizeName(hostName),
        role: "host",
        joinedAt: createdAt,
        lastSeenAt: createdAt,
        media: { mic: true, camera: true, screen: false },
      },
    ],
    chatMessages: [createSystemMessage(WELCOME_MESSAGE)],
  };

  rooms.set(roomId, room);
  return buildPublicRoom(room);
}

export function joinRoom(roomId, displayName, clientId) {
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

  const normalizedClientId = normalizeText(clientId);
  if (!normalizedClientId) {
    const error = new Error("clientId is required");
    error.statusCode = 400;
    throw error;
  }

  const existingParticipant = room.participants.find(
    (participant) => participant.clientId === normalizedClientId,
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
    clientId: normalizedClientId,
    name: participantName,
    role: "guest",
    joinedAt,
    lastSeenAt: joinedAt,
    media: { mic: true, camera: true, screen: false },
  });
  room.chatMessages.push(createSystemMessage(`${participantName} joined the meeting.`));
  room.updatedAt = joinedAt;

  return buildPublicRoom(room);
}

export function leaveRoom(roomId, displayName, clientId) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    throw createNotFoundError();
  }

  const participantName = normalizeName(displayName).toLowerCase();
  const normalizedClientId = normalizeText(clientId);
  const nextParticipants = room.participants.filter(
    (participant) => normalizedClientId
      ? participant.clientId !== normalizedClientId
      : participant.name.toLowerCase() !== participantName,
  );

  room.participants = nextParticipants;

  if (participantName) {
    room.chatMessages.push(createSystemMessage(`${normalizeName(displayName)} left the meeting.`));
  }

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

export function touchParticipant(roomId, clientId, media = {}) {
  const room = rooms.get(normalizeRoomId(roomId));
  if (!room) throw createNotFoundError();

  const participant = room.participants.find((item) => item.clientId === normalizeText(clientId));
  if (!participant) {
    const error = new Error("Participant not found");
    error.statusCode = 404;
    throw error;
  }

  participant.lastSeenAt = new Date().toISOString();
  participant.media = {
    mic: media.mic !== false,
    camera: media.camera !== false,
    screen: media.screen === true,
  };
  room.updatedAt = participant.lastSeenAt;
  return buildPublicRoom(room);
}

export function getRoomMessages(roomId) {
  const room = rooms.get(normalizeRoomId(roomId));

  if (!room) {
    return null;
  }

  return room.chatMessages.map((message) => buildPublicMessage(message));
}

export function addRoomMessage(roomId, { sender, message, role }) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const room = rooms.get(normalizedRoomId);

  if (!room) {
    throw createNotFoundError();
  }

  const normalizedSender = normalizeName(sender);
  const normalizedMessage = normalizeText(message);

  if (!normalizedSender) {
    const error = new Error("sender is required");
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedMessage) {
    const error = new Error("message is required");
    error.statusCode = 400;
    throw error;
  }

  const nextMessage = createChatMessage({
    sender: normalizedSender,
    role,
    message: normalizedMessage,
  });

  room.chatMessages.push(nextMessage);
  room.updatedAt = nextMessage.createdAt;

  return buildPublicMessage(nextMessage);
}
