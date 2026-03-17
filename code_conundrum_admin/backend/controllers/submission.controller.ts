import type { Request, Response } from 'express'

import asyncHandler from '../middlewares/asyncHandler.middleware.js'
import { Submission } from '../models/submissionModel.js'
import { Team } from '../models/teamModel.js'
import { Round } from '../models/roundModel.js'
import { addToLeaderboard } from '../services/redisLeaderboard.js'
import { upsertParticipant } from '../services/participantService.js'
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  submissionIdParamSchema,
  submissionQuerySchema,
} from '../../schemas/submissionSchema.js'

export const createOrUpdateSubmission = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const result = createSubmissionSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues })
  }

  const { teamId, roundId, questionsSolved, timeSeconds, submittedAt, accuracy } = result.data
  const accuracyVal = accuracy ?? 0

  const calculatedScore = questionsSolved * 10

  // Cap timeSeconds to round duration
  const round = await Round.findById(roundId).lean()
  if (!round) {
    return res.status(404).json({ success: false, message: 'Round not found' })
  }
  const boundedTimeTaken = Math.min(timeSeconds, round.duration)

  const team = await Team.findById(teamId).lean()
  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' })
  }

  const payload = {
    teamId,
    roundId,
    questionsSolved,
    timeSeconds: boundedTimeTaken,
    submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
    accuracy: accuracyVal,
  }

  const submission = await Submission.findOneAndUpdate(
    { teamId, roundId },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  // Fire leaderboard + participant updates as side effects (non-blocking)
  const sideEffects = await Promise.allSettled([
    addToLeaderboard(round.roundNumber, team.teamName, calculatedScore, boundedTimeTaken, accuracyVal),
    upsertParticipant(team.teamName, calculatedScore, boundedTimeTaken, round.roundNumber, accuracyVal),
  ])

  for (const effect of sideEffects) {
    if (effect.status === 'rejected') {
      console.error('Leaderboard side-effect failed:', effect.reason)
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Submission saved successfully',
    data: submission,
  })
})

export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const result = submissionQuerySchema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues })
  }

  const { roundId, teamId } = result.data
  const filter: Record<string, unknown> = {}
  if (roundId) filter.roundId = roundId
  if (teamId) filter.teamId = teamId

  const submissions = await Submission.find(filter)
    .populate('teamId', 'teamName')
    .populate('roundId', 'roundNumber status')
    .sort({ questionsSolved: -1, timeSeconds: 1, submittedAt: 1 })

  return res.status(200).json({
    success: true,
    message: 'Submissions fetched successfully',
    count: submissions.length,
    data: submissions,
  })
})

export const getSubmissionById = asyncHandler(async (req: Request<{ submissionId?: string }>, res: Response) => {
  const paramResult = submissionIdParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    return res.status(400).json({ success: false, error: paramResult.error.issues })
  }

  const submission = await Submission.findById(paramResult.data.submissionId)
    .populate('teamId', 'teamName')
    .populate('roundId', 'roundNumber status')

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' })
  }

  return res.status(200).json({
    success: true,
    message: 'Submission fetched successfully',
    data: submission,
  })
})

export const updateSubmission = asyncHandler(async (req: Request<{ submissionId?: string }>, res: Response) => {
  const paramResult = submissionIdParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    return res.status(400).json({ success: false, error: paramResult.error.issues })
  }

  const bodyResult = updateSubmissionSchema.safeParse(req.body)
  if (!bodyResult.success) {
    return res.status(400).json({ success: false, error: bodyResult.error.issues })
  }

  const { submittedAt, ...rest } = bodyResult.data
  const updates: Record<string, unknown> = { ...rest }
  if (submittedAt !== undefined) updates.submittedAt = new Date(submittedAt)

  const submission = await Submission.findByIdAndUpdate(
    paramResult.data.submissionId,
    updates,
    { new: true }
  )

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' })
  }

  return res.status(200).json({
    success: true,
    message: 'Submission updated successfully',
    data: submission,
  })
})

export const deleteSubmission = asyncHandler(async (req: Request<{ submissionId?: string }>, res: Response) => {
  const paramResult = submissionIdParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    return res.status(400).json({ success: false, error: paramResult.error.issues })
  }

  const submission = await Submission.findByIdAndDelete(paramResult.data.submissionId)

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' })
  }

  return res.status(200).json({
    success: true,
    message: 'Submission deleted successfully',
  })
})
