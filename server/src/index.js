import cors from "cors";
import express from "express";
import { createRoom, getRoom, joinRoom } from "./store.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/rooms", (request, response, next) => {
  try {
    const { title, hostName, date, time, mode } = request.body ?? {};

    if (!title || !hostName || !date || !time) {
      return response.status(400).json({
        error: "title, hostName, date, and time are required",
      });
    }

    const room = createRoom({
      title,
      hostName,
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

    if (!displayName) {
      return response.status(400).json({ error: "displayName is required" });
    }

    const room = joinRoom(request.params.roomId, displayName);
    return response.json({ room });
  } catch (error) {
    return next(error);
  }
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