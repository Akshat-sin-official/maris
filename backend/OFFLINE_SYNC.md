# MARIS Offline Synchronization Protocol

This document defines the synchronization protocol, payload structures, lifecycle state transitions, conflict handling models, and error behaviors for offline-first capabilities in the MARIS mobile application.

---

## 1. Sync State Lifecycle Transitions

Offline created resources flow through five states:

```
  [ Client Capture ] ──> PENDING
                           │
                 (Sync request initiated)
                           │
                           v
                        SYNCING ─────────────+
                           │                 │
                  (Connection success)   (Fail / Timeout)
                           │                 │
                           v                 v
                        SYNCED             FAILED ──> (Retry Sync)
                           │
                 (Data diff detected)
                           │
                           v
                       CONFLICT
```

1. **PENDING**: Stored locally on mobile DB (e.g. SQLite / WatermelonDB) with a client-generated unique `clientId` (UUIDv4) and `clientCreatedAt` timestamp.
2. **SYNCING**: Lock state during active HTTP transmissions to prevent overlapping duplicate sync threads.
3. **SYNCED**: Record successfully stored on the cloud server. Map `serverId` (MongoDB ObjectId) back to the local device database.
4. **FAILED**: Connectivity dropped or verification error occurred. Kept locally for automated retry hooks.
5. **CONFLICT**: Record exists on the server but contains differing data. Triggers manual/rule-based merging.

---

## 2. Idempotency and Duplication Prevention

To guarantee retry-safe operations over unstable satellite or cellular links, the synchronization backend enforces **strict idempotency checks**:
- **Client ID Uniqueness**: Each payload must contain a unique `clientId`. The server queries the database before insertion.
- **Retry Check**: If the `clientId` is already stored, the server skips creation and returns the existing record's `serverId` with a `200 OK` status and `"status": "SYNCED"`. No duplicate records are created.
- **Conflict Check**: If the `clientId` is found but key immutable fields differ from the existing database document, the server returns `"status": "CONFLICT"`.

---

## 3. API Payload Specifications

### Endpoint: `POST /api/v1/sync/incident`
Synchronizes a single incident reported offline.

#### Request Body:
```json
{
  "clientId": "inc_uuid_1111",
  "title": "Illegal Fishing Vessel Sighting",
  "description": "Foreign trawler spotted inside sanctuary zone",
  "priority": "HIGH",
  "items": [
    {
      "type": "vessel_detection",
      "location": {
        "type": "Point",
        "coordinates": [80.3, 12.9]
      },
      "detectedAt": "2026-08-23T10:00:00Z"
    }
  ],
  "clientCreatedAt": "2026-08-23T10:05:00Z",
  "deviceMetadata": {
    "os": "iOS",
    "appVersion": "1.0.4"
  }
}
```

#### Response Body (200 OK):
```json
{
  "clientId": "inc_uuid_1111",
  "serverId": "660d3d5d787be21a48c56c22",
  "status": "SYNCED"
}
```

---

### Endpoint: `POST /api/v1/sync/evidence`
Synchronizes a single evidence file captured offline.

#### Request Body:
```json
{
  "clientId": "ev_uuid_2222",
  "incidentId": "inc_uuid_1111", // Can be a local clientId or server ObjectId
  "mediaType": "image",
  "url": "https://maris-assets.s3.amazonaws.com/evidence_image.jpg",
  "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "capturedAt": "2026-08-23T10:02:00Z",
  "clientCreatedAt": "2026-08-23T10:05:00Z",
  "location": {
    "type": "Point",
    "coordinates": [80.3, 12.9]
  }
}
```

#### Response Body (200 OK):
```json
{
  "clientId": "ev_uuid_2222",
  "serverId": "660d3d5d787be21a48c56c33",
  "status": "SYNCED"
}
```

---

### Endpoint: `POST /api/v1/sync/batch`
Synchronizes multiple entities in a single request. If one fails, others continue processing (**Partial Batch Success**).

#### Request Body:
```json
{
  "incidents": [
    {
      "clientId": "inc_uuid_1111",
      "title": "Incident 1",
      "priority": "LOW",
      "clientCreatedAt": "2026-08-23T10:00:00Z",
      "items": []
    },
    {
      "clientId": "inc_uuid_invalid", // Will fail validation (missing priority)
      "title": "Incident 2",
      "clientCreatedAt": "2026-08-23T10:00:00Z",
      "items": []
    }
  ],
  "evidences": [
    {
      "clientId": "ev_uuid_2222",
      "incidentId": "inc_uuid_1111",
      "mediaType": "image",
      "url": "https://maris.s3.amazonaws.com/img.jpg",
      "fileHash": "unique_hash_9999",
      "capturedAt": "2026-08-23T10:00:00Z",
      "clientCreatedAt": "2026-08-23T10:00:00Z"
    }
  ]
}
```

#### Response Body (200 OK):
```json
{
  "status": "success",
  "results": {
    "incidents": [
      {
        "clientId": "inc_uuid_1111",
        "serverId": "660d3d5d787be21a48c56c22",
        "status": "SYNCED"
      },
      {
        "clientId": "inc_uuid_invalid",
        "status": "FAILED",
        "error": "Request validation failed: priority is required"
      }
    ],
    "evidences": [
      {
        "clientId": "ev_uuid_2222",
        "serverId": "660d3d5d787be21a48c56c33",
        "status": "SYNCED"
      }
    ]
  }
}
```

---

### Endpoint: `GET /api/v1/sync/status/:clientId`
Checks the sync status of a client-side UUID.

#### Response Body (200 OK):
```json
{
  "clientId": "inc_uuid_1111",
  "serverId": "660d3d5d787be21a48c56c22",
  "status": "SYNCED" // Or "CONFLICT" or "NOT_FOUND"
}
```

---

## 4. Conflict Resolution Rules

- **Client ID Matches, Content Matches**: Treated as an identical retry (e.g. timeout on previous response). Returns `200 OK` with status `SYNCED`.
- **Client ID Matches, Content Differs**: Handled as `CONFLICT` status. The server returns the conflict state without modifying the server database record, letting the client decide to overwrite (using `PUT` or `PATCH`) or discard local changes.
- **Evidence File Hash Duplicate**: If an evidence file is synced with a different `clientId` but matches an existing S3 URL or SHA-256 hash, it returns `CONFLICT` to prevent duplicate media indexing.
