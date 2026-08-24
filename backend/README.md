# MARIS Backend Core

The backend service acts as the orchestration and intelligence API engine for **MARIS (Agentic Marine Intelligence Platform)**, supporting JWT authentication, Role-Based Access Control (RBAC), multi-agent planning operations, offline-first synchronization pipelines, and real-time Socket.IO broadcasts.

---

## Technical Stack
* **Runtime**: Node.js & TypeScript
* **Server Framework**: Express
* **Database**: MongoDB via Mongoose
* **WebSockets**: Socket.IO
* **Validation**: Zod
* **Logger**: Winston
* **Testing**: Jest & Supertest

---

## Directory Structure
The application structure is organized around clean module boundaries:
```
backend/
├── src/
│   ├── config/             # Environment, Database, and Logger configs
│   ├── common/             # Standard error classes, exceptions, and constants
│   ├── middleware/         # Auth, validation, RBAC, and error handlers
│   ├── auth/               # Auth endpoints and token utility actions
│   ├── users/              # Users model and routing
│   ├── realtime/           # Socket.IO lifecycle managers
│   ├── sync/               # Syncing operations controller
│   ├── app.ts              # Express configuration
│   └── server.ts           # Boot and Graceful Shutdown configuration
├── tests/                  # Jest integration & system tests
├── Dockerfile              # Production multi-stage Docker build
├── docker-compose.yml      # Local MongoDB & Node service composer
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TS compiling guidelines
```

---

## Getting Started

### 1. Requirements
Ensure you have the following installed locally:
* **Node.js** (v20+ recommended)
* **MongoDB** (Running on port 27017) OR **Docker & Docker Compose**

### 2. Environment Setup
Clone the configuration values by creating a `.env` file from the provided example:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Database (Choose Option A or B)
* **Option A: Run MongoDB using Docker Compose**
  ```bash
  docker-compose up database -d
  ```
* **Option B: Run MongoDB locally (Directly on host)**
  Make sure your local mongod service is running:
  ```bash
  brew services start mongodb-community
  ```

### 5. Running the Application

* **Development Mode (Hot Reloading)**:
  ```bash
  npm run dev
  ```

* **Build Production Dist**:
  ```bash
  npm run build
  ```

* **Start Production Server**:
  ```bash
  npm run start
  ```

---

## Quality Assurance & Verification

* **Run Typechecks**:
  Verify code compiles cleanly without any strict-mode violations:
  ```bash
  npm run typecheck
  ```

* **Run Automated Tests**:
  Runs integration tests on endpoints:
  ```bash
  npm run test
  ```

---

## Core API Endpoints

### Health check
* **Method**: `GET`
* **Route**: `/api/v1/health`
* **Response**:
```json
{
  "status": "success",
  "timestamp": "2026-08-23T05:00:00.000Z",
  "uptime": 12.34,
  "services": {
    "database": {
      "status": "up",
      "state": "connected"
    },
    "api": {
      "status": "up"
    }
  }
}
```
