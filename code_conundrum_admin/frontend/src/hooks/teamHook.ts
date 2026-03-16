import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deletePenaltyRequest,
    getAllTeamsRequest,
    getBannedTeamsRequest,
    getPenalizedTeamsRequest,
    penalizeTeamsRequest,
    updateTeamStatusRequest,
} from "../services/teamService.js";
import type { CreatePenaltyInput } from "../../../schemas/penaltySchema.js";

type UpdateTeamStatusVariables = {
    teamId: string;
    banned: boolean;
};

type PenalizeTeamVariables = {
    teamId: string;
    payload: Omit<CreatePenaltyInput, "teamId">;
};

export const useGetAllTeams = () => {
    return useQuery({
        queryFn: getAllTeamsRequest,
        queryKey: ["getAllTeams"],
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        select: (data) => data.data,
    });
};

export const useGetBannedTeams = () =>{
    return useQuery({
        queryKey: ["getBannedTeams"],
        queryFn: getBannedTeamsRequest,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        select: (data) => data.data,
    });
}

export const useUpdateTeamStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, banned }: UpdateTeamStatusVariables) =>
            updateTeamStatusRequest(teamId, banned),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAllTeams"] });
            queryClient.invalidateQueries({ queryKey: ["getBannedTeams"] });
        },
        onError: (error: any) => console.error(error),
    });
};

export const usePenalizeTeams = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, payload }: PenalizeTeamVariables) =>
            penalizeTeamsRequest(teamId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getPenalizedTeams"] });
            queryClient.invalidateQueries({ queryKey: ["getAllTeams"] });
            queryClient.invalidateQueries({ queryKey: ["getBannedTeams"] });
        },
        onError: (error: any) => console.error(error),
    });
};

export const useGetPenalizedTeams = () => {
    return useQuery({
        queryKey: ["getPenalizedTeams"],
        queryFn: getPenalizedTeamsRequest,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        select: (data) => data.data,
    });
};

export const useDeletePenalty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (penaltyId: string) => deletePenaltyRequest(penaltyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getPenalizedTeams"] });
            queryClient.invalidateQueries({ queryKey: ["getAllTeams"] });
            queryClient.invalidateQueries({ queryKey: ["getBannedTeams"] });
        },
        onError: (error: any) => console.error(error),
    });
};