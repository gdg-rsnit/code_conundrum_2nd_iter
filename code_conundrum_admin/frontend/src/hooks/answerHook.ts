import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnswerRequest,
  getAnswersByRoundRequest,
  getAnswerByIdRequest,
  updateAnswerRequest,
  deleteAnswerRequest,
  deleteAnswersByRoundRequest,
} from '../services/answerService.js';
import type { CreateAnswerInput, UpdateAnswerInput } from '../../../schemas/answerSchema.js';

const normalizeAnswers = (payload: { data?: unknown }) => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (
    payload?.data &&
    typeof payload.data === 'object' &&
    Array.isArray((payload.data as { answers?: unknown[] }).answers)
  ) {
    return (payload.data as { answers: unknown[] }).answers;
  }

  return [];
};

// Query: Get answers by round
export const useGetAnswersByRound = (roundId?: string) => {
  return useQuery({
    queryKey: ['answers', 'round', roundId],
    queryFn: () => getAnswersByRoundRequest(roundId!),
    enabled: !!roundId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: normalizeAnswers,
  });
};

// Query: Get answer by ID
export const useGetAnswerById = (answerId?: string) => {
  return useQuery({
    queryKey: ['answers', answerId],
    queryFn: () => getAnswerByIdRequest(answerId!),
    enabled: !!answerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateAnswerInput) => createAnswerRequest(variables),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', 'round', variables.roundId] });
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
};

// Mutation: Update answer
export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { answerId: string; input: UpdateAnswerInput }) =>
      updateAnswerRequest(variables.answerId, variables.input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', variables.answerId] });
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
};

// Mutation: Delete single answer
export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: string) => deleteAnswerRequest(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
};

// Mutation: Delete answers by round
export const useDeleteAnswersByRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roundId: string) => deleteAnswersByRoundRequest(roundId),
    onSuccess: (data, roundId) => {
      queryClient.invalidateQueries({ queryKey: ['answers', 'round', roundId] });
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
};
