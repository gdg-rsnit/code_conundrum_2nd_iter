import {
  createQuestionsWithAnswersSchema,
  updateQuestionSchema,
  createQuestionsResponseSchema,
  questionsListResponseSchema,
  questionResponseSchema,
  deleteQuestionResponseSchema,
  deleteQuestionsResponseSchema,
  type CreateQuestionsWithAnswersInput,
  type UpdateQuestionInput,
  type CreateQuestionsResponse,
  type QuestionsListResponse,
  type QuestionResponse,
  type DeleteQuestionResponse,
  type DeleteQuestionsResponse,
} from '../../../schemas/questionSchema.js';
import api from '../lib/axios.js';

// Create questions with answers
export const createQuestionsWithAnswersRequest = async (
  input: CreateQuestionsWithAnswersInput
): Promise<CreateQuestionsResponse> => {
  const validation = createQuestionsWithAnswersSchema.safeParse(input);
  
  if (!validation.success) {
    throw validation.error;
  }

  const { data } = await api.post('/admin/questions/createQuestions', validation.data);
  const responseValidation = createQuestionsResponseSchema.safeParse(data);
  if (!responseValidation.success) {
    throw responseValidation.error;
  }
  return responseValidation.data;
};

// Get questions by round
export const getQuestionsByRoundRequest = async (
  roundId: string
): Promise<QuestionsListResponse> => {
  const { data } = await api.get(`/admin/questions/round/${roundId}`);
  const validation = questionsListResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Get question by ID
export const getQuestionByIdRequest = async (
  questionId: string
): Promise<QuestionResponse> => {
  const { data } = await api.get(`/admin/questions/${questionId}`);
  const validation = questionResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Update question
export const updateQuestionRequest = async (
  questionId: string,
  input: UpdateQuestionInput
): Promise<QuestionResponse> => {
  const inputValidation = updateQuestionSchema.safeParse(input);
  if (!inputValidation.success) {
    throw inputValidation.error;
  }
  const { data } = await api.patch(`/admin/questions/${questionId}`, inputValidation.data);
  const responseValidation = questionResponseSchema.safeParse(data);
  if (!responseValidation.success) {
    throw responseValidation.error;
  }
  return responseValidation.data;
};

// Delete single question
export const deleteQuestionRequest = async (
  questionId: string
): Promise<DeleteQuestionResponse> => {
  const { data } = await api.delete(`/admin/questions/${questionId}`);
  const validation = deleteQuestionResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Delete all questions by round
export const deleteQuestionsByRoundRequest = async (
  roundId: string
): Promise<DeleteQuestionsResponse> => {
  const { data } = await api.delete(`/admin/questions/round/${roundId}`);
  const validation = deleteQuestionsResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};
