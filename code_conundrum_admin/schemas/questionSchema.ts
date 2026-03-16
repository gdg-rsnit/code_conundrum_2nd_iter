import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createQuestionSchema = z.object({
  roundId: objectIdSchema,
  question: z.string().min(1, "Question cannot be empty"),
  correctAnswerId: objectIdSchema,
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export const updateQuestionSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").optional(),
  correctAnswerId: objectIdSchema.optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
