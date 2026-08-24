# MARIS — Secure Evidence Storage Architecture

This document describes the design, configuration, and security practices of the object storage layer in the MARIS platform.

## Object Storage System (MinIO)
For local development, MARIS uses **MinIO**, an open-source high-performance object storage server API-compatible with Amazon S3.

### Storage Abstraction (`StorageProvider`)
To avoid coupling business logic to MinIO, a storage provider interface is established in the backend:
*   [`StorageProvider`](file:///Users/riteshmishra/Developer/SIH-Project/backend/src/storage/storage.provider.ts): Defines standard contracts (`upload`, `download`, `delete`, `exists`, `getSignedUrl`).
*   [`MinioStorageProvider`](file:///Users/riteshmishra/Developer/SIH-Project/backend/src/storage/minio.provider.ts): Employs the `minio` Node.js client package to upload buffers, delete objects, and generate presigned GET URLs.

---

## Configuration Settings
Configurations are read from the environment:
```bash
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=maris-evidence
MINIO_USE_SSL=false
MAX_IMAGE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=50
```

---

## Directory Key Structures
Every file uploaded is mapped to a secure path using IDs to prevent revealing user identities:
*   **Incident Evidence**: `org/{organizationId}/incidents/{incidentId}/evidence/{evidenceId}.{ext}`
*   **Observation Evidence**: `org/{organizationId}/observations/{observationId}/evidence/{evidenceId}.{ext}`

---

## Production Migration Considerations
When moving to AWS, GCP, or Azure:
1.  Swap the active provider implementation to an S3 or Cloud Storage provider.
2.  Enable server-side KMS encryption (SSE-S3 or SSE-KMS) inside the bucket configurations.
3.  Configure IAM role-based service accounts (IRSA) rather than storing static key credentials on servers.
