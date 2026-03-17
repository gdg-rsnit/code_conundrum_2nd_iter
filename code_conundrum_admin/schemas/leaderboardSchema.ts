import * as z from "zod";

const positiveRound = z.number().int().positive();

export const addScoreSchema = z.object({
  username: z.string().min(1, "Username is required"),
  score: z.number().nonnegative(),
  timeSeconds: z.number().nonnegative(),
  round: positiveRound,
  accuracy: z.number().min(0).max(100).optional(),
});

export const roundParamSchema = z.object({
  round: z
    .string()
    .transform((val) => Number(val))
    .pipe(positiveRound),
});

export const invalidateCacheSchema = z.object({
  round: positiveRound,
});

export type AddScoreInput = z.infer<typeof addScoreSchema>;
export type InvalidateCacheInput = z.infer<typeof invalidateCacheSchema>;
