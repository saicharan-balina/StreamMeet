# StreamMeet Architecture

## Overview

StreamMeet follows a client-server architecture where users interact through a React frontend, Flask backend, and WebRTC communication layer.

## Components

### Frontend
- React.js
- Handles UI rendering
- Captures user media
- Connects to signaling server

### Backend
- Flask
- User authentication
- Room management
- Meeting metadata storage

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

## Database

Stores:
- User accounts
- Meeting information
- Meeting history
- Chat records

## Security

- JWT Authentication
- HTTPS
- WebRTC encryption
