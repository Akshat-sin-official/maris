# 🌊 MARIS Project Guidelines & Agent Instructions

This repository defines the MARIS (Marine Intelligence & Operational AI Frontier) platform. All AI coding assistants working in this workspace must adhere to the following mandatory guidelines:

---

## 1. Zero Mock Data Policy
* **No Mock Fallbacks:** Do NOT use hardcoded mock arrays, fake fallbacks, or simulated offline data.
* **Live REST Endpoints Only:** All data rendered in the portal must be fetched directly from MongoDB Atlas or live service REST APIs (`/api/v1/*`).
* **Authentication Envelope:** Auth requests return `{ status: "success", data: { user, accessToken } }`. Always attach `Authorization: Bearer <accessToken>` to outgoing request headers.

---

## 2. Agentic AI Integration & Resilience
* **Google Gemini AI:** Route all AI decision support queries through `GeminiService` (`/api/v1/ai/query`).
* **Candidate Model Loop:** Keep multi-model failover active: `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest` to avoid 503 cloud capacity spikes and 404 version deprecations.
* **JSON Fencing Sanitization:** Un-fence markdown blocks (```json ... ```) and recursively unwrap stringified `{ "answer": "..." }` responses.

---

## 3. Public Tipster Portal & Security Provenance
* **Public Route Access:** Keep `/report-tip` and `/tipster` accessible on the marketing website without login.
* **Background Device Provenance:** `POST /api/v1/tips/submit` MUST capture client IP, User-Agent, device type, screen resolution, browser OS, and timezone to calculate genuineness and distraction risk scores.
* **10-Digit Pseudonymous Receipt:** Return sanitized tip receipts (`TIP-XXXXXXXXXX`) for citizen status tracking.

---

## 4. Frontend Design & Map Controls
* **Vector Map Engine:** Use `maplibre-gl` with `optimizeDeps.exclude: ['maplibre-gl']` in Vite config.
* **Design System:** Use dark-matter themes, HSL colors, glassmorphism backdrop filters, and styled inline coordinate badges (`[79.31, 9.28]`).
* **Compilation Rule:** Ensure `npx tsc --noEmit` compiles with 0 errors on both frontend and backend before declaring completion.
