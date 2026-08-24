# MARIS Mobile Architecture

This document describes the architectural foundations established for the MARIS mobile client.

## 1. Navigation Architecture
*   **Main Navigation**: Built using `@react-navigation/bottom-tabs`. Provides top-level tab routes for:
    *   `Home` (MARIS Launch & Overview)
    *   `Map` (Live GIS Map & Spatial Intelligence)
    *   `AskMaris` (Agentic AI Assistant Query workspace)
    *   `Observe` (Field Observation Capture)
    *   `Alerts` (Real-time Marine Advisories)
    *   `MyReports` (Offline Queue & Field Submissions)
    *   `Profile` (Officer Identity & Security Settings)
*   **Sub-Navigation**: Built using `@react-navigation/native-stack` to handle future detail overlays.

---

## 2. API Layer Architecture
*   **HTTP Base Client**: Managed by `apiClient` in [`client.ts`](file:///Users/riteshmishra/Developer/SIH-Project/mobile/src/api/client.ts).
*   **Authentication Token Injection**: Automatically injects JWT Bearer tokens retrieved from authentication state into standard request headers.
*   **Modular API Service Files**:
    *   `auth.api.ts`
    *   `incidents.api.ts`
    *   `observations.api.ts`
    *   `evidence.api.ts`
    *   `sync.api.ts`
    *   `intelligence.api.ts`
    *   `alerts.api.ts`
    *   `ai.api.ts`

---

## 3. Storage & Offline Sync Architecture
*   **Offline Persistence Types**: Defined in [`storage/types.ts`](file:///Users/riteshmishra/Developer/SIH-Project/mobile/src/storage/types.ts):
    *   `LocalObservation`
    *   `LocalEvidence`
    *   `SyncQueueItem`
    *   `SyncState` (`PENDING` | `SYNCING` | `SYNCED` | `FAILED`)
*   **Sync Engine**: Orchestrated by [`syncEngine.ts`](file:///Users/riteshmishra/Developer/SIH-Project/mobile/src/sync/syncEngine.ts) to manage queueing, retries, and parent-child dependency resolution.

---

## 4. Realtime Layer Architecture
*   **Socket.IO Client Service**: Managed by [`socketService.ts`](file:///Users/riteshmishra/Developer/SIH-Project/mobile/src/services/socket/socketService.ts) to handle connections, authorization headers, and reconnect events.

---

## 5. Theme System
*   **Theme System**: Managed in [`theme/theme.ts`](file:///Users/riteshmishra/Developer/SIH-Project/mobile/src/theme/theme.ts). Features deep marine navy backgrounds (`#090d16`), cyan/teal secondary accents (`#00f2fe`), professional typography scales, and surface card tokens.
