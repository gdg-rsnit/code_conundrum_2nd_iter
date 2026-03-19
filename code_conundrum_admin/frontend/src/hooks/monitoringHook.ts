import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  banTeamRequest,
  getMonitoringLogsRequest,
  getMonitoringSummaryRequest,
  penalizeTeamRequest,
} from "../services/monitoringService.js";
import type { MonitoringLogsQueryInput, PenalizeTeamInput, BanTeamInput } from "../../../schemas/monitoringSchema.js";

export const useMonitoringSummary = () => {
  return useQuery({
    queryKey: ["monitoringSummary"],
    queryFn: getMonitoringSummaryRequest,
    select: (response) => response.data,
    refetchInterval: 5000,
    staleTime: 3000,
    retry: 1,
  });
};

export const useMonitoringLogs = (query: MonitoringLogsQueryInput) => {
  return useQuery({
    queryKey: ["monitoringLogs", query.teamId, query.contestId, query.limit],
    queryFn: () => getMonitoringLogsRequest(query),
    select: (response) => response.data,
    enabled: Boolean(query.teamId),
    staleTime: 2000,
    retry: 1,
  });
};

export const useBanTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BanTeamInput) => banTeamRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringSummary"] });
      queryClient.invalidateQueries({ queryKey: ["monitoringLogs"] });
    },
  });
};

export const usePenalizeTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PenalizeTeamInput) => penalizeTeamRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringSummary"] });
      queryClient.invalidateQueries({ queryKey: ["monitoringLogs"] });
    },
  });
};
