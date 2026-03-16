import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQuestionsWithAnswersRequest,
  getQuestionsByRoundRequest,
  getQuestionByIdRequest,
  updateQuestionRequest,
  deleteQuestionRequest,
  deleteQuestionsByRoundRequest,
} from '../services/questionService.js';
import type {
  CreateQuestionsWithAnswersInput,
  UpdateQuestionInput,
} from '../../../schemas/questionSchema.js';

const normalizeQuestions = (payload: { data?: unknown }) => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (
    payload?.data &&
    typeof payload.data === 'object' &&
    Array.isArray((payload.data as { questions?: unknown[] }).questions)
  ) {
    return (payload.data as { questions: unknown[] }).questions;
  }

  return [];
};

// Query: Get questions by round
export const useGetQuestionsByRound = (roundId?: string) => {
  return useQuery({
    queryKey: ['questions', 'round', roundId],
    queryFn: () => getQuestionsByRoundRequest(roundId!),
    enabled: !!roundId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: normalizeQuestions,
  });
};

// Query: Get question by ID
export const useGetQuestionById = (questionId?: string) => {
  return useQuery({
    queryKey: ['questions', questionId],
    queryFn: () => getQuestionByIdRequest(questionId!),
    enabled: !!questionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
};

// Mutation: Create questions with answers
export const useCreateQuestionsWithAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateQuestionsWithAnswersInput) =>
      createQuestionsWithAnswersRequest(variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', 'round', variables.roundId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['answers', 'round', variables.roundId] });
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
};

// Mutation: Update question
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { questionId: string; input: UpdateQuestionInput }) =>
      updateQuestionRequest(variables.questionId, variables.input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

// Mutation: Delete single question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteQuestionRequest(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

// Mutation: Delete questions by round
export const useDeleteQuestionsByRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roundId: string) => deleteQuestionsByRoundRequest(roundId),
    onSuccess: (data, roundId) => {
      queryClient.invalidateQueries({ queryKey: ['questions', 'round', roundId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
