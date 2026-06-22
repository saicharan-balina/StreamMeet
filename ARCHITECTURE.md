# StreamMeet Architecture

## Overview

StreamMeet follows a client-server architecture where users interact through a React frontend, an Express backend, and a WebRTC communication layer.

## Components

### Frontend
- React.js
- Handles UI rendering
- Captures user media
- Connects to signaling server

### Backend
- Express.js
- Basic room management API
- Meeting metadata storage
- In-memory participant state for the first working version

### Signaling Server
- Exchanges SDP offers and answers
- Exchanges ICE candidates
- Establishes WebRTC connections

### WebRTC Layer
- Peer-to-peer audio/video communication
- Low latency streaming
- Secure encrypted media transfer

## Communication Flow

User A
↓
Frontend
↓
Signaling Server
↓
User B

After signaling:

User A ←→ User B

Direct WebRTC connection established.

## Data

The first backend version keeps room and participant state in memory. This is enough to make create meeting and join meeting work end to end without introducing a database yet.

Stores:
- Meeting information
- Room participants
- Meeting history placeholder
- Chat records placeholder

## Security

- JWT Authentication
- HTTPS
- WebRTC encryption
