"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAgenticAI = queryAgenticAI;
const errors_1 = require("../common/errors");
const AgentRegistry_1 = require("./AgentRegistry");
const AuditLog_model_1 = require("../audit/AuditLog.model");
async function writeAuditLog(eventType, actorEmail, userId, req, details) {
    try {
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        await AuditLog_model_1.AuditLog.create({
            eventType,
            userId,
            actorEmail,
            ipAddress,
            userAgent,
            details,
        });
    }
    catch (error) {
        console.error('Failed to write audit log in agent controller:', error);
    }
}
/**
 * Handles agentic AI natural query parsing and analysis loop
 */
async function queryAgenticAI(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { query, location, language, context } = req.body;
        if (!query || typeof query !== 'string' || query.trim() === '') {
            throw new errors_1.ValidationError('A non-empty query string is required.');
        }
        if (location) {
            if (location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
                throw new errors_1.ValidationError('Location must be a valid GeoJSON Point structure.');
            }
        }
        // Initialize agent context
        const agentContext = {
            query,
            location,
            language: language || 'en',
            context: context || {},
            trace: [],
            accumulatedData: {},
        };
        // Run agents in order
        const agents = [
            new AgentRegistry_1.PlannerAgent(),
            new AgentRegistry_1.MarineDataAgent(),
            new AgentRegistry_1.WeatherHazardAgent(),
            new AgentRegistry_1.OceanIntelligenceAgent(),
            new AgentRegistry_1.GeospatialAgent(),
            new AgentRegistry_1.PFZAgent(),
            new AgentRegistry_1.RiskReasoningAgent(),
            new AgentRegistry_1.ExplanationAgent(),
        ];
        for (const agent of agents) {
            await agent.run(agentContext);
        }
        const finalOutput = agentContext.accumulatedData.finalOutput;
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
    }
    catch (error) {
        next(error);
    }
}
