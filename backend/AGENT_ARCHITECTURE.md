# MARIS Agentic AI Architecture

This document describes the orchestration layer, abstractions, interface boundaries, failure recovery, and explainability patterns of the **MARIS Agentic AI System**.

---

## 1. Multi-Agent Orchestration Flow

```
                      [ POST /api/v1/ai/query ]
                                  │
                                  v
                      [ 1. Planner Agent ] ──> Decompose & determine sub-tasks
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              v                   v                   v
      [ Marine Data ]      [ Weather/Hazard ]   [ Geospatial ] (Specialized Agents)
      [ PFZ Agent ]        [ Ocean Intel ]      [ ... ]
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  v
                      [ Risk/Reasoning Agent ] ──> Unified correlation & confidence solver
                                  │
                                  v
                      [ Explanation Agent ] ──> Bulleted trace & recommendation builders
                                  │
                                  v
                        [ Structured Output ]
```

---

## 2. Agent Responsibilities & Interfaces

All agents extend the base `BaseAgent` class and execute sequentially or conditionally sharing a single, mutable `AgentContext` object.

### Planner Agent
* **Responsibility**: Decomposes user natural query inputs and maps them to an operational intent state.
* **Input**: `context.query` (String)
* **Output**: `context.accumulatedData.intent` (String: `VESSEL_SIGHTING_AND_SECURITY`, `HAZARD_AND_WEATHER_MONITORING`, `POTENTIAL_FISHING_ZONE_QUERY`, `GEOSPATIAL_BOUNDARY_INTELLIGENCE`, `GENERAL_ANALYSIS`)
* **Tools**: None (Internal parser rules)

### Marine Data Agent
* **Responsibility**: Searches for observations matching vessel enforcements or wildlife sightings.
* **Input**: Location coordinates, intent context.
* **Output**: `context.accumulatedData.marineData` (Array of Mongoose Observations)
* **Tools**: `QueryObservationsTool`

### Weather/Hazard Agent
* **Responsibility**: Queries alerts matching storms, cyclones, and surface oil slicks.
* **Input**: Location coordinates, intent context.
* **Output**: `context.accumulatedData.weatherData` (Array of Mongoose Alerts)
* **Tools**: `QueryAlertsTool`

### Ocean Intelligence Agent
* **Responsibility**: Retrieves historical incident matches and pattern matches.
* **Input**: Incident context, location.
* **Output**: `context.accumulatedData.intelligenceData` (Matches metadata)
* **Tools**: Mongoose Intelligence collections query interface.

### Geospatial Agent
* **Responsibility**: Computes containment, proximity buffers, and distance offsets to sanctuary enclaves.
* **Input**: Location coordinates.
* **Output**: `context.accumulatedData.geospatialData` (Containment and distance flags)
* **Tools**: `GeospatialBufferTool`

### PFZ Agent
* **Responsibility**: Pinpoints sea surface temperature (SST) gradients and chlorophyll concentration grids.
* **Input**: Coordinates.
* **Output**: `context.accumulatedData.pfzData` (Array of PFZ maps)
* **Tools**: `QueryPFZsTool`

### Risk/Reasoning Agent
* **Responsibility**: Correlates data from all specialized sub-agents to compute a unified priority signal score (0 to 100), risk level category, and overall confidence grade.
* **Input**: `context.accumulatedData` (Populated by prior agents)
* **Output**: `context.accumulatedData.riskAssessment` (`level`, `score`, `factors`, `confidence`)
* **Tools**: None (Analytical formulas)

### Explanation Agent
* **Responsibility**: Assembles map layer overlays, recommendations, sources, and writes the final natural language answer using non-legal justifications.
* **Input**: `context.accumulatedData`
* **Output**: `context.accumulatedData.finalOutput` (Fully structured JSON API payload)
* **Tools**: None (Text template builders)

---

## 3. Failure Handling

Each specialized sub-agent runs inside a safe `try-catch` wrapper:
* If a database error or tool failure occurs, the error is logged and that agent's trace state is marked as `FAILED`.
* The overall orchestrator **proceeds** executing the remaining agents in the pipeline, falling back to deterministic sample data or default values.
* This ensures high application availability, allowing the user to get a partial response with visible audit trace failure tags instead of a raw 500 error crash.

---

## 4. Confidence & Explainability

* **Confidence Assessment**: The confidence value (0.0 to 1.0) is dynamic. Base confidence starts at `0.65`. It gains `+0.2` if matched observations are fully `VERIFIED` by staff.
* **Explainability Guidelines**: To maintain objective operational standards, the system outputs clear reasoning steps mapping specific tool computations (e.g. sanctuary boundary distance values, alert counts) and completely avoids subjective or legal accusations like *"criminal network identified"*.
