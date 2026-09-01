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
- [📱 Mobile App & Android Emulator Setup](#-mobile-app--android-emulator-setup)
- [🛠️ Environment Variables Configuration](#%EF%B8%8F-environment-variables-configuration)
- [🚀 Quick Start & Development Setup](#-quick-start--development-setup)
- [🧪 Verification & Type Checking](#-verification--type-checking)
- [👥 Contributors](#-contributors)

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
| [`mobile/src/navigation/AppNavigator.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/mobile/src/navigation/AppNavigator.tsx) | React Native Light Mode 5-Tab Navigator |

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
| `/portal/admin` | [`PortalAdminPage.tsx`](file:///d:/Project%20files/Personal/SIH%202026/Maris/definedvc.com/frontend/src/portal/pages/PortalAdminPage.tsx) | User directory management & account creation |

---

## 📱 Mobile App & Android Emulator Setup

### 1. Launch Android Emulator AVD
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_36.1
```

### 2. Configure ADB Reverse Port Forwarding (Port 3001)
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse tcp:3001 tcp:3001
```

### 3. Pre-Bundle React Native Offline JS Assets
```powershell
cd mobile
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### 4. Build Debug APK
```powershell
cd mobile/android
.\gradlew assembleDebug
```

### 5. Install APK onto Android Emulator via ADB
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools\adb.exe install -r "d:\Project files\Personal\SIH 2026\Maris\definedvc.com\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file inside `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# MongoDB Configuration
MONGO_URI=mongodb+srv://login:login0903@cluster0.aiuqek6.mongodb.net/maris

# JWT Authentication
JWT_SECRET=super_secret_jwt_sign_key_change_in_production
JWT_EXPIRES_IN=1d

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites
- Node.js `v18+`
- Android SDK & Android Virtual Device (`Medium_Phone_API_36.1`)
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

# Install mobile dependencies
cd ../mobile
npm install
```

### 2. Start Development Servers
```bash
# Terminal 1: Start Backend API (Port 3001)
cd backend
npm run dev

# Terminal 2: Start Frontend Web Portal (Port 5173)
cd frontend
npm run dev

# Terminal 3: Mobile App Emulator Setup (See section above)
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Type Checking

To verify zero TypeScript compilation errors across all applications:

```bash
# Verify Frontend TypeScript compilation
cd frontend
npx tsc --noEmit

# Verify Backend TypeScript compilation
cd backend
npx tsc --noEmit

# Verify Mobile TypeScript compilation
cd mobile
npx tsc --noEmit
```

---

## 👥 Contributors

* **Akshat Singh** ([@Akshat-sin-official](https://github.com/Akshat-sin-official))
* **Jyotsna Singh** ([@jyotsnasinghcs28-rgb](https://github.com/jyotsnasinghcs28-rgb))
* **Ritesh Mishra** ([@dev-ritesh-09](https://github.com/dev-ritesh-09))
* **Anubhav Sachan**
