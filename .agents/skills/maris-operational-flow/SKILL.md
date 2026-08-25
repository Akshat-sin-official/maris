---
name: maris-operational-flow
description: >-
  Standard operational workflow and verification runbook for the MARIS Marine Intelligence Platform.
  Use when adding new features, testing live API integrations, verifying MongoDB models, or building new UI pages.
---

# MARIS Operational Flow & Verification Skill

This skill provides step-by-step procedures for extending and verifying the MARIS codebase.

---

## 1. System Environment Verification

Before making code edits, verify active services:

```bash
# Check Frontend TypeScript compilation
cd frontend
npx tsc --noEmit

# Check Backend TypeScript compilation
cd ../backend
npx tsc --noEmit
```

---

## 2. Testing Live Gemini AI Queries

To verify live Gemini AI query responses:

```bash
node -e "fetch('http://localhost:3000/api/v1/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'operator@maris.gov.in',password:'password123'})}).then(r=>r.json()).then(d=>fetch('http://localhost:3000/api/v1/ai/query', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+d.data.accessToken}, body:JSON.stringify({query:'What is the current swell warning near Gulf of Mannar?'})})).then(r=>r.json()).then(res=>console.log(JSON.stringify(res)))"
```

Expected Output:
`{"status":"success","data":{"llmEngine":"GOOGLE_GEMINI_LIVE", ...}}`

---

## 3. Testing Public Tipster Submission & Provenance Logging

To verify citizen tip submission with background device metadata:

```bash
node -e "fetch('http://localhost:3000/api/v1/tips/submit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({category:'SUSPICIOUS_VESSEL', title:'Unflagged Trawler Spotting', description:'Testing tipster provenance logging', location:{type:'Point', coordinates:[79.31, 9.28]}, clientMetadata:{deviceType:'DESKTOP', browser:'Chrome', os:'Windows 11', screenResolution:'1920x1080', language:'en-US', timezone:'Asia/Kolkata'}})}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d)))"
```

Expected Output:
`{"status":"success","message":"Tip submitted securely...","data":{"tipsterId":"TIP-XXXXXXXXXX", ...}}`

---

## 4. Operational Role Credentials Reference

| Email | Password | Role | Primary Focus |
| :--- | :--- | :--- | :--- |
| `operator@maris.gov.in` | `password123` | `CONTROL_ROOM_OPERATOR` | Incident Triage & Alerts |
| `researcher@maris.gov.in` | `password123` | `RESEARCHER` | Oceanographic SST & PFZ |
| `officer@maris.gov.in` | `password123` | `COASTAL_OFFICER` | Field Patrol Observations |
| `admin@maris.gov.in` | `password123` | `ADMIN` | System Health & SOC Audit |
