import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

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

export type CreatePenaltyInput = z.infer<typeof createPenaltySchema>;
export type UpdatePenaltyInput = z.infer<typeof updatePenaltySchema>;
