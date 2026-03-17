import type { Request, Response } from 'express'

import { 
  addToLeaderboard, 
  getLeaderboard, 
  invalidateCache 
} from '../services/redisLeaderboard.js'

import { 
  upsertParticipant, 
  getParticipantsByRound 
} from '../services/participantService.js'

import { getRoundLimit } from '../utils/rankCalculator.js'
import {
  addScoreSchema,
  roundParamSchema,
  invalidateCacheSchema,
} from '../../schemas/leaderboardSchema.js'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  timeSeconds: number
  accuracy: number
}

// POST /leaderboard
// Adds a score to the leaderboard — updates both Redis and MongoDB
export const addScore = async (req: Request, res: Response): Promise<void> => {
  const result = addScoreSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues }); return
  }

  const { username, score, timeSeconds, round, accuracy = 0 } = result.data

  try {
    // Write to Redis
    await addToLeaderboard(round, username, score, timeSeconds, accuracy)

    // Write to MongoDB
    const participant = await upsertParticipant(username, score, timeSeconds, round, accuracy)

    if (!participant) {
      res.status(404).json({ error: 'Team or round not found for submission' }); return
    }

    res.status(200).json({ message: `${username} added to leaderboard` })

  } catch (err) {
    console.error('addScore error:', err)
    res.status(500).json({ error: 'Failed to add score' })
  }
}

// GET /leaderboard/:round
// Returns sorted leaderboard — checks Redis first, falls back to MongoDB
export const fetchLeaderboard = async (req: Request<{ round: string }>, res: Response): Promise<void> => {
  const paramResult = roundParamSchema.safeParse(req.params)
  if (!paramResult.success) {
    res.status(400).json({ error: paramResult.error.issues }); return
  }

  const round = paramResult.data.round
  const limit: number = getRoundLimit(round)

  try {
    // Step 1 — check Redis
    let leaderboard: LeaderboardEntry[] = await getLeaderboard(round, limit)

    if (leaderboard.length === 0) {
      // Step 2 — If the fast list is empty, get data from the permanent database
      console.log(`Cache miss for round ${round} — fetching from MongoDB`)

      const participants = await getParticipantsByRound(round, limit)

      // Step 3 — repopulate Redis from MongoDB data
      for (const p of participants) {
        await addToLeaderboard(round, p.username, p.score, p.timeSeconds, p.accuracy)
      }

      // Step 4 — format response
      leaderboard = participants.map((p, i: number) => ({
        rank: i + 1,
        username: p.username,
        score: p.score,
        timeSeconds: p.timeSeconds,
        accuracy: p.accuracy
      }))
    }

    res.status(200).json(leaderboard)

  } catch (err) {
    console.error('fetchLeaderboard error:', err)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
}

// POST /leaderboard/invalidate
// After any score change
export const clearCache = async (req: Request, res: Response): Promise<void> => {
  const result = invalidateCacheSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues }); return
  }

  try {
    await invalidateCache(result.data.round)

    res.status(200).json({ message: 'Cache cleared' })

  } catch (err) {
    console.error('clearCache error:', err)
    res.status(500).json({ error: 'Failed to clear cache' })
  }
}