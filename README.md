# StreamMeet

StreamMeet is a video conferencing web application that allows users to create and join meeting rooms for real-time communication.

## Features

* Video calling
* Audio calling
* Screen sharing
* Room chat backed by the Express API
* Create and join meeting rooms
* Mute/unmute microphone
* Turn camera on/off

## Tech Stack

* React.js
* Node.js
* Express.js
* Socket.IO
* WebRTC
* In-memory room store for the basic backend

## Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/streammeet.git
cd  streammeet
```

### Install dependencies

Frontend

```bash
cd StreamMeet
npm install
npm start
```

Backend

```bash
cd StreamMeet/server
npm install
npm run dev
```

Optional combined start:

```bash
cd StreamMeet
npm run backend:dev
```

## Project Overview

The application now uses a basic Express backend to create and join rooms, fetch room metadata, and keep the frontend meeting flow synchronized with the room state. Users can create meeting rooms, share room links with others to join video calls, and exchange chat messages that are stored per room in memory while the server is running.

## Basic Backend API

* `GET /api/health` checks backend status.
* `POST /api/rooms` creates a room.
* `GET /api/rooms/:roomId` fetches room details.
* `GET /api/rooms/:roomId/messages` fetches the room chat history.
* `POST /api/rooms/:roomId/join` adds a participant to a room.
* `POST /api/rooms/:roomId/messages` adds a chat message to the room.
* `POST /api/rooms/:roomId/leave` removes a participant from a room.

The room API validates required fields, normalizes room codes, participant names, and chat messages, and keeps participant and chat state in memory for the current server process.

## Future Improvements

* Meeting recording
* Live captions
* Virtual backgrounds
* Meeting scheduling
* End-to-end encryption

## Author

Sai Charan
