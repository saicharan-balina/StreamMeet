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

export async function joinMeetingRoom(roomId, displayName) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: "POST",
    body: JSON.stringify({ displayName }),
  });
}

export async function fetchMeetingRoom(roomId) {
  return requestJson(`/api/rooms/${encodeURIComponent(roomId)}`);
}