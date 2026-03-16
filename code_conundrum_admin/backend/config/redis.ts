import {createClient} from 'redis'
import type {RedisClientType} from 'redis'

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
}) as RedisClientType

redisClient.on('error', (err: Error) => console.error('Redis error:', err))

export default redisClient