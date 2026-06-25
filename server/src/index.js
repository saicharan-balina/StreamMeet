import cors from "cors";
import express from "express";
import { createRoom, getRoom, getRoomCount, joinRoom, leaveRoom } from "./store.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
const validModes = new Set(["quick", "private", "recurring"]);

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "32kb" }));

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(value);
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function sendValidationError(response, message) {
  return response.status(400).json({ error: message });
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "streammeet-server",
    rooms: getRoomCount(),
    uptime: Math.round(process.uptime()),
  });
});

app.post("/api/rooms", (request, response, next) => {
  try {
    const { title, hostName, date, time, mode } = request.body ?? {};
    const normalizedTitle = normalizeText(title);
    const normalizedHostName = normalizeText(hostName);

    if (!normalizedTitle || !normalizedHostName || !date || !time) {
      return sendValidationError(response, "title, hostName, date, and time are required");
    }

    if (normalizedTitle.length > 120) {
      return sendValidationError(response, "title must be 120 characters or fewer");
    }

    if (normalizedHostName.length > 60) {
      return sendValidationError(response, "hostName must be 60 characters or fewer");
    }

    if (!isValidDate(date)) {
      return sendValidationError(response, "date must use YYYY-MM-DD format");
    }

    if (!isValidTime(time)) {
      return sendValidationError(response, "time must use HH:mm 24-hour format");
    }

    if (mode && !validModes.has(mode)) {
      return sendValidationError(response, "mode must be quick, private, or recurring");
    }

    const room = createRoom({
      title: normalizedTitle,
      hostName: normalizedHostName,
      date,
      time,
      mode: mode || "quick",
    });

    return response.status(201).json({ room });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/rooms/:roomId", (request, response) => {
  const room = getRoom(request.params.roomId);

  if (!room) {
    return response.status(404).json({ error: "Room not found" });
  }

  return response.json({ room });
});

app.post("/api/rooms/:roomId/join", (request, response, next) => {
  try {
    const { displayName } = request.body ?? {};
    const normalizedDisplayName = normalizeText(displayName);

    if (!normalizedDisplayName) {
      return sendValidationError(response, "displayName is required");
    }

    if (normalizedDisplayName.length > 60) {
      return sendValidationError(response, "displayName must be 60 characters or fewer");
    }

    const room = joinRoom(request.params.roomId, normalizedDisplayName);
    return response.json({ room });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/rooms/:roomId/leave", (request, response, next) => {
  try {
    const { displayName } = request.body ?? {};
    const normalizedDisplayName = normalizeText(displayName);

    if (!normalizedDisplayName) {
      return sendValidationError(response, "displayName is required");
    }

    const room = leaveRoom(request.params.roomId, normalizedDisplayName);

    if (!room) {
      return response.status(204).end();
    }

    return response.json({ room });
  } catch (error) {
    return next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "API route not found" });
});

app.use((error, _request, response, _next) => {
  const status = error.statusCode || 500;
  response.status(status).json({
    error: error.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`StreamMeet backend listening on http://localhost:${port}`);
});
