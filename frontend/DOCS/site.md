Yep. I went through the **MARIS Frontend Requirements**, the **BRD**, the **Technical Approach**, and the complete **Lovable prompt** you shared. There is one important thing to keep straight:

* The **current marine frontend requirements + Lovable prompt** define the public MARIS website.
* The older BRD/technical approach contains a **wildlife-crime version of MARIS**, so I would **not use that content on this marine website** where it conflicts with the current marine requirements. The marine frontend spec explicitly positions MARIS as *Marine Intelligence & Surveillance*. 
* Your Lovable prompt is the most detailed source for the actual **public website page content**. 

## Complete public website structure

Apart from the landing page `/`, the website is supposed to have **9 additional content pages + 404**:

| Page                   | Route                 | Main purpose                                   |
| ---------------------- | --------------------- | ---------------------------------------------- |
| Home                   | `/`                   | Overall MARIS introduction                     |
| **Problem**            | `/problem`            | Explain the marine-data problem                |
| **Intelligence**       | `/intelligence`       | Explain how MARIS turns data into intelligence |
| **Agentic AI**         | `/agents`             | Explain the multi-agent architecture           |
| **Marine Data**        | `/marine-data`        | Explain data sources and provenance            |
| **Field Intelligence** | `/field-intelligence` | Explain offline/field capabilities             |
| **Use Cases**          | `/use-cases`          | Show real-world marine applications            |
| **Technology**         | `/technology`         | Explain technical architecture                 |
| **About MARIS**        | `/about`              | Vision, philosophy, SIH alignment              |
| **Contact / Demo**     | `/contact`            | Demo request                                   |
| **404**                | `/404`                | Marine-themed error page                       |

The frontend requirements independently confirm essentially this same public-page inventory: Home, Problem, Intelligence, Agentic AI, Marine Data, Field Intelligence, Use Cases, Technology, About and Contact/Demo, plus 404. 

---

# 1. Problem `/problem`

### Purpose

Answer:

> **Why does MARIS need to exist?**

### Hero

**The problem is not a lack of marine data.**

Subheading:

> It is the difficulty of turning fragmented marine information into timely, contextual and explainable decisions.

### Main visualization

Show:

**Satellite Data**
**Weather**
**Oceanographic Data**
**GIS**
**Marine Advisories**
**Field Observations**

↓

Different formats
Different sources
Different time scales
Different geographic contexts

↓

**Fragmented decision-making**

### Six challenges

#### 01 — Data Fragmentation

Relevant information is distributed across multiple marine, meteorological, geospatial and Earth Observation sources.

#### 02 — Complex Questions

Users don't ask:

> "Give me dataset X."

They ask:

> **"Is it safe to go tomorrow morning?"**

#### 03 — Spatial Reasoning

Recommendations depend on:

* location
* proximity
* boundaries
* environmental conditions

#### 04 — Temporal Reasoning

MARIS has to consider:

* current conditions
* forecasts
* historical trends
* changing hazards

#### 05 — Data Volume

Marine information is too large and heterogeneous for simple manual retrieval.

#### 06 — Explainability

Users need to understand **why** a recommendation was produced.

### Closing visual

```text
FRAGMENTED INFORMATION
        ↓
      MARIS
        ↓
CONNECTED INTELLIGENCE
        ↓
EXPLAINABLE ACTION
```

CTA:

**See the MARIS Intelligence Layer →**

---

# 2. Intelligence `/intelligence`

### Purpose

Explain the actual **intelligence layer**.

### Hero

# From marine data to marine intelligence.

Copy:

> MARIS does more than retrieve individual datasets. It correlates observations, understands context and produces explainable recommendations.

### Pipeline

```text
INGEST
   ↓
NORMALIZE
   ↓
UNDERSTAND
   ↓
CORRELATE
   ↓
REASON
   ↓
EXPLAIN
   ↓
RECOMMEND
```

This is one of the strongest diagrams on the entire website.

### Six intelligence capabilities

#### Marine Conditions

* SST
* waves
* currents
* sea-state
* related ocean conditions

#### Weather Intelligence

* wind
* rainfall
* forecasts
* severe weather

#### Hazard Intelligence

* cyclone
* lightning
* high-wave conditions
* marine advisories

#### PFZ Intelligence

Potential Fishing Zone information + contextual suitability.

#### Geospatial Intelligence

* location
* boundaries
* restricted zones
* protected areas
* distance relationships

#### Historical Intelligence

Comparison against:

* previous observations
* conditions
* field intelligence

### Explainability example

Show:

**WHY IS THIS LOCATION CONSIDERED HIGH RISK?**

```text
WEATHER
Strong winds

OCEAN
Elevated wave conditions

ALERT
Active marine warning

GEOSPATIAL
Operational restriction nearby

MARIS ASSESSMENT
HIGH RISK
```

This must be labelled **illustrative** rather than presented as actual live information.

CTA:

**Meet the Agents →**

---

# 3. Agentic AI `/agents`

This is probably one of the **most important pages** for SIH.

### Hero

# One intelligence engine. Specialized agents.

Copy:

> MARIS uses collaborative AI agents to decompose complex marine questions, select relevant tools, retrieve data, correlate evidence and synthesize recommendations.

### Main architecture

```text
                     USER
                       ↓
                PLANNER AGENT
                       ↓
       ┌───────┬───────┬───────┐
       ↓       ↓       ↓       ↓
   Weather   Ocean    GIS     PFZ
    Agent    Agent   Agent    Agent
       ↓       ↓       ↓       ↓
       └───────┴───────┴───────┘
                       ↓
              RISK / REASONING
                       ↓
                  EXPLANATION
                       ↓
                 RECOMMENDATION
```

### Eight agents

#### Planner Agent

Understands user intent and decomposes complex queries.

#### Marine Data Agent

Discovers and retrieves relevant marine datasets.

#### Weather & Hazard Agent

Assesses weather and marine hazard conditions.

#### Ocean Intelligence Agent

Reasons over oceanographic conditions.

#### Geospatial Agent

Handles:

* spatial relationships
* boundaries
* distances
* geofencing

#### PFZ Agent

Retrieves and contextualizes PFZ intelligence.

#### Risk & Reasoning Agent

Combines signals into an overall assessment.

#### Explanation Agent

Generates evidence-backed reasoning users can understand.

### Key statement

> **MARIS does not ask one model to do everything. It coordinates specialized capabilities around a shared reasoning workflow.**

This distinction matters because the requirements explicitly say the agents are coordinated software capabilities, **not eight separate products**. 

---

# 4. Marine Data `/marine-data`

### Hero

# The intelligence layer starts with trustworthy data.

### Data categories

#### Earth Observation

* Satellite-derived marine observations
* Ocean colour
* SST
* Chlorophyll

#### Oceanographic

* Waves
* Currents
* Sea-state
* Marine conditions

#### Meteorological

* Weather
* Wind
* Rain
* Severe-weather information

#### Marine Advisories

* Cyclone
* Lightning
* Marine alerts
* Hazard information

#### Geospatial

* Maps
* Boundaries
* Geofences
* Marine protected areas
* Restricted areas

#### Field

* Observations
* Photo/video
* GPS
* Time
* Notes

### Architecture

```text
External Sources
      ↓
Provider Adapters
      ↓
MARIS Normalization
      ↓
Unified Intelligence Layer
      ↓
AI Agents
```

The prompt suggests showing established sources such as:

* IMD
* INCOIS
* Copernicus Marine / Earth Observation
* OpenStreetMap
* Protected Planet / WDPA

**Important:** don't claim that MARIS currently has live connections to them unless it actually does.

### Data provenance

Show:

**Source**
**Retrieved**
**Valid period**
**Location**
**Data quality**

And emphasize:

> **Every recommendation should be traceable to the data and reasoning that supported it.**

This also directly matches the frontend requirement that source/provenance metadata should be shown where the backend provides it. 

---

# 5. Field Intelligence `/field-intelligence`

This is another major differentiator.

### Hero

# Marine intelligence, even when connectivity is weak.

### Main visual

A mobile device showing:

```text
FIELD OBSERVATION

📷 Capture
📍 GPS
🕐 Time
📝 Notes

[ Save Observation ]
```

Then:

```text
NO INTERNET

✓ Saved locally
⏳ Waiting for connection
```

Then:

```text
CONNECTION RESTORED

↑ Synchronizing
✓ Synced
```

### Features

#### Offline-first

Core field functions continue without active internet.

#### Evidence capture

* photo/video
* location
* time
* notes

#### Automatic sync

Pending records synchronize once connectivity returns.

#### Historical intelligence

Field information becomes part of the shared intelligence layer.

#### BiChat

Low-connectivity communication capability.

The prompt specifically says **not to invent the underlying transport mechanism** for BiChat.

### Core visualization

```text
FIELD
 ↓
OBSERVATION
 ↓
OFFLINE STORAGE
 ↓
SYNC
 ↓
MARIS
 ↓
INTELLIGENCE
 ↓
CONTROL ROOM
```

This ties directly to the frontend requirement that the mobile/field workflow be offline-first and expose states such as **PENDING, SYNCING, SYNCED, FAILED and CONFLICT**. 

---

# 6. Use Cases `/use-cases`

### Hero

# Built for decisions that happen in the real world.

There are **six use cases**.

### 01 — Fisherman Safety

Question:

> "Is it safe to go to sea tomorrow morning?"

MARIS correlates:

* weather
* waves
* wind
* tide
* alerts
* location

Output:

**Risk + Explanation + Recommendation + Map**

---

### 02 — Potential Fishing Zones

Question:

> "Where is the nearest suitable PFZ?"

Considers:

* PFZ
* location
* marine conditions
* weather
* risk
* distance

---

### 03 — Marine Hazard Awareness

Question:

> "Are there any cyclone or lightning alerts near me?"

Provides:

* alert
* severity
* affected area
* timing
* map

---

### 04 — Environmental Observation

A field user submits an observation offline.

MARIS:

```text
STORE
↓
SYNC
↓
MAP
↓
CORRELATE
↓
SHARE WITH AUTHORIZED USERS
```

---

### 05 — Productivity Analysis

Question:

> "Why has fish productivity declined in this region?"

Can compare:

* SST
* chlorophyll
* ocean conditions
* historical information
* geographic context

But the prompt specifically says conclusions should be presented as **analytical interpretations**, not guaranteed causal proof.

---

### 06 — Geofencing

Question:

> "Am I approaching a restricted or protected marine area?"

Uses:

* location
* geofences
* protected-area boundaries
* maritime zones

Then provides an alert.

---

# 7. Technology `/technology`

### Hero

# Built as a modular marine intelligence system.

### High-level architecture

```text
React Web
      │
React Native
      │
      ▼
MARIS API
      │
      ├── MongoDB
      ├── Data Services
      ├── Intelligence Engine
      ├── Agent Orchestrator
      ├── Realtime
      └── Evidence / Field Services
                │
                ▼
         External Data Sources
```

### Stack

**Web**

React + TypeScript

**Mobile**

React Native + TypeScript

**Backend**

Node.js + Express + TypeScript

**Database**

MongoDB

**Realtime**

Socket-based events

**AI**

Hybrid rules + ML + agentic orchestration

**Geospatial**

GeoJSON + geospatial indexing + map visualization

### Data integration

```text
IMD
INCOIS
Copernicus
OSM / GIS
Other marine data
        ↓
Provider Adapters
        ↓
Normalization
        ↓
MARIS Tools
        ↓
Agents
        ↓
Decision Support
```

### Responsible architecture

Highlight:

* provider abstraction
* evidence provenance
* confidence-aware outputs
* human-in-the-loop
* no fabricated data
* graceful failure

One caveat: your older **Technical Approach PDF** describes a different architecture—NestJS + PostgreSQL/PostGIS—while the newer BRD/pasted Lovable specification uses **MERN + MongoDB**.  So for the website, I'd use the **current frontend/Lovable stack**, not the older architecture diagram.

---

# 8. About MARIS `/about`

### Hero

# Why MARIS exists

Core explanation:

> MARIS was designed around the gap between the growing volume of marine information and the practical need to turn that information into contextual decisions.

### Philosophy

#### Connect

Bring fragmented marine information into one intelligence workflow.

#### Reason

Correlate spatial, temporal and contextual information.

#### Explain

Show why recommendations were produced.

#### Act

Help users and organizations make better-informed decisions.

### Responsible AI

```text
DATA
 ↓
EVIDENCE
 ↓
REASONING
 ↓
CONFIDENCE
 ↓
RECOMMENDATION
 ↓
HUMAN DECISION
```

### SIH alignment

Show:

**Problem Statement 26176**

**ORCA Marine EcOsystem Reasoning with Collaborative Agents**

Then highlight:

* Natural-language interaction
* Multi-turn conversation
* Agentic planning
* Multi-source data integration
* Spatial-temporal reasoning
* Explainable recommendations
* Marine hazard awareness
* PFZ intelligence
* Geofencing
* Route and operational support
* Field intelligence

---

# 9. Contact / Demo `/contact`

### Hero

# See MARIS in action.

Copy:

> Explore how MARIS connects marine data, collaborative agents and field intelligence into explainable decision support.

### Four demo options

**Web Intelligence Demo**

Conversational marine intelligence interface.

**Field Demo**

Offline observation capture and synchronization.

**Agentic Demo**

Multiple specialized agents collaborating.

**Intelligence Demo**

Evidence combined into an explainable recommendation.

### Form

```text
Name
Organization
Email
Interest
Message

[ Request a MARIS Demo ]
```

For now, just validate the form and show a success state—no production email integration unless you actually have the backend.

---

# 10. 404 `/404`

### Heading

# Lost beyond the map?

Copy:

> The page you're looking for is outside the current MARIS route.

Buttons:

**Return Home**

**Explore MARIS**

Marine-themed visual treatment.

---

## One thing I would add to your existing built site

Your **landing page already carries the narrative**, so the inner pages shouldn't simply repeat it.

I'd give each page a specific job:

```text
PROBLEM
"Why is this necessary?"

        ↓

INTELLIGENCE
"What does MARIS actually do?"

        ↓

AGENTS
"How does MARIS reason?"

        ↓

MARINE DATA
"What does it reason over?"

        ↓

FIELD
"How does intelligence reach the real world?"

        ↓

USE CASES
"What can it actually be used for?"

        ↓

TECHNOLOGY
"How is it built?"

        ↓

ABOUT
"Why should I trust / care about it?"

        ↓

CONTACT
"Let's see it."
```

That gives you a **proper narrative arc**, rather than nine independent marketing pages.

And importantly, your frontend requirements say the public site should **not pretend to be the authenticated operational platform**, should not fabricate live data, and should clearly distinguish illustrative product mockups from actual operational data. 

So if you've already built the landing page, I'd build the inner pages around **deep visual storytelling + architecture + scientific credibility**, not more generic feature cards.
