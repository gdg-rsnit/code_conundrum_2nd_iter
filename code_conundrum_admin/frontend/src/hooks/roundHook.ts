import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createRoundRequest,
	deleteRoundRequest,
	endRoundRequest,
	extendRoundRequest,
	getRoundByIdRequest,
	getRoundsRequest,
	pauseResumeRoundRequest,
	resetRoundRequest,
	startRoundRequest,
	updateRoundRequest,
} from "../services/roundService.js";
import type { CreateRoundInput, ExtendRoundInput, UpdateRoundInput } from "../../../schemas/roundSchema.js";

type RoundIdVariables = {
	roundId: string;
};

type UpdateRoundVariables = {
	roundId: string;
	payload: UpdateRoundInput;
};

type ExtendRoundVariables = {
	roundId: string;
	payload: ExtendRoundInput;
};

export const useGetRounds = () => {
	return useQuery({
		queryKey: ["getRounds"],
		queryFn: getRoundsRequest,
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 1,
		select: (data) => data.data,
	});
};

export const useGetRoundById = (roundId?: string) => {
	return useQuery({
		queryKey: ["getRoundById", roundId],
		queryFn: () => getRoundByIdRequest(roundId as string),
		enabled: Boolean(roundId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 1,
		select: (data) => data.data,
	});
};

export const useCreateRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateRoundInput) => createRoundRequest(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useUpdateRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId, payload }: UpdateRoundVariables) =>
			updateRoundRequest(roundId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useDeleteRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId }: RoundIdVariables) => deleteRoundRequest(roundId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useStartRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId }: RoundIdVariables) => startRoundRequest(roundId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const usePauseResumeRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId }: RoundIdVariables) => pauseResumeRoundRequest(roundId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useExtendRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId, payload }: ExtendRoundVariables) =>
			extendRoundRequest(roundId, payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useEndRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId }: RoundIdVariables) => endRoundRequest(roundId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};

export const useResetRound = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roundId }: RoundIdVariables) => resetRoundRequest(roundId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["getRounds"] });
			queryClient.invalidateQueries({ queryKey: ["getRoundById", variables.roundId] });
		},
		onError: (error: any) => console.error(error),
	});
};
