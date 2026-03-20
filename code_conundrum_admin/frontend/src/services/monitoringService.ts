import api from "../lib/axios.js";
import {
  monitoringLogsQuerySchema,
  monitoringLogsResponseSchema,
  monitoringSummaryResponseSchema,
  penalizeTeamSchema,
  banTeamSchema,
  type MonitoringLogsQueryInput,
  type MonitoringLogsResponse,
  type MonitoringSummaryResponse,
  type PenalizeTeamInput,
  type BanTeamInput,
} from "../../../schemas/monitoringSchema.js";

export const getMonitoringSummaryRequest = async (): Promise<MonitoringSummaryResponse> => {
  const { data } = await api.get("/admin/monitoring");
  const parsed = monitoringSummaryResponseSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const sanitizedRows = rows
    .map((item: any) => ({
      teamId: String(item?.teamId || ""),
      teamName: String(item?.teamName || "UNKNOWN TEAM"),
      contestId: String(item?.contestId || ""),
      fullscreenExitCount: Number(item?.fullscreenExitCount || 0),
      tabSwitchCount: Number(item?.tabSwitchCount || 0),
      flagged: Boolean(item?.flagged),
      autoBanned: Boolean(item?.autoBanned),
      isBanned: Boolean(item?.isBanned),
      updatedAt: item?.updatedAt || new Date().toISOString(),
    }))
    .filter((item: any) => item.teamId.length > 0);

  return {
    success: Boolean(data?.success),
    count: sanitizedRows.length,
    data: sanitizedRows,
  };
};

export const getMonitoringLogsRequest = async (
  query: MonitoringLogsQueryInput
): Promise<MonitoringLogsResponse> => {
  const parsedQuery = monitoringLogsQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    throw parsedQuery.error;
  }

  const params = new URLSearchParams();
  if (parsedQuery.data.teamId) params.set("teamId", parsedQuery.data.teamId);
  if (parsedQuery.data.contestId) params.set("contestId", parsedQuery.data.contestId);
  params.set("limit", String(parsedQuery.data.limit));

  const { data } = await api.get(`/admin/monitoring/logs?${params.toString()}`);
  const parsed = monitoringLogsResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
};

export const banTeamRequest = async (payload: BanTeamInput) => {
  const parsedPayload = banTeamSchema.safeParse(payload);
  if (!parsedPayload.success) {
    throw parsedPayload.error;
  }
  const { data } = await api.post("/admin/ban-team", parsedPayload.data);
  return data;
};

export const penalizeTeamRequest = async (payload: PenalizeTeamInput) => {
  const parsedPayload = penalizeTeamSchema.safeParse(payload);
  if (!parsedPayload.success) {
    throw parsedPayload.error;
  }
  const { data } = await api.post("/admin/penalize-team", parsedPayload.data);
  return data;
};

export const clearAllLogsRequest = async () => {
  const { data } = await api.post("/admin/clear-logs");
  return data;
};
