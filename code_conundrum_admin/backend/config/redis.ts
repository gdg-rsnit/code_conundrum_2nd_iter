import 'dotenv/config'
import { createClient } from 'redis'
import type { RedisClientType } from 'redis'

let hasLoggedRedisError = false

const getRedisUrl = (): string => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL
  if (process.env.UPSTASH_REDIS_URL) return process.env.UPSTASH_REDIS_URL

  const host = process.env.UPSTASH_REDIS_HOST
  const port = process.env.UPSTASH_REDIS_PORT
  const password = process.env.UPSTASH_REDIS_PASSWORD

  if (host && port && password) {
    return `rediss://default:${password}@${host}:${port}`
  }

  // Keep app booting even when Redis env vars are missing.
  // Connection will fail gracefully and DB fallback will be used.
  console.warn(
    'Redis env vars not found. Set REDIS_URL or UPSTASH_REDIS_URL (or UPSTASH_REDIS_HOST/UPSTASH_REDIS_PORT/UPSTASH_REDIS_PASSWORD). Running with DB fallback until configured.'
  )
  return 'redis://127.0.0.1:6379'
}

const redisClient: RedisClientType = createClient({
  url: getRedisUrl(),
  socket: {
    // Avoid endless reconnect/log spam when Redis is not available.
    reconnectStrategy: false
  }
}) as RedisClientType

redisClient.on('error', (err: Error) => {
  if (hasLoggedRedisError) return
  hasLoggedRedisError = true
  console.warn(`Redis unavailable (${err.message}). Continuing without cache.`)
})

export default redisClient