import Submission from "../models/submissionModel.js"
import type { ISubmission } from "../models/submissionModel.js"
import { Team } from "../models/teamModel.js"
import { Round } from "../models/roundModel.js"

interface ParticipantLeaderboardRow {
  username: string
  score: number
  timeSeconds: number
  accuracy: number
}
// Add or update participant score in MongoDB
export const upsertParticipant = async (
  username: string,
  score: number,
  timeSeconds: number,
  round: number,
  accuracy: number
): Promise<ISubmission | null> => {
  const team = await Team.findOne({ teamName: username }).select('_id').lean()
  if (!team?._id) {
    return null
  }

  const currentRound = await Round.findOne({ roundNumber: round }).select('_id').lean()
  if (!currentRound?._id) {
    return null
  }

  return await Submission.findOneAndUpdate(
    { teamId: team._id, roundId: currentRound._id },
    {
      questionsSolved: score,
      timeSeconds,
      accuracy,
      submittedAt: new Date()
    },
    { upsert: true, new: true }
  )
}

// Get participants for a round from MongoDB
// Used as fallback when Redis cache is empty
export const getParticipantsByRound = async (
  round: number,
  limit: number
): Promise<ParticipantLeaderboardRow[]> => {
  const currentRound = await Round.findOne({ roundNumber: round }).select('_id').lean()
  if (!currentRound?._id) {
    return []
  }

  const participants = await Submission
    .find({ roundId: currentRound._id })
    .sort({ questionsSolved: -1, timeSeconds: 1 })
    .limit(limit)
    .populate('teamId', 'teamName')
    .lean()

  return participants.map((participant: any) => ({
    username: participant.teamId?.teamName ?? 'Unknown Team',
    score: participant.questionsSolved,
    timeSeconds: participant.timeSeconds,
    accuracy: participant.accuracy ?? 0
  }))
}