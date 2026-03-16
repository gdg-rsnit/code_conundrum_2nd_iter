import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createAnswerSchema = z.object({
  roundId: objectIdSchema,
  code: z.string().min(1, "Code cannot be empty"),
  isDecoy: z.boolean().optional().default(false),
});

export const updateAnswerSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").optional(),
  isDecoy: z.boolean().optional(),
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
