# MARIS Mobile — Marine Intelligence & Surveillance

React Native Mobile Application for the MARIS Platform.

## Prerequisites
*   Node.js (>= 22.11.0)
*   npm or yarn
*   Android SDK & Android Emulator (or physical device)
*   CocoaPods (for iOS build environment)

---

## Setup & Running

### 1. Installation
```bash
cd mobile
npm install
```

### 2. Launch Development Server
```bash
npm start
```

### 3. Run on Android Emulator / Device
Ensure an Android emulator is running or a device is connected via ADB:
```bash
npm run android
```

### 4. Code Quality & Type Check
```bash
npm run typecheck
npm run lint
npm test
```

---

## Project Structure
```
mobile/
├── src/
│   ├── app/          # Core App provider mounts
│   ├── navigation/   # React Navigation Tab & Stack configuration
│   ├── screens/      # Screen components (Home, Map, Ask MARIS, Observe, etc.)
│   ├── components/   # Shared UI components
│   ├── features/     # Modular business logic features
│   ├── services/     # API, Socket, and device hardware services
│   ├── api/          # Modular API HTTP client endpoints
│   ├── hooks/        # Reusable React hooks
│   ├── store/        # Global state management
│   ├── storage/      # Local persistence layer
│   ├── sync/         # Offline queue & synchronization engine
│   ├── types/        # TypeScript interfaces matching backend models
│   ├── constants/    # Theme and environment constants
│   ├── utils/        # Formatting and helper utilities
│   └── theme/        # MARIS marine color tokens and typography
```

---

## Environment Variables
Environment variables are defined in `.env.example`:
```bash
MOBILE_ENV=development
API_BASE_URL=http://10.0.2.2:3000/api/v1
SOCKET_URL=http://10.0.2.2:3000
```
*Note: `10.0.2.2` is the special alias to loop back to the host machine's localhost from an Android emulator.*
