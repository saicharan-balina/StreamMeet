const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

export function getRoomApiBaseUrl() {
  return API_BASE_URL;
}

export async function createMeetingRoom(data) {
  return requestJson("/api/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function joinMeetingRoom(roomId, displayName, clientId) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: "POST",
    body: JSON.stringify({ displayName, clientId }),
  });
}

export async function leaveMeetingRoom(roomId, displayName, clientId) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/leave`, {
    method: "POST",
    body: JSON.stringify({ displayName, clientId }),
  });
}

export async function fetchMeetingRoom(roomId) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}`);
}

export async function heartbeatMeetingRoom(roomId, clientId, media) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/heartbeat`, {
    method: "POST",
    body: JSON.stringify({ clientId, media }),
  });
}

export async function fetchMeetingMessages(roomId) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/messages`);
}

export async function sendMeetingMessage(roomId, sender, message, role = "guest") {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ sender, message, role }),
  });
}
