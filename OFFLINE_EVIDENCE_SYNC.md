# MARIS — Offline Evidence Synchronization Specification

This document details the sync protocol and lifecycle stages of offline captured evidence for mobile clients and data syncing.

## Offline Capture Lifecycle
1.  **Capture**: Mobile device captures photo/video offline, generating a unique client-generated UUID `localEvidenceId` and saving the raw file to local storage.
2.  **State Gating**:
    *   `CAPTURED`: Local record saved.
    *   `QUEUED`: Network connection detected, file waiting for sync.
    *   `UPLOADING`: Synchronization of parent entities (Incident/Observation) completed, file upload active.
    *   `SYNCED`: Confirmed success by the server. Local temp file can now be safely recycled.

---

## Idempotent Sync Batches
To guarantee that retries are safe and do not create duplicate records on the server:
*   The client calculates a local `SHA-256` checksum of the file before uploading.
*   The server performs a uniqueness check on the `fileHash` before accepting the upload, preventing duplicate entries for the same file in the database.
*   If the parent Incident has not synchronized yet, the client queues the evidence upload behind it, resolves the server-assigned ObjectID, and then triggers the upload.
