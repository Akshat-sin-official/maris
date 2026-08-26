import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ValidationError } from '../common/errors';
import { AgentContext } from './AgentContext';
import {
  PlannerAgent,
  MarineDataAgent,
  WeatherHazardAgent,
  OceanIntelligenceAgent,
  GeospatialAgent,
  PFZAgent,
  RiskReasoningAgent,
  ExplanationAgent,
} from './AgentRegistry';
import { AuditLog } from '../audit/AuditLog.model';
import { env } from '../config/env';
import { XAIService } from '../integration/services/xai.service';
import { GeminiService } from '../integration/services/gemini.service';

const xaiService = new XAIService(env.XAI_API_KEY);
const geminiService = new GeminiService(env.GEMINI_API_KEY);

async function writeAuditLog(
  eventType: 'USER_UPDATE',
  actorEmail: string,
  userId: string,
  req: AuthenticatedRequest,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    await AuditLog.create({
      eventType,
      userId,
      actorEmail,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error('Failed to write audit log in agent controller:', error);
  }
}

/**
 * Handles agentic AI natural query parsing and analysis loop
 */
export async function queryAgenticAI(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user || {
      userId: 'PUBLIC_CITIZEN',
      email: 'public@maris.gov.in',
      role: 'CITIZEN',
      organizationId: 'PUBLIC',
    };

    const { query, location, language, context } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new ValidationError('A non-empty query string is required.');
    }

    if (location) {
      if (location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        throw new ValidationError('Location must be a valid GeoJSON Point structure.');
      }
    }

    // Initialize agent context
    const agentContext: AgentContext = {
      query,
      location,
      language: language || 'en',
      context: context || {},
      trace: [],
      accumulatedData: {},
    };

    // Run agents in order
    const agents = [
      new PlannerAgent(),
      new MarineDataAgent(),
      new WeatherHazardAgent(),
      new OceanIntelligenceAgent(),
      new GeospatialAgent(),
      new PFZAgent(),
      new RiskReasoningAgent(),
      new ExplanationAgent(),
    ];

    for (const agent of agents) {
      await agent.run(agentContext);
    }

    let finalOutput = agentContext.accumulatedData.finalOutput;

    // Enhance response with live Google Gemini / xAI Grok synthesis if key is present
    if (geminiService.isConfigured()) {
      try {
        const geminiSynthesis = await geminiService.analyzeMarineQuery(query, {
          location,
          agentTrace: agentContext.trace,
          accumulatedData: agentContext.accumulatedData,
        });

        finalOutput = {
          ...finalOutput,
          answer: geminiSynthesis.answer || finalOutput.answer,
          risk: {
            ...finalOutput.risk,
            rating: geminiSynthesis.riskRating || finalOutput.risk?.rating || 'MEDIUM',
          },
          confidence: geminiSynthesis.confidenceScore || finalOutput.confidence || 0.88,
          explanation: geminiSynthesis.whyFlagged || finalOutput.explanation,
          recommendations: geminiSynthesis.recommendations || finalOutput.recommendations,
          llmEngine: 'GOOGLE_GEMINI_LIVE',
        };
      } catch (geminiErr) {
        console.warn('Google Gemini API call failed, trying xAI Grok fallback:', geminiErr);
      }
    } else if (xaiService.isConfigured()) {
      try {
        const grokSynthesis = await xaiService.analyzeMarineQuery(query, {
          location,
          agentTrace: agentContext.trace,
          accumulatedData: agentContext.accumulatedData,
        });

        finalOutput = {
          ...finalOutput,
          answer: grokSynthesis.answer || finalOutput.answer,
          risk: {
            ...finalOutput.risk,
            rating: grokSynthesis.riskRating || finalOutput.risk?.rating || 'MEDIUM',
          },
          confidence: grokSynthesis.confidenceScore || finalOutput.confidence || 0.88,
          explanation: grokSynthesis.whyFlagged || finalOutput.explanation,
          recommendations: grokSynthesis.recommendations || finalOutput.recommendations,
          llmEngine: 'XAI_GROK_LIVE',
        };
      } catch (grokErr) {
        console.warn('xAI Grok synthesis fallback to deterministic agent output:', grokErr);
      }
    }

    // Log operational query run
    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'RUN_AGENTIC_AI_QUERY',
      query,
      intent: finalOutput.intent,
      riskScore: finalOutput.risk?.score,
    });

    res.status(200).json({
      status: 'success',
      data: finalOutput,
    });
  } catch (error) {
    next(error);
  }
}
