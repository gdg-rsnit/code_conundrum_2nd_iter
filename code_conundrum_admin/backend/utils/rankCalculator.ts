// Encodes score + time into one number for Redis sorting
// Higher score = better
// Lower time = better when scores are tied
export const calcRedisScore = (score: number, timeSeconds: number): number => {
  return (Number(score) * 1000000) - Number(timeSeconds)
}

// How many teams qualify per round
export const getRoundLimit = (round: number): number => {
  const limits: Record<number, number> = {
    1: 15,
    2: 5,
    3: 3
  }
  return limits[Number(round)] || 10
}