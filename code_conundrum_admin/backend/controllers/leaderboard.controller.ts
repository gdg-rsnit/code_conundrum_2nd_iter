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

interface AddScoreBody {
  username: string
  score: number
  timeSeconds: number
  round: number
  accuracy?: number
}

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  timeSeconds: number
  accuracy: number
}

// POST /leaderboard
// Adds a score to the leaderboard — updates both Redis and MongoDB
export const addScore = async (req: Request<{}, {}, AddScoreBody>, res: Response): Promise<void> => {
  const { username, score, timeSeconds, round, accuracy } = req.body

  // Validate
  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Invalid username' }); return
  }
  if (isNaN(score) || Number(score) < 0) {
    res.status(400).json({ error: 'Invalid score' }); return
  }
  if (isNaN(timeSeconds) || Number(timeSeconds) < 0) {
    res.status(400).json({ error: 'Invalid time' }); return
  }
  if (isNaN(accuracy ?? 0) || Number(accuracy ?? 0) < 0 || Number(accuracy ?? 0) > 100) {
    res.status(400).json({ error: 'Invalid accuracy' }); return
  }
  if (![1, 2, 3].includes(Number(round))) {
    res.status(400).json({ error: 'Round must be 1, 2 or 3' }); return
  }

  try {
    // Write to Redis
    await addToLeaderboard(round, username, Number(score), Number(timeSeconds), Number(accuracy ?? 0))

    // Write to MongoDB
    await upsertParticipant(username, Number(score), Number(timeSeconds), Number(round), Number(accuracy ?? 0))

    res.status(200).json({ message: `${username} added to leaderboard` })

  } catch (err) {
    console.error('addScore error:', err)
    res.status(500).json({ error: 'Failed to add score' })
  }
}

// GET /leaderboard/:round
// Returns sorted leaderboard — checks Redis first, falls back to MongoDB
export const fetchLeaderboard = async (req: Request<{ round: string }>, res: Response): Promise<void> => {
  const round = Number(req.params.round)

  if (![1, 2, 3].includes(round)) {
    res.status(400).json({ error: 'Round must be 1, 2 or 3' }); return
  }

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
export const clearCache = async (req: Request<{}, {}, { round?: number }>, res: Response): Promise<void> => {
  const { round } = req.body

  if (round && ![1, 2, 3].includes(Number(round))) {
    res.status(400).json({ error: 'Round must be 1, 2 or 3' }); return
  }

  try {
    if (round) {
      // Invalidate specific round
      await invalidateCache(round)
    } else {
      // Invalidate all rounds
      await Promise.all([
        invalidateCache(1),
        invalidateCache(2),
        invalidateCache(3)
      ])
    }

    res.status(200).json({ message: 'Cache cleared' })

  } catch (err) {
    console.error('clearCache error:', err)
    res.status(500).json({ error: 'Failed to clear cache' })
  }
}