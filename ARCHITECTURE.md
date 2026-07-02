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
- In-memory chat history for each room

### Signaling Server
- Queues SDP offers and answers for each participant session
- Exchanges ICE candidates through short-lived room queues
- Uses participant heartbeats to remove abandoned sessions

### WebRTC Layer
- Peer-to-peer audio, video, and screen-share communication
- Mesh connections for the current 12-person room limit
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
- Chat records for the active room
- Short-lived WebRTC signaling messages

## Production networking

The browser configuration includes public STUN discovery. Production deployments should provide
their own TURN service so calls also connect from restrictive or symmetric-NAT networks. HTTPS is
required outside localhost for camera, microphone, and screen-sharing browser APIs.

## Security

- JWT Authentication
- HTTPS
- WebRTC encryption
