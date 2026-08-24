# MARIS Realtime Control Room WebSockets Protocol

This document defines the Socket.IO realtime connection flow, subscription channels, payload schemas, and event broadcast rules for the MARIS Control Room and field applications.

---

## 1. Connection and Authentication

To establish a WebSocket connection, clients must pass a valid JWT token in either the handshake `auth.token` parameter or as a `token` query parameter.

### Connection Handshake Example (Web Client):
```javascript
import { io } from "socket.io-client";

const socket = io("https://api.maris-platform.com", {
  auth: {
    token: "YOUR_JWT_ACCESS_TOKEN"
  },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});
```

* **Server Authentication Validation**: If the token is invalid or missing, the server rejects the handshake, emitting a connection error.
* **Client Reconnect Behavior**: Socket.IO client automatically handles reconnections over unstable satellite/cellular networks using exponential backoff.

---

## 2. Channels and Rooms

On successful connection, the server automatically maps the client to rooms based on credentials extracted from the JWT token:

1. **User Personal Room (`user:<userId>`)**:
   - Every authenticated user is joined to their personal room.
   - Used for private events (e.g. assignments directed specifically at a Field Officer).
2. **Organization Room (`org:<orgId>`)**:
   - Users with staff roles (`FIELD_OFFICER`, `CONTROL_ROOM`, `SUPERVISOR`, `ORG_ADMIN`) are automatically joined to their respective organization room.
   - Used to broadcast incidents, observations, and telemetry within the organization boundary. Citizens and tipsters are excluded.
3. **Incident Case Room (`incident:<incidentId>`)**:
   - Clients subscribe to dynamic incident rooms to receive granular telemetry updates on specific ongoing operations.
   - **Access Control**: Users must emit a `join_incident` event. The server validates that the user is the creator of the incident OR is a staff member belonging to the organization hosting the incident.

---

## 3. Realtime Event Catalog

### 1. `new_incident`
Broadcasted to the organization room when a new incident is logged.
* **Access**: Staff of the hosting organization; creator user.
* **Payload**:
```json
{
  "_id": "660d3d5d787be21a48c56c22",
  "orgId": "660d3d5d787be21a48c56c11",
  "creatorId": "660d3d5d787be21a48c56c33",
  "title": "Unauthorized Vessel Sighting",
  "priority": "HIGH",
  "status": "RECEIVED",
  "items": [],
  "createdAt": "2026-08-23T10:00:00Z"
}
```

### 2. `incident_synced`
Broadcasted when an offline-reported incident completes synchronization.
* **Access**: Creator user room and organization room.
* **Payload**: Same as `new_incident` (contains the updated server-generated `_id` and `syncState: "SYNCED"`).

### 3. `priority_updated`
Broadcasted to the incident room and the organization room when priority changes.
* **Payload**:
```json
{
  "incidentId": "660d3d5d787be21a48c56c22",
  "priority": "CRITICAL"
}
```

### 4. `alert_created`
Broadcasted globally for general alerts (e.g. cyclonic hazards) or to organization rooms for restricted operational alerts.
* **Payload**:
```json
{
  "_id": "660d3d5d787be21a48c56c88",
  "orgId": "660d3d5d787be21a48c56c11", // null for global alerts
  "title": "Severe Cyclone Sighting",
  "severity": "CRITICAL",
  "message": "High winds detected in Zone 4. Trawlers recalled."
}
```

### 5. `assignment_created`
Broadcasted to the assignee's personal room and the control room.
* **Payload**:
```json
{
  "_id": "660d3d5d787be21a48c56c99",
  "incidentId": "660d3d5d787be21a48c56c22",
  "assigneeId": "660d3d5d787be21a48c56c33",
  "assignedBy": "660d3d5d787be21a48c56c44",
  "orgId": "660d3d5d787be21a48c56c11"
}
```

### 6. `verification_completed`
Broadcasted when an incident or observation has been verified/reviewed by staff.
* **Payload**:
```json
{
  "incidentId": "660d3d5d787be21a48c56c22",
  "verification": {
    "status": "VERIFIED",
    "verifiedBy": "660d3d5d787be21a48c56c33",
    "verifiedAt": "2026-08-23T10:05:00Z",
    "notes": "Verified via satellite imagery comparison."
  }
}
```

### 7. `status_changed` / `case_closed`
Broadcasted to the incident room and the organization room on state progression.
* **Payload**:
```json
{
  "incidentId": "660d3d5d787be21a48c56c22",
  "status": "CLOSED" // Triggers case_closed event if CLOSED
}
```

### 8. `observation_received`
Broadcasted when a field officer logs a new physical observation.
* **Payload**:
```json
{
  "_id": "660d3d5d787be21a48c56cf4",
  "orgId": "660d3d5d787be21a48c56c11",
  "creatorId": "660d3d5d787be21a48c56c33",
  "category": "wildlife",
  "value": "Sighting of whale pod moving south",
  "confidence": 0.95
}
```

---

## 4. Server-Side Operational Logging

All WebSocket client sessions, room joins, dynamic subscriptions, disconnects, and broadcast pipelines are automatically logged by the WINston logger engine on the server, tracking user identities and connection IDs to ensure visibility and prevent security audit bypasses.
