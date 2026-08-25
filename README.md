# 🌊 MARIS — Marine Intelligence & Operational AI Frontier®
> **Smart India Hackathon (SIH 2026) | Problem Statement 26176 Solution**

MARIS is an agentic marine intelligence platform combining multi-agent decision support, live hydrographic sensor data, spatial GIS mapping, anonymous public tip provenance, and control room alert management.

---

## 📌 Table of Contents
- [🌊 System Overview](#-system-overview)
- [✨ Key Features](#-key-features)
- [📁 Project Structure & Redirection Index](#-project-structure--redirection-index)
- [⚙️ Backend API & Controller Reference](#%EF%B8%8F-backend-api--controller-reference)
  - [1. Authentication & User Management](#1-authentication--user-management)
  - [2. Agentic AI & Decision Support](#2-agentic-ai--decision-support)
  - [3. Incidents & Confidential Tipster System](#3-incidents--confidential-tipster-system)
  - [4. Hydrographic Intelligence & Telemetry](#4-hydrographic-intelligence--telemetry)
  - [5. Field Observations & Media Evidence](#5-field-observations--media-evidence)
  - [6. Oceanographic Reports](#6-oceanographic-reports)
  - [7. External Provider Adapters](#7-external-provider-adapters)
- [🖥️ Frontend Pages & Navigation](#%EF%B8%8F-frontend-pages--navigation)
- [🛠️ Environment Variables Configuration](#%EF%B8%8F-environment-variables-configuration)
- [🚀 Quick Start & Development Setup](#-quick-start--development-setup)
- [🧪 Verification & Type Checking](#-verification--type-checking)

---

## 🌊 System Overview

MARIS bridges field observations, marine sensor telemetry (INCOIS ERDDAP, OpenWeatherMap, Copernicus Marine CMEMS, OpenStreetMap Overpass), and Google Gemini AI to empower coastal enforcement agencies, researchers, and control room operators.

```text
                                  ┌──────────────────────────────┐
                                  │      Public Tipster Portal   │
                                  │    (/report-tip, /tipster)   │
                                  └──────────────┬───────────────┘
                                                 │ Device Provenance & IP
                                                 ▼
┌─────────────────────────────┐   ┌──────────────────────────────┐   ┌─────────────────────────────┐
│  MapLibre GL Vector Engine  │◄──┤  MARIS React + Vite Frontend ├──►│ Google Gemini AI Pipeline   │
│  (Live Vessel Telemetry)    │   │  (Dark Matter Glassmorphism) │   │ (Multi-Model Candidate Loop)│
└─────────────────────────────┘   └──────────────┬───────────────┘   └─────────────────────────────┘
                                                 │ Bearer JWT REST APIs
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │ Express + Socket.IO Backend  │
                                  │  (Winston ISO Logger Stream) │
                                  └──────────────┬───────────────┘
                                                 │
                                  ┌──────────────┴───────────────┐
                                  ▼                              ▼
                   ┌────────────────────────────┐  ┌────────────────────────────┐
                   │   MongoDB Atlas Database   │  │   MinIO Evidence Storage   │
                   │ (Users, Incidents, Tips)   │  │  (Images, Media Provenance)│
                   └────────────────────────────┘  └────────────────────────────┘
```

---

## ✨ Key Features

1. **Google Gemini AI Agentic Engine**:
   - Multi-agent orchestration loop (`Planner` → `Marine` → `Weather` → `Ocean` → `Geospatial` → `PFZ` → `Risk` → `Explain`).
   - Candidate failover loop (`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest`) preventing 404 version deprecation and 503 capacity spikes.
   - Markdown JSON un-fencing & stringified response unwrapping.

2. **Interactive Control Room & `Ask MARIS AI ⌘K`**:
   - Global `⌘K` / `Ctrl+K` keypress shortcut and header trigger.
   - Structured answer UI with Markdown bullet cards, Risk badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), Confidence meters, and Actionable Protocol cards.

3. **Public Tipster Portal with Provenance Scoring**:
   - Unauthenticated public endpoints (`POST /api/v1/tips/submit`, `GET /api/v1/tips/track/:tipsterId`).
   - Captures client IP, User-Agent, device resolution, timezone, and calculates genuineness & distraction risk scores.
   - Generates 10-digit pseudonymous receipt (`TIP-XXXXXXXXXX`).

4. **Dual Data Operational Modes**:
   - **Live API Connected**: Fetches 100% real live data directly from MongoDB Atlas & live service REST endpoints (`/api/v1/*`).
   - **Simulated Baseline**: Serves offline baseline mock data for demo preview when internet is disconnected.

---

## 📁 Project Structure & Redirection Index

| Directory / File | Description |
| :--- | :--- |
| [`backend/src/server.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/server.ts) | Backend entry point, HTTP server & Socket.IO initialization |
| [`backend/src/app.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/app.ts) | Express app setup, CORS, Helmet, HTTP request logger middleware |
| [`backend/src/config/logger.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/config/logger.ts) | Winston logger with ISO-8601 timestamps and level badges |
| [`backend/src/config/seed.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/config/seed.ts) | Database seeder script for system users & initial incidents |
| [`backend/src/auth/auth.controller.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/auth/auth.controller.ts) | User authentication & JWT issuance handlers |
| [`backend/src/users/user.controller.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/users/user.controller.ts) | User directory CRUD & role assignment handlers |
| [`backend/src/agents/agent.controller.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/agents/agent.controller.ts) | Agentic AI query orchestration controller |
| [`backend/src/integration/services/gemini.service.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/services/gemini.service.ts) | Google Gemini AI service wrapper & model failover loop |
| [`backend/src/incidents/tip.controller.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/incidents/tip.controller.ts) | Confidential tipster submission & triage handlers |
| [`frontend/src/portal/components/AskMarisAiModal.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/components/AskMarisAiModal.tsx) | `⌘K` Interactive MARIS AI command modal component |
| [`frontend/src/portal/components/PortalMapCanvas.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/components/PortalMapCanvas.tsx) | MapLibre GL spatial map engine component |
| [`frontend/src/portal/services/api.ts`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/services/api.ts) | Frontend API REST client & simulated mode interceptor |

---

## ⚙️ Backend API & Controller Reference

### 1. Authentication & User Management
* **`login(req, res)`** — [`auth.controller.ts:L120`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/auth/auth.controller.ts#L120)
  - Endpoint: `POST /api/v1/auth/login`
  - Validates email & password, queries MongoDB Atlas, returns `{ status: "success", data: { user, accessToken } }`.
* **`register(req, res)`** — [`auth.controller.ts:L22`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/auth/auth.controller.ts#L22)
  - Endpoint: `POST /api/v1/auth/register`
  - Registers a new user account with hashed password (`bcrypt.hash`) and assigns default role.
* **`getUsers(req, res)`** — [`user.controller.ts:L55`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/users/user.controller.ts#L55)
  - Endpoint: `GET /api/v1/users`
  - Retrieves all staff user documents from MongoDB Atlas sorted by `createdAt: -1`.
* **`createUser(req, res)`** — [`user.controller.ts:L102`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/users/user.controller.ts#L102)
  - Endpoint: `POST /api/v1/users`
  - Admin endpoint to seed operational staff credentials (`CONTROL_ROOM`, `RESEARCHER`, `COASTAL_OFFICER`, `ADMIN`).
* **`updateUser(req, res)`** — [`user.controller.ts:L150`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/users/user.controller.ts#L150)
  - Endpoint: `PATCH /api/v1/users/:id`
  - Updates user role, active status, or badge credentials.

---

### 2. Agentic AI & Decision Support
* **`queryAgents(req, res)`** — [`agent.controller.ts:L35`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/agents/agent.controller.ts#L35)
  - Endpoint: `POST /api/v1/ai/query`
  - Executes 8-stage multi-agent reasoning and synthesizes output via Google Gemini AI (`GeminiService`).
* **`analyzeMarineQuery(query, context)`** — [`gemini.service.ts:L45`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/services/gemini.service.ts#L45)
  - Sequential candidate model failover (`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest`), markdown un-fencing, and nested JSON unwrapping.

---

### 3. Incidents & Confidential Tipster System
* **`submitTip(req, res)`** — [`tip.controller.ts:L24`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/incidents/tip.controller.ts#L24)
  - Endpoint: `POST /api/v1/tips/submit` (Public Access)
  - Captures device provenance, calculates genuineness score & distraction risk, and returns `TIP-XXXXXXXXXX` receipt.
* **`trackTipStatus(req, res)`** — [`tip.controller.ts:L78`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/incidents/tip.controller.ts#L78)
  - Endpoint: `GET /api/v1/tips/track/:tipsterId` (Public Access)
  - Retrieves sanitized tip status without exposing confidential submitter IP or device metadata.
* **`listControlRoomTips(req, res)`** — [`tip.controller.ts:L112`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/incidents/tip.controller.ts#L112)
  - Endpoint: `GET /api/v1/tips/control-room` (Protected Staff Access)
  - Fetches all submitted tips for control room triage.
* **`convertTipToIncident(req, res)`** — [`tip.controller.ts:L185`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/incidents/tip.controller.ts#L185)
  - Endpoint: `POST /api/v1/tips/:id/convert-to-incident`
  - Promotes a verified tip to an official operational incident case.

---

### 4. Hydrographic Intelligence & Telemetry
* **`lookupByCoordinates(req, res)`** — [`intelligence.controller.ts:L240`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/intelligence/intelligence.controller.ts#L240)
  - Endpoint: `GET /api/v1/intelligence/lookup`
  - Fetches merged OpenWeatherMap weather, CMEMS ocean conditions, INCOIS PFZ fronts, and OSM sanctuary geofences.
* **`getLiveLocations(req, res)`** — [`intelligence.controller.ts:L180`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/intelligence/intelligence.controller.ts#L180)
  - Endpoint: `GET /api/v1/intelligence/live-locations`
  - Streams spatial telemetry for active patrol vessels, trawlers, and sensor buoys.

---

### 5. Field Observations & Media Evidence
* **`createObservation(req, res)`** — [`observation.controller.ts:L40`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/observations/observation.controller.ts#L40)
  - Endpoint: `POST /api/v1/observations`
  - Records field officer observations with geo-coordinates and initial priority rating.
* **`uploadEvidence(req, res)`** — [`evidence.controller.ts:L35`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/evidence/evidence.controller.ts#L35)
  - Endpoint: `POST /api/v1/evidence`
  - Uploads media artifacts (photos/videos) to MinIO Object Storage and records file checksum.

---

### 6. Oceanographic Reports
* **`getReports(req, res)`** — [`report.controller.ts:L30`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/reports/report.controller.ts#L30)
  - Endpoint: `GET /api/v1/reports`
  - Lists published marine research reports and operational bulletins.
* **`createReport(req, res)`** — [`report.controller.ts:L80`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/reports/report.controller.ts#L80)
  - Endpoint: `POST /api/v1/reports`
  - Creates a new report draft with markdown content and tags.

---

### 7. External Provider Adapters
* **`OpenWeatherProvider`** — [`OpenWeatherProvider.ts:L25`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/adapters/OpenWeatherProvider.ts#L25)
  - Queries OpenWeatherMap REST API for temperature, wind speed, pressure, and humidity.
* **`CopernicusMarineProvider`** — [`CopernicusMarineProvider.ts:L15`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/adapters/CopernicusMarineProvider.ts#L15)
  - Queries Copernicus CMEMS ocean current velocities & sea surface temperature.
* **`INCOISErddapProvider`** — [`INCOISErddapProvider.ts:L15`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/adapters/INCOISErddapProvider.ts#L15)
  - Queries INCOIS ERDDAP data server for Potential Fishing Zone (PFZ) thermal front advisories.
* **`OverpassGeospatialProvider`** — [`OverpassGeospatialProvider.ts:L20`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/backend/src/integration/adapters/OverpassGeospatialProvider.ts#L20)
  - Queries OpenStreetMap Overpass API for marine protected area polygons.

---

## 🖥️ Frontend Pages & Navigation

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | [`PublicHomePage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PublicHomePage.tsx) | Marketing website & public platform overview |
| `/report-tip` | [`ReportTipPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/ReportTipPage.tsx) | Public anonymous tip submission form |
| `/tipster` | [`TipsterStatusPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/TipsterStatusPage.tsx) | Citizen tip receipt tracking portal |
| `/portal/login` | [`PortalLoginPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalLoginPage.tsx) | Operational sign in & role selector |
| `/portal/dashboard` | [`PortalDashboardPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalDashboardPage.tsx) | Main control room operational dashboard |
| `/portal/map` | [`PortalLiveMapPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalLiveMapPage.tsx) | Full-screen MapLibre GL GIS spatial map |
| `/portal/alerts` | [`PortalAlertsPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalAlertsPage.tsx) | Hazard alerts & situation dispatch table |
| `/portal/tips` | [`PortalTipsterPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalTipsterPage.tsx) | Control room tipster triage & incident conversion |
| `/portal/pfz` | [`PortalPfzPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalPfzPage.tsx) | Potential Fishing Zone thermal front advisories |
| `/portal/admin` | [`PortalAdminPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalAdminPage.tsx) | User directory management & account creation |
| `/portal/ai` | [`PortalMarisAiPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalMarisAiPage.tsx) | Google Gemini AI assistant conversation page |

---

## 🛠️ Environment Variables Configuration

Create a `.env` file inside `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.aiuqek6.mongodb.net/maris

# JWT Authentication
JWT_SECRET=super_secret_jwt_sign_key_change_in_production
JWT_EXPIRES_IN=1d

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_openweather_key_here

# Copernicus Marine Service
COPERNICUS_USERNAME=your_username
COPERNICUS_PASSWORD=your_password

# MinIO Object Storage
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=maris-evidence
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- Node.js `v18+`
- MongoDB Atlas cluster URI or local MongoDB
- npm or yarn

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Akshat-sin-official/maris.git
cd maris

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Database Seeding
```bash
# Seed initial operational users and incidents into MongoDB Atlas
cd backend
npm run seed
```

### 3. Start Development Servers
```bash
# Terminal 1: Start Backend API (Port 3000)
cd backend
npm run dev

# Terminal 2: Start Frontend Web Portal (Port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Type Checking

To verify zero TypeScript compilation errors across both applications:

```bash
# Verify Frontend TypeScript compilation
cd frontend
npx tsc --noEmit

# Verify Backend TypeScript compilation
cd backend
npx tsc --noEmit
```
