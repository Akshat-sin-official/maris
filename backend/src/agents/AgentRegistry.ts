import { BaseAgent, AgentContext } from './AgentContext';
import {
  QueryObservationsTool,
  QueryAlertsTool,
  QueryPFZsTool,
  GeospatialBufferTool,
} from './ToolRegistry';

const obsTool = new QueryObservationsTool();
const alertsTool = new QueryAlertsTool();
const pfzTool = new QueryPFZsTool();
const bufferTool = new GeospatialBufferTool();

/**
 * 1. Planner Agent
 * Intent parser and task decomposer
 */
export class PlannerAgent extends BaseAgent {
  name = 'Planner Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Decomposed search query to identify operational objectives and intent.',
      status: 'RUNNING',
    });

    let intent = 'GENERAL_ANALYSIS';
    const queryLower = context.query.toLowerCase();

    if (
      queryLower.includes('vessel') ||
      queryLower.includes('boat') ||
      queryLower.includes('ship') ||
      queryLower.includes('trawler')
    ) {
      intent = 'VESSEL_SIGHTING_AND_SECURITY';
    } else if (
      queryLower.includes('weather') ||
      queryLower.includes('storm') ||
      queryLower.includes('spill') ||
      queryLower.includes('slick') ||
      queryLower.includes('cyclone')
    ) {
      intent = 'HAZARD_AND_WEATHER_MONITORING';
    } else if (
      queryLower.includes('fishing') ||
      queryLower.includes('pfz') ||
      queryLower.includes('sst') ||
      queryLower.includes('chlorophyll')
    ) {
      intent = 'POTENTIAL_FISHING_ZONE_QUERY';
    } else if (queryLower.includes('sanctuary') || queryLower.includes('sanctuary_boundary')) {
      intent = 'GEOSPATIAL_BOUNDARY_INTELLIGENCE';
    }

    context.accumulatedData.intent = intent;

    const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
    if (entry) {
      entry.status = 'COMPLETED';
      entry.output = { intent };
    }
  }
}

/**
 * 2. Marine Data Agent
 * Queries observation records for marine assets
 */
export class MarineDataAgent extends BaseAgent {
  name = 'Marine Data Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Querying environmental sighting databases and physical asset registries.',
      status: 'RUNNING',
    });

    try {
      const category = context.accumulatedData.intent === 'VESSEL_SIGHTING_AND_SECURITY'
        ? 'vessel_sighting'
        : 'wildlife';
      
      const lon = context.location?.coordinates[0] || 80.25;
      const lat = context.location?.coordinates[1] || 12.52;

      const observations = await obsTool.execute({ category, lat, lon });
      context.accumulatedData.marineData = observations;

      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'COMPLETED';
        entry.output = { count: observations.length };
      }
    } catch (error) {
      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'FAILED';
        entry.output = { error: (error as Error).message };
      }
    }
  }
}

/**
 * 3. Weather/Hazard Agent
 * Checks active weather or spill alert boundaries
 */
export class WeatherHazardAgent extends BaseAgent {
  name = 'Weather/Hazard Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Checking active alerts, storms, and surface oil slicks.',
      status: 'RUNNING',
    });

    try {
      const type = context.accumulatedData.intent === 'HAZARD_AND_WEATHER_MONITORING'
        ? 'OIL_SPILL'
        : undefined;

      const lon = context.location?.coordinates[0] || 80.25;
      const lat = context.location?.coordinates[1] || 12.52;

      const alerts = await alertsTool.execute({ type, lat, lon });
      context.accumulatedData.weatherData = alerts;

      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'COMPLETED';
        entry.output = { count: alerts.length };
      }
    } catch (error) {
      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'FAILED';
        entry.output = { error: (error as Error).message };
      }
    }
  }
}

/**
 * 4. Ocean Intelligence Agent
 * Integrates intelligence historical matches
 */
export class OceanIntelligenceAgent extends BaseAgent {
  name = 'Ocean Intelligence Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Extracting historical incident patterns and prior priority signals.',
      status: 'RUNNING',
    });

    try {
      // Stub intelligence match checks
      context.accumulatedData.intelligenceData = {
        hasPriorIncidentHistory: true,
        historicalMatchCount: 1,
        matchSimilarityScore: 0.85
      };

      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'COMPLETED';
        entry.output = context.accumulatedData.intelligenceData;
      }
    } catch (error) {
      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'FAILED';
        entry.output = { error: (error as Error).message };
      }
    }
  }
}

/**
 * 5. Geospatial Agent
 * Performs polygon buffers and coordinate distance offsets
 */
export class GeospatialAgent extends BaseAgent {
  name = 'Geospatial Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Calculating buffer bounds and proximity containment intersections.',
      status: 'RUNNING',
    });

    try {
      const targetLon = context.location?.coordinates[0] || 80.25;
      const targetLat = context.location?.coordinates[1] || 12.52;

      // Sanctuary center mock coords
      const sanctuaryLon = 80.22;
      const sanctuaryLat = 12.48;

      const distToSanctuary = await bufferTool.execute({
        lon1: targetLon,
        lat1: targetLat,
        lon2: sanctuaryLon,
        lat2: sanctuaryLat,
      });

      context.accumulatedData.geospatialData = {
        distanceToSanctuaryKm: distToSanctuary,
        intersectsRestrictedZone: distToSanctuary < 15, // buffer zone
      };

      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'COMPLETED';
        entry.output = context.accumulatedData.geospatialData;
      }
    } catch (error) {
      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'FAILED';
        entry.output = { error: (error as Error).message };
      }
    }
  }
}

/**
 * 6. PFZ Agent
 * Fetches Potential Fishing Zone metadata
 */
export class PFZAgent extends BaseAgent {
  name = 'PFZ Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Checking Sea Surface Temperature (SST) gradients and chlorophyll concentration grids.',
      status: 'RUNNING',
    });

    try {
      const lon = context.location?.coordinates[0] || 80.25;
      const lat = context.location?.coordinates[1] || 12.52;

      const pfzs = await pfzTool.execute({ lat, lon });
      context.accumulatedData.pfzData = pfzs;

      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'COMPLETED';
        entry.output = { count: pfzs.length };
      }
    } catch (error) {
      const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
      if (entry) {
        entry.status = 'FAILED';
        entry.output = { error: (error as Error).message };
      }
    }
  }
}

/**
 * 7. Risk/Reasoning Agent
 * Weighs facts and computes overall risk and confidence
 */
export class RiskReasoningAgent extends BaseAgent {
  name = 'Risk/Reasoning Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Correlating sensor data, spatial intersections, and history for risk categorization.',
      status: 'RUNNING',
    });

    // Correlation calculations
    const isRestrictedZone = context.accumulatedData.geospatialData?.intersectsRestrictedZone || false;
    const weatherAlertsCount = context.accumulatedData.weatherData?.length || 0;
    const hasPriorHistory = context.accumulatedData.intelligenceData?.hasPriorIncidentHistory || false;

    let riskScore = 20; // base score
    const factors: string[] = [];

    if (isRestrictedZone) {
      riskScore += 40;
      factors.push('Spatial overlap with marine sanctuary boundary.');
    }
    if (weatherAlertsCount > 0) {
      riskScore += 20;
      factors.push('Active environmental weather hazards observed in the zone.');
    }
    if (hasPriorHistory) {
      riskScore += 15;
      factors.push('Recurring matching relationships identified in historical records.');
    }

    riskScore = Math.min(100, riskScore);

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) level = 'CRITICAL';
    else if (riskScore >= 50) level = 'HIGH';
    else if (riskScore >= 30) level = 'MEDIUM';

    // Confidence solver
    let confidence = 0.65;
    if (context.accumulatedData.marineData?.some((o: any) => o.verification?.status === 'VERIFIED')) {
      confidence += 0.2;
    }
    confidence = Math.min(1.0, confidence);

    context.accumulatedData.riskAssessment = {
      level,
      score: riskScore,
      factors,
      confidence,
    };

    const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
    if (entry) {
      entry.status = 'COMPLETED';
      entry.output = context.accumulatedData.riskAssessment;
    }
  }
}

/**
 * 8. Explanation Agent
 * Compiles recommendations, sources, layers, and formulates final answer
 */
export class ExplanationAgent extends BaseAgent {
  name = 'Explanation Agent';
  async run(context: AgentContext): Promise<void> {
    context.trace.push({
      agent: this.name,
      action: 'Compiling structured explainable justifications and operational instructions.',
      status: 'RUNNING',
    });

    const risk = context.accumulatedData.riskAssessment;
    const intent = context.accumulatedData.intent;
    const location = context.location;

    // Build explanations using non-legal claims
    const explanations: string[] = [
      'Specialized Marine Data Agent retrieved matching telemetry observations in coordinates.',
      `Geospatial Agent calculated sanctuary buffer offset at ${context.accumulatedData.geospatialData?.distanceToSanctuaryKm?.toFixed(1) || '0.0'}km.`,
      `Risk/Reasoning Agent resolved overall confidence index to ${risk?.confidence}.`
    ];

    // Build recommendations
    const recommendations: string[] = [
      'Issue priority signal verification orders to field patrol officers.',
    ];
    if (risk?.score >= 50) {
      recommendations.push('Establish a dynamic observation zone around target coordinates.');
    }

    // Build map Context
    const mapContext = {
      center: location?.coordinates || [80.25, 12.52],
      zoom: 11,
      layers: ['sanctuary_boundary', 'active_incidents', 'pfz_gradient']
    };

    // Compile sources
    const sources: any[] = [];
    if (context.accumulatedData.marineData) {
      context.accumulatedData.marineData.forEach((d: any, idx: number) => {
        sources.push({
          id: d._id || `src_obs_${idx}`,
          type: 'Observation',
          title: `Sighting Sensed - ${d.category}`
        });
      });
    }
    if (context.accumulatedData.weatherData) {
      context.accumulatedData.weatherData.forEach((w: any, idx: number) => {
        sources.push({
          id: w._id || `src_alert_${idx}`,
          type: 'Alert',
          title: `Weather Alert - ${w.type}`
        });
      });
    }

    const answer = `Analysis indicates supporting records of type ${intent} in the proximity zone. Risk level is evaluated as ${risk?.level} (${risk?.score}% priority signal) with active weather hazards and sanctuary buffer proximity enforcements.`;

    context.accumulatedData.finalOutput = {
      answer,
      intent,
      risk: {
        level: risk?.level,
        score: risk?.score,
        factors: risk?.factors,
      },
      confidence: risk?.confidence,
      recommendations,
      explanation: explanations,
      sources,
      mapContext,
      agentTrace: context.trace,
    };

    const entry = context.trace.find((t) => t.agent === this.name && t.status === 'RUNNING');
    if (entry) {
      entry.status = 'COMPLETED';
    }
  }
}
