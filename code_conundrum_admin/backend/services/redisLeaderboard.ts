import redisClient from '../config/redis.js'
import { calcRedisScore } from '../utils/rankCalculator.js'

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  timeSeconds: number
  accuracy: number
}

// Add or update a participant in Redis leaderboard
export const addToLeaderboard = async (
  round: number,
  username: string,
  score: number,
  timeSeconds: number,
  accuracy: number
): Promise<void> => {
  if (!redisClient.isOpen) return

  const rankingKey = `leaderboard:ranking:round:${round}`
  const dataKey = `leaderboard:data:round:${round}`
  const redisScore: number = calcRedisScore(score, timeSeconds)

  try {
    // 1. Update the Rank (Overwrites automatically if username exists)
    await redisClient.zAdd(rankingKey, {
      score: redisScore,
      value: username 
    })

    // 2. Update the Details in the Hash
    await redisClient.hSet(dataKey, username, JSON.stringify({ 
      username, score, timeSeconds, accuracy 
    }))
  } catch (err) {
    console.warn("Redis write failed:", err)
  }
}

// Get top N participants for a round
export const getLeaderboard = async (
  round: number,
  limit: number
): Promise<LeaderboardEntry[]> => {
  if (!redisClient.isOpen) return []

  const rankingKey = `leaderboard:ranking:round:${round}`
  const dataKey = `leaderboard:data:round:${round}`

  try {
    // 1. Get top usernames from the Sorted Set
    const rawNames = await redisClient.zRangeWithScores(rankingKey, 0, limit - 1, { REV: true })
    if (!rawNames || rawNames.length === 0) return []

    // 2. Fetch all their details at once from the Hash
    const usernames = rawNames.map(entry => entry.value)
    const metadata = await redisClient.hmGet(dataKey, usernames)

    // 3. Map back to LeaderboardEntry format
    return metadata
      .filter((data): data is string => data !== null) // Remove any nulls
      .map((data, i) => ({
        rank: i + 1,
        ...JSON.parse(data)
      }))
  } catch (err) {
    console.error("Redis fetch failed:", err)
    return []
  }
}

// Delete cache for a round when scores are updated
export const invalidateCache = async (round: number): Promise<void> => {
  if (!redisClient.isOpen) return

  const rankingKey = `leaderboard:ranking:round:${round}`
  const dataKey = `leaderboard:data:round:${round}`
  
  try {
    // Delete BOTH keys to keep things clean
    await redisClient.del([rankingKey, dataKey])
    console.log(`Cache invalidated for round ${round}`)
  } catch (err) {
    console.error("Cache invalidation failed:", err)
  }
}