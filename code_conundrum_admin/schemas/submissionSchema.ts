import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createSubmissionSchema = z.object({
  teamId: objectIdSchema,
  roundId: objectIdSchema,
  questionsSolved: z.number().int().nonnegative(),
  timeSeconds: z.number().int().nonnegative(),
  submittedAt: z.iso.datetime().optional(),
  accuracy: z.number().min(0).max(100).optional(),
});

export const updateSubmissionSchema = z.object({
  questionsSolved: z.number().int().nonnegative().optional(),
  timeSeconds: z.number().int().nonnegative().optional(),
  submittedAt: z.iso.datetime().optional(),
  accuracy: z.number().min(0).max(100).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const submissionIdParamSchema = z.object({
  submissionId: objectIdSchema,
});

export const submissionQuerySchema = z.object({
  teamId: objectIdSchema.optional(),
  roundId: objectIdSchema.optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type SubmissionIdParam = z.infer<typeof submissionIdParamSchema>;
export type SubmissionQuery = z.infer<typeof submissionQuerySchema>;
