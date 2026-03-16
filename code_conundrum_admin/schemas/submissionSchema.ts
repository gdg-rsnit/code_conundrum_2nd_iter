import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const answerSubmissionSchema = z.object({
  questionId: objectIdSchema,
  selectedAnswer: objectIdSchema,
});

export const createSubmissionSchema = z.object({
  teamId: objectIdSchema,
  roundId: objectIdSchema,
  answers: z
    .array(answerSubmissionSchema)
    .min(1, "At least one answer required"),
  timeTaken: z.number().int().nonnegative().optional(),
});

export const updateSubmissionSchema = z.object({
  score: z.number().nonnegative().optional(),
  isInvalidated: z.boolean().optional(),
});

export type AnswerSubmissionInput = z.infer<typeof answerSubmissionSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
