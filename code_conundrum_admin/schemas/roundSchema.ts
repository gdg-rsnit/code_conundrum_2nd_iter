import * as z from "zod";

export const createRoundSchema = z.object({
  roundNumber: z.number().int().positive(),
  duration: z.number().int().positive().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["DRAFT", "LIVE", "ENDED"]).optional().default("DRAFT"),
});

export const updateRoundSchema = z.object({
  roundNumber:z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export const extendRoundSchema = z.object({
  extraSeconds: z.number().int().positive(),
});

export const roundResponseSchema = z
  .object({
    _id: z.string(),
    roundNumber: z.number().int().positive(),
    duration: z.number().int().positive(),
    status: z.enum(["DRAFT", "LIVE", "ENDED"]),
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    isPaused: z.boolean().optional(),
    pauseStartAt: z.string().nullable().optional(),
    totalPauseDuration: z.number().optional(),
    submissionLocked: z.boolean().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })

export const roundsListResponseSchema = z.object({
  data: z.array(roundResponseSchema),
  success: z.boolean(),
  message: z.string(),
});

export const roundItemResponseSchema = z.object({
  data: roundResponseSchema,
  success: z.boolean(),
  message: z.string(),
});

export const roundActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});



export type CreateRoundInput = z.infer<typeof createRoundSchema>;
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;
export type ExtendRoundInput = z.infer<typeof extendRoundSchema>;
export type RoundResponse = z.infer<typeof roundResponseSchema>;
export type RoundsListResponse = z.infer<typeof roundsListResponseSchema>;
export type RoundItemResponse = z.infer<typeof roundItemResponseSchema>;
export type RoundActionResponse = z.infer<typeof roundActionResponseSchema>;
