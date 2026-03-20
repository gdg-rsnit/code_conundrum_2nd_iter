import type { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import {
  banTeamSchema,
  monitoringEventSchema,
  monitoringLogsQuerySchema,
  penalizeTeamSchema,
} from "../../schemas/monitoringSchema.js";
import {
  banTeam,
  getMonitoringLogs,
  getMonitoringSummary,
  penalizeTeam,
  recordMonitoringEvent,
  clearAllLogs,
} from "../services/monitoring.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    _id: string;
    role: "ADMIN" | "TEAM";
    teamId?: string | null;
  };
};

const getClientIp = (req: Request) => {
  const xff = req.headers["x-forwarded-for"];
  if (Array.isArray(xff)) {
    return xff[0] || null;
  }
  if (typeof xff === "string") {
    return xff.split(",")[0]?.trim() || null;
  }
  return req.ip || null;
};

export const logFullscreenExit = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = monitoringEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const body = parsed.data;
  const effectiveTeamId =
    req.user?.role === "TEAM"
      ? req.user.teamId
        ? String(req.user.teamId)
        : null
      : body.teamId;

  if (!effectiveTeamId) {
    return res.status(403).json({ success: false, message: "Team mapping missing for current user" });
  }

  const result = await recordMonitoringEvent({
    teamId: effectiveTeamId,
    contestId: body.contestId,
    eventType: "fullscreen_exit",
    ...(body.timestamp ? { timestamp: body.timestamp } : {}),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] || null,
  });

  return res.status(200).json({
    success: true,
    message: "Fullscreen exit logged",
    data: {
      teamId: effectiveTeamId,
      contestId: body.contestId,
      fullscreenExitCount: result.summary.fullscreenExitCount,
      tabSwitchCount: result.summary.tabSwitchCount,
      flagged: result.summary.flagged,
      autoBanned: result.summary.autoBanned,
    },
  });
});

export const logTabSwitch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = monitoringEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const body = parsed.data;
  const effectiveTeamId =
    req.user?.role === "TEAM"
      ? req.user.teamId
        ? String(req.user.teamId)
        : null
      : body.teamId;

  if (!effectiveTeamId) {
    return res.status(403).json({ success: false, message: "Team mapping missing for current user" });
  }

  const result = await recordMonitoringEvent({
    teamId: effectiveTeamId,
    contestId: body.contestId,
    eventType: "tab_switch",
    ...(body.timestamp ? { timestamp: body.timestamp } : {}),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] || null,
  });

  return res.status(200).json({
    success: true,
    message: "Tab switch logged",
    data: {
      teamId: effectiveTeamId,
      contestId: body.contestId,
      fullscreenExitCount: result.summary.fullscreenExitCount,
      tabSwitchCount: result.summary.tabSwitchCount,
      flagged: result.summary.flagged,
      autoBanned: result.summary.autoBanned,
    },
  });
});

export const fetchMonitoringSummary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getMonitoringSummary();
  return res.status(200).json({ success: true, data, count: data.length });
});

export const fetchMonitoringLogs = asyncHandler(async (req: Request, res: Response) => {
  const parsed = monitoringLogsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const logs = await getMonitoringLogs({
    limit: parsed.data.limit,
    ...(parsed.data.teamId ? { teamId: parsed.data.teamId } : {}),
    ...(parsed.data.contestId ? { contestId: parsed.data.contestId } : {}),
  });
  return res.status(200).json({ success: true, data: logs, count: logs.length });
});

export const banTeamByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const parsed = banTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const team = await banTeam(parsed.data.teamId);
  return res.status(200).json({
    success: true,
    message: "Team banned successfully",
    data: team,
  });
});

export const penalizeTeamByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const parsed = penalizeTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues });
  }

  const result = await penalizeTeam({
    teamId: parsed.data.teamId,
    ...(parsed.data.contestId ? { contestId: parsed.data.contestId } : {}),
    scoreDeducted: parsed.data.penalty.scoreDeducted,
    timeDeducted: parsed.data.penalty.timeDeducted,
    reason: parsed.data.penalty.reason,
  });

  return res.status(200).json({
    success: true,
    message: "Penalty applied successfully",
    data: result,
  });
});

export const clearAllLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await clearAllLogs();

  return res.status(200).json({
    success: true,
    message: "All monitoring logs cleared successfully",
    data: result,
  });
});
