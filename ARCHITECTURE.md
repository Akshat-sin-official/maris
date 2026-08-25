# 🌊 MARIS Architecture & System Design

**MARIS** (Marine Intelligence & Operational AI Frontier) is an enterprise-grade agentic marine reasoning and operational control room platform designed for SIH Problem Statement 26176.

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Client Layer (React + Vite + TypeScript)"]
        UI["Web Portal UI\n(Dark Matter Design System)"]
        Map["MapLibre GL\nSpatial Vector Engine"]
        Modal["Ask MARIS AI\n⌘K Command Modal"]
        APIClient["API Client & Offline Interceptor\n(api.ts)"]
        SocketClient["Socket.IO Client\n(socket.ts)"]
    end

    subgraph Backend["Backend Layer (Node.js + Express + TypeScript)"]
        Auth["RBAC & Auth Guard\n(JWT + Role Aliases)"]
        RESTRouter["REST API Router\n(/api/v1/*)"]
        SocketServer["Socket.IO Realtime Engine\n(Control Room Rooms)"]
        WinstonLogger["Enterprise Winston Logger\n(ISO Timestamps & Standardized Badges)"]
    end

    subgraph AgenticAI["Agentic AI Pipeline"]
        Orchestrator["Multi-Agent Orchestrator\n(agent.controller.ts)"]
        AgentLoop["8-Stage Agent Pipeline\n(Planner → Marine → Weather → Ocean → Geo → PFZ → Risk → Explain)"]
        GeminiService["Google Gemini AI Service\n(GeminiService.ts)"]
        FailoverLoop["Candidate Model Failover Loop\n(gemini-3.6-flash → gemini-3.5-flash → gemini-flash-latest)"]
    end

    subgraph Integrations["External Hydrographic Data Providers"]
        OWM["OpenWeatherMap API\n(Coastal Weather & Wind Vectors)"]
        CMEMS["Copernicus Marine Service\n(SST & Ocean Current Velocities)"]
        INCOIS["INCOIS ERDDAP Server\n(PFZ Thermal Front Advisories)"]
        OSM["OpenStreetMap Overpass API\n(Marine Sanctuary Geofences)"]
    end

    subgraph Storage["Data & Persistence Layer"]
        Mongo["MongoDB Atlas Cluster\n(Users, Incidents, Tips, Reports, Observations)"]
        MinIO["MinIO Object Storage\n(Evidence Photos & Videos)"]
    end

    UI --> APIClient
    UI --> Map
    Modal --> APIClient
    APIClient --> Auth
    SocketClient <--> SocketServer

    Auth --> RESTRouter
    RESTRouter --> Mongo
    RESTRouter --> MinIO
    RESTRouter --> Orchestrator

    Orchestrator --> AgentLoop
    AgentLoop --> Integrations
    Orchestrator --> GeminiService
    GeminiService --> FailoverLoop

    Integrations --> OWM
    Integrations --> CMEMS
    Integrations --> INCOIS
    Integrations --> OSM

    SocketServer --> UI
```

---

## 2. End-to-End Operational Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Control Room Operator
    participant UI as Portal UI (React)
    participant REST as Backend REST API (/api/v1)
    participant AI as Agentic AI Pipeline
    participant Gemini as Google Gemini AI Engine
    participant Providers as External Providers (INCOIS / OWM)
    participant DB as MongoDB Atlas

    Operator->>UI: Submit Query / Click "Ask MARIS AI" (⌘K)
    UI->>REST: POST /api/v1/ai/query (Bearer Token + Coordinates)
    REST->>REST: Authenticate JWT & Verify RBAC Staff Permission
    REST->>AI: Trigger Agentic Pipeline (8 Specialized Agents)
    AI->>Providers: Fetch Hydrographic Telemetry (SST, Weather, Geofences)
    Providers-->>AI: Return Spatial & Sensor Data
    AI->>Gemini: Synthesize Analysis via Gemini Multi-Model Loop (gemini-3.6-flash)
    Gemini-->>AI: Return Structured JSON (Answer, Risk Rating, Evidence, Recommendations)
    AI->>REST: Return Sanitized & Unwrapped AI Intelligence Object
    REST->>DB: Record Operational Audit Log
    REST-->>UI: 200 OK Response (JSON Payload)
    UI-->>Operator: Render Rich Markdown Cards, Risk Pills & Confidence Meter
```

---

## 3. Agentic AI Pipeline Architecture

```mermaid
graph LR
    subgraph Request["User Operational Query"]
        Q["Query + Coordinates"]
    end

    subgraph Pipeline["8-Stage Agent Sequence"]
        A1["1. Planner Agent"] --> A2["2. Marine Data Agent"]
        A2 --> A3["3. Weather Hazard Agent"]
        A3 --> A4["4. Ocean Intelligence Agent"]
        A4 --> A5["5. Geospatial Agent"]
        A5 --> A6["6. PFZ Agent"]
        A6 --> A7["7. Risk Reasoning Agent"]
        A7 --> A8["8. Explanation Agent"]
    end

    subgraph ModelLoop["Google Gemini Model Loop"]
        M1["gemini-3.6-flash (Primary)"]
        M2["gemini-3.5-flash (Secondary)"]
        M3["gemini-flash-latest (Tertiary)"]
        M1 -- HTTP 503/404 Failover --> M2
        M2 -- HTTP 503/404 Failover --> M3
    end

    subgraph Output["Synthesized Decision Support"]
        R["Answer + Risk Level + Evidence + Recommendations"]
    end

    Request --> A1
    A8 --> ModelLoop
    ModelLoop --> Output
```

---

## 4. Role-Based Access Control (RBAC) & Security Provenance

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated

    Unauthenticated --> CitizenMode: Public Route (/report-tip, /tipster)
    Unauthenticated --> AuthCheck: Login Form (/portal/login)

    state AuthCheck {
        [*] --> PasswordVerify
        PasswordVerify --> TokenGeneration: Valid Password
        PasswordVerify --> AccessDenied: Invalid Credentials
    }

    AuthCheck --> OperationalSession: Valid JWT Token

    state OperationalSession {
        [*] --> RoleResolver
        RoleResolver --> CONTROL_ROOM: Control Room Operator
        RoleResolver --> SUPERVISOR: Researcher
        RoleResolver --> FIELD_OFFICER: Coastal Field Officer
        RoleResolver --> ORG_ADMIN: System Administrator

        CONTROL_ROOM --> FullControlRoomAccess
        SUPERVISOR --> AnalyticsAndReports
        FIELD_OFFICER --> FieldVerification
        ORG_ADMIN --> UserDirectoryManagement
    }
```

---

## 5. Technology Stack Summary

| Layer | Component / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript | Modern, high-performance Single Page Application |
| **Map Engine** | MapLibre GL (`maplibre-gl`) | Vector map engine rendering live vessel locations, alerts, and PFZ layers |
| **Styling** | Dark Matter Design System, Glassmorphism, HSL | Premium, high-contrast dark and light mode UI components |
| **Backend Framework** | Node.js, Express, TypeScript | RESTful APIs & WebSocket server |
| **Realtime** | Socket.IO (`socket.io`) | Low-latency bi-directional control room event broadcasting |
| **Database** | MongoDB Atlas, Mongoose ODM | Cloud-hosted document database for persistent operational records |
| **Object Storage** | MinIO Storage Provider | S3-compatible media provenance storage for evidence uploads |
| **AI Decision Engine** | Google Gemini AI (`GeminiService`) | Resilient multi-agent reasoning with model failover loop |
| **Logging** | Winston (`winston`) | Enterprise ISO-8601 color-coded operational log stream |
