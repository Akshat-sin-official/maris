# MARIS — Evidence API Specification

This document details the REST endpoints exposed by the MARIS backend to upload, query, access, and delete forensic evidence files.

## REST Endpoints

### 1. Upload Evidence for Incident
*   **Path**: `POST /api/v1/incidents/:id/evidence`
*   **Content-Type**: `multipart/form-data`
*   **Payload (form-data)**:
    *   `file` (binary blob): The photo or video to upload.
    *   `capturedAt` (string ISO): Timestamp of creation.
    *   `location` (JSON string): `{ "type": "Point", "coordinates": [lng, lat] }`
    *   `deviceMetadata` (JSON string): Dictionary of camera/device parameters.
*   **Response**: `201 Created` with the Evidence metadata record.

### 2. Upload Evidence for Observation
*   **Path**: `POST /api/v1/observations/:id/evidence`
*   **Content-Type**: `multipart/form-data`
*   **Payload (form-data)**: Same format as incident uploads.
*   **Response**: `201 Created` with metadata.

### 3. Get Access Signed URL
*   **Path**: `GET /api/v1/evidence/:id/access`
*   **Response**:
    ```json
    {
      "status": "success",
      "url": "https://storage-endpoint.com/bucket/file?signature=...",
      "expiresAt": "2026-08-24T16:38:00Z"
    }
    ```
*   **Security Gating**: Active signed URL expires in exactly 1 hour. No storage access secrets are exposed to clients.

### 4. Delete Evidence
*   **Path**: `DELETE /api/v1/evidence/:id`
*   **Enforcement**: Restricted to the uploading officer or an administrator in the same organization. Deletes the physical file from the storage bucket and drops the metadata entry.
