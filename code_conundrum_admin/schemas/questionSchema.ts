import * as z from "zod";

// ObjectId validation compatible with both frontend and backend
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// Schema for creating questions with answers together
export const createQuestionsWithAnswersSchema = z.object({
  roundId: objectIdSchema,
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question cannot be empty"),
      correctAnswer: z.string().min(1, "Correct answer code cannot be empty"),
    })
  ).min(1, "At least one question is required"),
});

export const updateQuestionSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").optional(),
  correctAnswerId: objectIdSchema.optional(),
});

// Response schemas
export const questionItemSchema = z.object({
  _id: z.string(),
  roundId: z.string(),
  question: z.string(),
  correctAnswerId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

export const createQuestionsResponseSchema = z.object({
  data: z.object({
    questions: z.array(questionItemSchema),
    answers: z.array(z.any()),
  }),
  success: z.boolean(),
  message: z.string(),
  count: z.number().optional(),
}).passthrough();

export const questionsListResponseSchema = z.object({
  data: z.array(questionItemSchema),
  success: z.boolean(),
  message: z.string(),
  count: z.number().optional(),
}).passthrough();

export const questionResponseSchema = z.object({
  data: questionItemSchema,
  success: z.boolean(),
  message: z.string(),
}).passthrough();

export const deleteQuestionResponseSchema = z.object({
  message: z.string(),
}).passthrough();

export const deleteQuestionsResponseSchema = z.object({
  message: z.string(),
}).passthrough();

export type CreateQuestionsWithAnswersInput = z.infer<typeof createQuestionsWithAnswersSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionItem = z.infer<typeof questionItemSchema>;
export type CreateQuestionsResponse = z.infer<typeof createQuestionsResponseSchema>;
export type QuestionsListResponse = z.infer<typeof questionsListResponseSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type DeleteQuestionResponse = z.infer<typeof deleteQuestionResponseSchema>;
export type DeleteQuestionsResponse = z.infer<typeof deleteQuestionsResponseSchema>;
