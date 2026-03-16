import {
  createAnswerSchema,
  updateAnswerSchema,
  answerItemSchema,
  answersListResponseSchema,
  answerResponseSchema,
  deleteAnswerResponseSchema,
  deleteAnswersResponseSchema,
  type CreateAnswerInput,
  type UpdateAnswerInput,
  type AnswerItem,
  type AnswersListResponse,
  type AnswerResponse,
  type DeleteAnswerResponse,
  type DeleteAnswersResponse,
} from '../../../schemas/answerSchema.js';
import api from '../lib/axios.js';

export const createAnswerRequest = async (
  input: CreateAnswerInput
): Promise<AnswerItem> => {
  const inputValidation = createAnswerSchema.safeParse(input);
  if (!inputValidation.success) {
    throw inputValidation.error;
  }

  const { data } = await api.post('/admin/answers', inputValidation.data);
  const responseValidation = answerResponseSchema.safeParse(data);
  if (!responseValidation.success) {
    throw responseValidation.error;
  }

  const itemValidation = answerItemSchema.safeParse(responseValidation.data.data);
  if (!itemValidation.success) {
    throw itemValidation.error;
  }

  return itemValidation.data;
};

// Get answers by round
export const getAnswersByRoundRequest = async (
  roundId: string
): Promise<AnswersListResponse> => {
  const { data } = await api.get(`/admin/answers/round/${roundId}`);
  const validation = answersListResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Get answer by ID
export const getAnswerByIdRequest = async (
  answerId: string
): Promise<AnswerResponse> => {
  const { data } = await api.get(`/admin/answers/${answerId}`);
  const validation = answerResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Update answer
export const updateAnswerRequest = async (
  answerId: string,
  input: UpdateAnswerInput
): Promise<AnswerResponse> => {
  const inputValidation = updateAnswerSchema.safeParse(input);
  if (!inputValidation.success) {
    throw inputValidation.error;
  }
  const { data } = await api.patch(`/admin/answers/${answerId}`, inputValidation.data);
  const responseValidation = answerResponseSchema.safeParse(data);
  if (!responseValidation.success) {
    throw responseValidation.error;
  }
  return responseValidation.data;
};

// Delete single answer
export const deleteAnswerRequest = async (
  answerId: string
): Promise<DeleteAnswerResponse> => {
  const { data } = await api.delete(`/admin/answers/${answerId}`);
  const validation = deleteAnswerResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};

// Delete all answers by round
export const deleteAnswersByRoundRequest = async (
  roundId: string
): Promise<DeleteAnswersResponse> => {
  const { data } = await api.delete(`/admin/answers/round/${roundId}`);
  const validation = deleteAnswersResponseSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  return validation.data;
};
