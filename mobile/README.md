# MARIS Mobile — Marine Intelligence & Public Coastal Portal

React Native Mobile Application for the MARIS Platform.

## Prerequisites
* **Node.js**: `>= 18.0.0`
* **Android SDK**: Installed at `C:\Users\akshat\AppData\Local\Android\Sdk`
* **Android Emulator AVD**: `Medium_Phone_API_36.1` (or any configured AVD)
* **ADB Tooling**: `C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools\adb.exe`

---

## 📱 How to Run the App on Android Emulator

Follow these step-by-step commands to launch, bundle, build, and deploy the application to your Android Virtual Device:

### Step 1: Launch the Android Emulator
Run the emulator command pointing to your installed AVD:
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_36.1
```
*(Tip: To list all available AVDs on your machine, run: `C:\Users\akshat\AppData\Local\Android\Sdk\emulator\emulator.exe -list-avds`)*

---

### Step 2: Configure ADB Port Reverse Mapping
Map port `3001` so the Android emulator routes `http://10.0.2.2:3001` and `http://localhost:3001` directly to your local Express backend server:
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse tcp:3001 tcp:3001
```

---

### Step 3: Bundle React Native JS Assets
Pre-bundle offline JS assets into the Android native assets directory:
```powershell
cd mobile
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

---

### Step 4: Build the Android Debug APK
Compile the native APK using Gradle wrapper (utilizes parallel caching for 8s–10s fast builds):
```powershell
cd mobile/android
.\gradlew assembleDebug
```

---

### Step 5: Install APK to Running Emulator via ADB
Push and install the freshly built APK directly to your active emulator instance:
```powershell
C:\Users\akshat\AppData\Local\Android\Sdk\platform-tools\adb.exe install -r "d:\Project files\Personal\SIH 2026\Maris\definedvc.com\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

### Step 6: Start Backend & Live Dev Servers
Ensure the MARIS backend REST server is active on port `3001`:

```powershell
# Terminal 1: MARIS Backend Server (Port 3001)
cd backend
npm run dev

# Terminal 2: MARIS Frontend Web Portal (Port 5173)
cd frontend
npm run dev

# Terminal 3 (Optional for live hot-reload): Mobile Metro Bundler
cd mobile
npm start
```

---

## 🛠️ Code Quality & Type Verification

```bash
# Typecheck mobile TypeScript
cd mobile
npx tsc --noEmit

# Run ESLint validation
npm run lint
```

---

## 📁 Project Structure
```
mobile/
├── src/
│   ├── api/          # Modular REST API endpoints (intelligenceApi, tipsApi)
│   ├── components/   # Shared UI components & coordinate badges
│   ├── constants/    # Environment constants (API_BASE_URL: http://10.0.2.2:3001/api/v1)
│   ├── navigation/   # Bottom Dock Navigator (5 Light Mode Tabs)
│   ├── screens/      # Public Explorer, PFZ Map, Ask MARIS AI, Report Tip, Profile
│   ├── theme/        # Light Mode Theme Tokens (#f8fafc background, ocean blue)
│   └── types/        # TypeScript interfaces matching backend models
└── android/          # Android Native Project & Gradle build configs
```

---

## 🌐 Environment Configuration

Environment constants are defined in `mobile/src/constants/env.ts`:
```typescript
export const ENV = {
  API_BASE_URL: 'http://10.0.2.2:3001/api/v1',
  SOCKET_URL: 'http://10.0.2.2:3001',
};
```
*Note: `10.0.2.2` is the special Android Emulator loopback IP pointing to the host PC localhost.*
