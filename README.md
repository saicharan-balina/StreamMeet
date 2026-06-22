# StreamMeet

StreamMeet is a video conferencing web application that allows users to create and join meeting rooms for real-time communication.

## Features

* Video calling
* Audio calling
* Screen sharing
* Real-time chat
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

The application now uses a basic Express backend to create and join rooms, fetch room metadata, and keep the frontend meeting flow synchronized with the room state. Users can create meeting rooms and share room links with others to join video calls.

## Basic Backend API

* `POST /api/rooms` creates a room.
* `GET /api/rooms/:roomId` fetches room details.
* `POST /api/rooms/:roomId/join` adds a participant to a room.

## Future Improvements

* Meeting recording
* Live captions
* Virtual backgrounds
* Meeting scheduling
* End-to-end encryption

## Author

Sai Charan
