import * as z from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const contestIdSchema = z.string().min(1, "contestId is required");

export const monitoringEventSchema = z.object({
  teamId: objectIdSchema,
  contestId: contestIdSchema,
  timestamp: z.iso.datetime().optional(),
});

export const banTeamSchema = z.object({
  teamId: objectIdSchema,
});

export const penalizeTeamSchema = z.object({
  teamId: objectIdSchema,
  contestId: z.string().optional(),
  penalty: z
    .object({
      scoreDeducted: z.number().int().nonnegative().optional().default(0),
      timeDeducted: z.number().int().nonnegative().optional().default(0),
      reason: z.string().min(1, "reason is required").default("Monitoring policy violation"),
    })
    .refine((value) => value.scoreDeducted > 0 || value.timeDeducted > 0, {
      error: "At least one of scoreDeducted or timeDeducted must be > 0",
      path: ["scoreDeducted"],
    }),
});

export const monitoringLogsQuerySchema = z.object({
  teamId: objectIdSchema.optional(),
  contestId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).optional().default(100),
});

export const monitoringSummaryItemSchema = z.object({
  teamId: objectIdSchema,
  teamName: z.string(),
  contestId: z.string(),
  fullscreenExitCount: z.number(),
  tabSwitchCount: z.number(),
  flagged: z.boolean(),
  autoBanned: z.boolean(),
  isBanned: z.boolean(),
  updatedAt: z.coerce.date().or(z.string()),
});

export const monitoringSummaryResponseSchema = z.object({
  success: z.boolean(),
  count: z.number().optional(),
  data: z.array(monitoringSummaryItemSchema),
});

export const monitoringLogItemSchema = z.object({
  id: z.string(),
  teamId: objectIdSchema,
  teamName: z.string(),
  contestId: z.string(),
  eventType: z.enum(["fullscreen_exit", "tab_switch"]),
  timestamp: z.coerce.date().or(z.string()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  isBanned: z.boolean(),
});

export const monitoringLogsResponseSchema = z.object({
  success: z.boolean(),
  count: z.number().optional(),
  data: z.array(monitoringLogItemSchema),
});

export type MonitoringEventInput = z.infer<typeof monitoringEventSchema>;
export type BanTeamInput = z.infer<typeof banTeamSchema>;
export type PenalizeTeamInput = z.infer<typeof penalizeTeamSchema>;
export type MonitoringLogsQueryInput = z.infer<typeof monitoringLogsQuerySchema>;
export type MonitoringSummaryItem = z.infer<typeof monitoringSummaryItemSchema>;
export type MonitoringSummaryResponse = z.infer<typeof monitoringSummaryResponseSchema>;
export type MonitoringLogItem = z.infer<typeof monitoringLogItemSchema>;
export type MonitoringLogsResponse = z.infer<typeof monitoringLogsResponseSchema>;
