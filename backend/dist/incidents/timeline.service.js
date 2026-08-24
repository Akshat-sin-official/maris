"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Incident_model_1 = require("./Incident.model");
class TimelineService {
    /**
     * Appends an immutable digital timeline event tracking the incident state.
     *
     * CRITICAL NOTE: This is an operational log utilized for field officer and control room
     * synchronization. It does NOT claim, represent, or substitute for legal or forensic proof
     * of chain-of-custody.
     *
     * @param incidentId Target incident identifier
     * @param eventType Timeline event category enum
     * @param actorId User performing the action
     * @param message Description metadata of the event
     */
    static async logEvent(incidentId, eventType, actorId, message) {
        try {
            await Incident_model_1.Incident.findByIdAndUpdate(incidentId, {
                $push: {
                    timeline: {
                        eventType,
                        actorId: new mongoose_1.default.Types.ObjectId(actorId),
                        message,
                        timestamp: new Date(),
                    },
                },
            }, { runValidators: true });
        }
        catch (error) {
            console.error(`[TimelineService] Failed to append event ${eventType} to incident ${incidentId}:`, error);
        }
    }
}
exports.TimelineService = TimelineService;
