import * as z from "zod";

// ObjectId validation compatible with both frontend and backend
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createAnswerSchema = z.object({
  roundId: objectIdSchema,
  code: z.string().min(1, "Code cannot be empty"),
});

export const createBulkAnswersSchema = z.object({
  roundId: objectIdSchema,
  answers: z.array(z.string().min(1, "Code cannot be empty")).min(1, "At least one answer is required"),
});

export const updateAnswerSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
});

// Response schemas
export const answerItemSchema = z.object({
  _id: z.string(),
  roundId: z.string(),
  code: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

export const answersListResponseSchema = z.object({
  data: z.array(answerItemSchema),
  success: z.boolean(),
  message: z.string(),
  count: z.number().optional(),
}).passthrough();

export const answerResponseSchema = z.object({
  data: answerItemSchema,
  success: z.boolean(),
  message: z.string(),
}).passthrough();

export const deleteAnswerResponseSchema = z.object({
  message: z.string(),
}).passthrough();

export const deleteAnswersResponseSchema = z.object({
  message: z.string(),
}).passthrough();

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type CreateBulkAnswersInput = z.infer<typeof createBulkAnswersSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
export type AnswerItem = z.infer<typeof answerItemSchema>;
export type AnswersListResponse = z.infer<typeof answersListResponseSchema>;
export type AnswerResponse = z.infer<typeof answerResponseSchema>;
export type DeleteAnswerResponse = z.infer<typeof deleteAnswerResponseSchema>;
export type DeleteAnswersResponse = z.infer<typeof deleteAnswersResponseSchema>;
