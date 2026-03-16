import * as z from "zod";

// ObjectId validation compatible with both frontend and backend
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createPenaltySchema = z.object({
  teamId: objectIdSchema,
  roundId: objectIdSchema,
  timeDeducted: z.number().int().nonnegative().optional().default(0),
  scoreDeducted: z.number().int().nonnegative().optional().default(0),
  reason: z.string().min(1, "Reason is required"),
}).refine(
  (data) => data.timeDeducted > 0 || data.scoreDeducted > 0,
  {
    error: "At least one of timeDeducted or scoreDeducted must be greater than 0",
    path: ["timeDeducted"],
  }
);

export const updatePenaltySchema = z.object({
  timeDeducted: z.number().int().nonnegative().optional(),
  scoreDeducted: z.number().int().nonnegative().optional(),
  reason: z.string().min(1, "Reason is required").optional(),
});

export const penaltyResponseSchema = z.object({
  _id: z.string(),
  teamId: objectIdSchema,
  roundId: objectIdSchema,
  timeDeducted: z.number(),
  scoreDeducted: z.number(),
  reason: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const penaltiesListResponseSchema = z.object({
  data: z.array(penaltyResponseSchema),
  success: z.boolean(),
  message: z.string(),
  count: z.number().optional(),
});

export const penaltyItemResponseSchema = z.object({
  data: penaltyResponseSchema,
  success: z.boolean(),
  message: z.string(),
});

export type CreatePenaltyInput = z.infer<typeof createPenaltySchema>;
export type UpdatePenaltyInput = z.infer<typeof updatePenaltySchema>;
export type PenaltyResponse = z.infer<typeof penaltyResponseSchema>;
export type PenaltiesListResponse = z.infer<typeof penaltiesListResponseSchema>;
export type PenaltyItemResponse = z.infer<typeof penaltyItemResponseSchema>;
