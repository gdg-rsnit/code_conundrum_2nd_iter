import Participant from "../models/Participant.js"
import type { IParticipant } from "../models/Participant.js"
// Add or update participant score in MongoDB
export const upsertParticipant = async (
  username: string,
  score: number,
  timeSeconds: number,
  round: number,
  accuracy: number
): Promise<IParticipant | null> => {
  return await Participant.findOneAndUpdate(
    { username, round },
    { score, timeSeconds, accuracy },
    { upsert: true, new: true }
  )
}

// Get participants for a round from MongoDB
// Used as fallback when Redis cache is empty
export const getParticipantsByRound = async (
  round: number,
  limit: number
): Promise<IParticipant[]> => {
  return await Participant
    .find({ round: Number(round) })
    .sort({ score: -1, timeSeconds: 1 })
    .limit(limit)
    .lean() as IParticipant[]
}