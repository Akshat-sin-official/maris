# MARIS Database Schema Documentation

This document describes the Mongoose schemas, indexes, relationships, validations, and security isolation rules for the **MARIS** database platform.

---

## 1. Database Model Overview (ER-Style Relationships)

Since MARIS is built on MongoDB, the database layout leverages nested subdocuments (embedding) for tightly coupled lifecycles (such as incident items and verifications) to keep queries atomic, while referencing collections for unbounded or independent entities (such as users, evidence uploads, and organizations).

```
  +------------------+                   +------------------+
  |   Organization   |                   |       User       |
  |------------------|                   |------------------|
  | _id (PK)         |<------------------| _id (PK)         |
  | name             |                   | name             |
  | code (Unique)    |                   | email (Unique)   |
  | isActive         |                   | role             |
  +------------------+                   | orgId (FK, Opt)  |
           ^                             +------------------+
           |                                   ^   ^   ^
           |                                   |   |   |
           +-----------------+                 |   |   |
                             |                 |   |   |
  +------------------+       |                 |   |   |
  |     Evidence     |       |                 |   |   |
  |------------------|       |                 |   |   |
  | _id (PK)         |       |                 |   |   |
  | uploadedBy (FK) -+-------+-----------------+   |   |
  | orgId (FK, Opt) -+-------+                     |   |
  | mediaType        |       |                     |   |
  | url, fileHash    |       |                     |   |
  | location (Nested)|       |                     |   |
  +------------------+       |                     |   |
           ^                 |                     |   |
           |                 v                     |   |
  +------------------+    +------------------+     |   |
  |   Observation    |    |     Incident     |     |   |
  |------------------|    |------------------|     |   |
  | _id (PK)         |    | _id (PK)         |     |   |
  | observerId (FK) -+----+ orgId (FK)       |     |   |
  | orgId (FK, Opt) -+    | assignedTo (FK) -+-----+   |
  | location (Point) |    | status, priority |         |
  | category, value  |    | items (Embedded) |         |
  | evidenceIds (FK) |    | timeline (Nested)|         |
  | verification(Emb)|    +------------------+         |
  +------------------+             ^                   |
                                   |                   |
  +------------------+             |                   |
  |    Assignment    |             |                   |
  |------------------|             |                   |
  | _id (PK)         |             |                   |
  | orgId (FK)       |             |                   |
  | assigneeId (FK) -+-------------+-------------------+
  | targetId (FK) ---+             
  | targetType (Enum)|
  | status           |
  +------------------+
```

---

## 2. Detailed Schema Definitions

### Location (Embedded Subdocument Schema)
* **Purpose**: Represents GeoJSON coordinates. Used nested inside Evidence, Incidents, Observations, PFZs, and Alerts.
* **Fields**:
  * `type` (String, enum: `Point`, `Polygon`, `MultiPolygon`) [Required]
  * `coordinates` (Mixed) [Required]
* **Validation**: Checks that coordinates is an array structure.
* **Security Considerations**: Ensures coordinates match valid decimal boundaries.

### Evidence
* **Purpose**: Immutable registry of photos, videos, and voice recordings captured by field officers.
* **Fields**:
  * `orgId` (ref: `Organization`, Nullable) [Optional]
  * `uploadedBy` (ref: `User`) [Required]
  * `mediaType` (enum: `image`, `video`, `audio`) [Required]
  * `url` (String) [Required]
  * `fileHash` (String, SHA-256 validation) [Required]
  * `location` (LocationSchema) [Optional]
  * `deviceMetadata` (Mixed) [Optional]
  * `capturedAt` (Date) [Required]
* **Indexes**:
  * `fileHash` (Unique, index) - Prevents duplicate evidence submission.
  * `orgId` (index), `uploadedBy` (index).
* **Security Considerations**: Access to evidence files is bound by `orgId`. Citizens have `orgId: null` and can only view their own uploads.

### Incident
* **Purpose**: Represents operational cases (e.g. vessel intrusions, hazard areas) with nested subdocuments.
* **Fields**:
  * `orgId` (ref: `Organization`) [Required]
  * `title` (String) [Required]
  * `description` (String) [Optional]
  * `status` (enum: `REPORTED`, `UNDER_INVESTIGATION`, `RESOLVED`, `CLOSED`) [Required]
  * `priority` (enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) [Required]
  * `assignedTo` (ref: `User`, Nullable) [Optional]
  * `items` (Array of Embedded `IncidentItemSchema`) [Default empty]
  * `timeline` (Array of Embedded `TimelineEventSchema`) [Default empty]
* **Indexes**:
  * `orgId` (index) - Enforces database-level isolation.
  * `status` (index), `priority` (index), `assignedTo` (index).
  * `items.location` (2dsphere) - Supports spatial query searches for targets inside warning polygons.
* **Embedded IncidentItem Schema**:
  * `type` (enum: `vessel_detection`, `oil_slick`, `unauthorized_entry`, `marine_life_hazard`) [Required]
  * `location` (LocationSchema) [Required]
  * `detectedAt` (Date) [Required]
  * `details` (Mixed)
* **Embedded TimelineEvent Schema**:
  * `eventType` (enum: `CREATED`, `ASSIGNED`, `STATUS_UPDATE`, `PRIORITY_UPDATE`, `VERIFICATION_SUBMITTED`, `RESOLVED`, `CLOSED`) [Required]
  * `actorId` (ref: `User`) [Required]
  * `message` (String) [Required]
  * `timestamp` (Date) [Default Date.now]
* **Security Considerations**: Strictly isolated at the organization level (`orgId`). Staff can only view and update incidents belonging to their own organization.

### Observation
* **Purpose**: Records environment data (temperature, chlorophyll) and sightings.
* **Fields**:
  * `orgId` (ref: `Organization`, Nullable) [Optional]
  * `observerId` (ref: `User`) [Required]
  * `location` (LocationSchema - Point) [Required]
  * `category` (enum: `sst`, `chlorophyll`, `vessel_sighting`, `wildlife`, `weather_hazard`) [Required]
  * `value` (String) [Required]
  * `confidence` (Number, 0.0 - 1.0) [Required]
  * `evidenceIds` (Array of ref: `Evidence`) [Default empty]
  * `verification` (Embedded `VerificationSchema`)
  * `timestamp` (Date) [Required]
* **Indexes**:
  * `location` (2dsphere) - Supports geospatial radius querying.
  * `category` (index), `timestamp` (index), `orgId` (index).
* **Embedded Verification Schema**:
  * `status` (enum: `UNVERIFIED`, `VERIFIED`, `REJECTED`) [Required, default: UNVERIFIED]
  * `verifiedBy` (ref: `User`, Nullable) [Optional]
  * `verifiedAt` (Date, Nullable) [Optional]
  * `notes` (String) [Optional]
* **Security Considerations**: Environmental observations may be shared globally (e.g. PFZ computations), but target sightings (vessels) are isolated based on the observer's `orgId`.

### Assignment
* **Purpose**: Tracks work orders issued to Field Officers.
* **Fields**:
  * `orgId` (ref: `Organization`) [Required]
  * `assigneeId` (ref: `User`) [Required]
  * `assignedById` (ref: `User`) [Required]
  * `targetType` (enum: `Incident`, `Observation`) [Required]
  * `targetId` (ObjectId, dynamic reference based on `targetType`) [Required]
  * `status` (enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) [Required, default: PENDING]
  * `notes` (String) [Optional]
* **Indexes**:
  * `orgId` (index) - Enforces isolation.
  * `assigneeId` (index), `status` (index).
* **Security Considerations**: Only administrative staff in the same organization can issue, view, or update assignments.

### Alert
* **Purpose**: Real-time warnings (cyclones, spills, sanctuary violations) with spatial scopes.
* **Fields**:
  * `orgId` (ref: `Organization`, Nullable) [Optional]
  * `type` (enum: `STORM`, `OIL_SPILL`, `SHELTER_ZONE_VIOLATION`, `PFZ_CROSSING`) [Required]
  * `severity` (enum: `INFO`, `WARNING`, `CRITICAL`) [Required]
  * `area` (LocationSchema - Polygon) [Required]
  * `confidence` (Number, 0.0 - 1.0) [Required]
  * `evidenceStrength` (enum: `WEAK`, `MODERATE`, `STRONG`) [Required]
  * `sources` (Array of Strings) [Required]
* **Indexes**:
  * `area` (2dsphere) - Checks intersection query bounds.
  * `severity` (index), `orgId` (index).
* **Security Considerations**: Organization-gated alerts are hidden from other agencies. Weather-type hazards can be marked `orgId: null` for global viewing.

### PFZ (Potential Fishing Zone)
* **Purpose**: Coordinates representing high-yield ocean spots.
* **Fields**:
  * `area` (LocationSchema - Polygon) [Required]
  * `sstGradient` (Number) [Required]
  * `chlorophyllConcentration` (Number) [Required]
  * `confidence` (Number, 0.0 - 1.0) [Required]
  * `validFrom` (Date) [Required]
  * `validTo` (Date) [Required]
* **Indexes**:
  * `area` (2dsphere) - Pinpoints intersections with vessel paths.
  * `validFrom` (index), `validTo` (index).
* **Security Considerations**: PFZ coordinates are generally shared globally to authorized users (Citizens and matching staff agencies).

### Communication
* **Purpose**: Stores text messages sent across incidents and channels.
* **Fields**:
  * `orgId` (ref: `Organization`) [Required]
  * `senderId` (ref: `User`) [Required]
  * `recipientId` (ref: `User`, Nullable) [Optional]
  * `channel` (String) [Required]
  * `message` (String) [Required]
* **Indexes**:
  * `orgId` (index) - Gated organization boundaries.
  * `channel` (index).
* **Security Considerations**: Transmissions are restricted to organization members on the same incident channels.

### HistoricalMatch
* **Purpose**: Links similar cases for ML pattern matching.
* **Fields**:
  * `sourceIncidentId` (ref: `Incident`) [Required]
  * `matchedIncidentId` (ref: `Incident`) [Required]
  * `similarityScore` (Number, 0.0 - 1.0) [Required]
  * `matchingFeatures` (Array of Strings) [Required]
* **Indexes**:
  * `sourceIncidentId` (index).
  * `similarityScore` (index).

### PrioritySignal
* **Purpose**: Key configurations for automated risk scoring calculations.
* **Fields**:
  * `ruleName` (String) [Required, Unique]
  * `factor` (String) [Required]
  * `weight` (Number) [Required]
  * `isActive` (Boolean) [Default true]
* **Indexes**:
  * `ruleName` (Unique, index).
