import mongoose from 'mongoose';
import { Incident, TimelineEventType } from './Incident.model';

export class TimelineService {
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
  static async logEvent(
    incidentId: string | mongoose.Types.ObjectId,
    eventType: TimelineEventType,
    actorId: string | mongoose.Types.ObjectId,
    message: string
  ): Promise<void> {
    try {
      await Incident.findByIdAndUpdate(
        incidentId,
        {
          $push: {
            timeline: {
              eventType,
              actorId: new mongoose.Types.ObjectId(actorId),
              message,
              timestamp: new Date(),
            },
          },
        },
        { runValidators: true }
      );
    } catch (error) {
      console.error(`[TimelineService] Failed to append event ${eventType} to incident ${incidentId}:`, error);
    }
  }
}
