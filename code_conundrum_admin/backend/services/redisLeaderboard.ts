import redisClient from '../config/redis.js'
import { calcRedisScore } from '../utils/rankCalculator.js'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  timeSeconds: number
  accuracy: number
}

interface RedisZEntry {
  value: string
  score: number
}

// Add or update a participant in Redis leaderboard
export const addToLeaderboard = async (
  round: number,
  username: string,
  score: number,
  timeSeconds: number,
  accuracy: number
): Promise<void> => {
  const key: string = `leaderboard:round:${round}`
  const redisScore: number = calcRedisScore(score, timeSeconds)

  await redisClient.zAdd(key, {
    score: redisScore,
    value: JSON.stringify({ username, score, timeSeconds, accuracy })
  })
}

// Get top N participants for a round
export const getLeaderboard = async (
  round: number,
  limit: number
): Promise<LeaderboardEntry[]> => {
  const key: string = `leaderboard:round:${round}`

  const raw: RedisZEntry[] = await redisClient.zRangeWithScores(
    key, 0, limit - 1, { REV: true }
  )

  // Return empty array if nothing in cache
  if (!raw || raw.length === 0) return []

  return raw.map((entry: RedisZEntry, i: number) => ({
    rank: i + 1,
    ...JSON.parse(entry.value)
  }))
}

// Delete cache for a round when scores are updated
export const invalidateCache = async (round: number): Promise<void> => {
  const key: string = `leaderboard:round:${round}`
  await redisClient.del(key)
  console.log(`Cache invalidated for round ${round}`)
}