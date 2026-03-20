import mongoose from "mongoose";
import { MonitoringLog, type MonitoringEventType } from "../models/monitoringLogModel.js";
import { MonitoringSummary } from "../models/monitoringSummaryModel.js";
import { Team } from "../models/teamModel.js";
import { User } from "../models/userModel.js";
import { Penalty } from "../models/penaltyModel.js";
import { TeamRound } from "../models/teamRoundModel.js";

const FLAG_THRESHOLD = 3;

type RecordEventInput = {
  teamId: string;
  contestId: string;
  eventType: MonitoringEventType;
  timestamp?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const recordMonitoringEvent = async (input: RecordEventInput) => {
  const eventTimestamp = input.timestamp ? new Date(input.timestamp) : new Date();

  const log = await MonitoringLog.create({
    teamId: new mongoose.Types.ObjectId(input.teamId),
    contestId: input.contestId,
    eventType: input.eventType,
    timestamp: eventTimestamp,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });

  const incrementField =
    input.eventType === "fullscreen_exit"
      ? { fullscreenExitCount: 1 }
      : { tabSwitchCount: 1 };

  const summary = await MonitoringSummary.findOneAndUpdate(
    { teamId: new mongoose.Types.ObjectId(input.teamId), contestId: input.contestId },
    {
      $inc: incrementField,
      $setOnInsert: {
        flagged: false,
        autoBanned: false,
        autoBannedAt: null,
      },
    },
    { new: true, upsert: true }
  );

  if (!summary) {
    throw new Error("Failed to update monitoring summary");
  }

  if (!summary.flagged && summary.fullscreenExitCount > FLAG_THRESHOLD) {
    summary.flagged = true;
  }

  await summary.save();

  return { log, summary };
};

export const getMonitoringSummary = async () => {
  const [teams, groupedLogs, summaryDocs] = await Promise.all([
    Team.find({}).select("teamName banned updatedAt").lean(),
    MonitoringLog.aggregate([
      {
        $group: {
          _id: { teamId: "$teamId", contestId: "$contestId" },
          fullscreenExitCount: {
            $sum: {
              $cond: [{ $eq: ["$eventType", "fullscreen_exit"] }, 1, 0],
            },
          },
          tabSwitchCount: {
            $sum: {
              $cond: [{ $eq: ["$eventType", "tab_switch"] }, 1, 0],
            },
          },
          updatedAt: { $max: "$timestamp" },
        },
      },
      { $sort: { updatedAt: -1 } },
    ]),
    MonitoringSummary.find({}).lean(),
  ]);

  const teamById = new Map(
    teams.map((team: any) => [String(team._id), team])
  );

  const summaryByKey = new Map(
    summaryDocs.map((item: any) => [
      `${String(item.teamId)}::${String(item.contestId || "")}`,
      item,
    ])
  );

  const summaryRows = groupedLogs.map((item: any) => {
    const teamId = String(item?._id?.teamId || "");
    const contestId = String(item?._id?.contestId || "");
    const team = teamById.get(teamId);
    const summaryDoc = summaryByKey.get(`${teamId}::${contestId}`);

    return {
      teamId,
      teamName: team?.teamName || "UNKNOWN TEAM",
      contestId,
      fullscreenExitCount: Number(item.fullscreenExitCount || 0),
      tabSwitchCount: Number(item.tabSwitchCount || 0),
      flagged:
        summaryDoc?.flagged !== undefined
          ? Boolean(summaryDoc.flagged)
          : Number(item.fullscreenExitCount || 0) > FLAG_THRESHOLD,
      autoBanned: Boolean(summaryDoc?.autoBanned),
      isBanned: Boolean(team?.banned),
      updatedAt: item.updatedAt || team?.updatedAt || new Date().toISOString(),
    };
  });

  const activeRows = summaryRows.filter(
    (row) => Number(row.fullscreenExitCount || 0) + Number(row.tabSwitchCount || 0) > 0
  );

  return activeRows.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const getMonitoringLogs = async (params: {
  teamId?: string;
  contestId?: string;
  limit: number;
}) => {
  const filter: Record<string, unknown> = {};
  if (params.teamId) {
    filter.teamId = new mongoose.Types.ObjectId(params.teamId);
  }
  if (params.contestId) {
    filter.contestId = params.contestId;
  }

  const logs = await MonitoringLog.find(filter)
    .populate("teamId", "teamName banned")
    .sort({ timestamp: -1 })
    .limit(params.limit)
    .lean();

  return logs.map((item: any) => ({
    id: String(item._id),
    teamId: String(item.teamId?._id || item.teamId),
    teamName: item.teamId?.teamName || "UNKNOWN TEAM",
    contestId: item.contestId,
    eventType: item.eventType,
    timestamp: item.timestamp,
    ipAddress: item.ipAddress,
    userAgent: item.userAgent,
    isBanned: Boolean(item.teamId?.banned),
  }));
};

export const banTeam = async (teamId: string) => {
  const now = new Date();

  const team = await Team.findByIdAndUpdate(
    teamId,
    { banned: true, bannedAt: now },
    { new: true }
  ).lean();

  if (!team) {
    throw new Error("Team not found");
  }

  await User.updateMany(
    { teamId: new mongoose.Types.ObjectId(teamId), role: "TEAM" },
    { banned: true, bannedAt: now }
  );

  return team;
};

export const penalizeTeam = async (input: {
  teamId: string;
  contestId?: string;
  scoreDeducted: number;
  timeDeducted: number;
  reason: string;
}) => {
  const team = await Team.findById(input.teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  const scoreDeducted = Math.max(0, Number(input.scoreDeducted || 0));
  const timeDeducted = Math.max(0, Number(input.timeDeducted || 0));

  if (!scoreDeducted && !timeDeducted) {
    throw new Error("At least one penalty value must be greater than zero");
  }

  const contestId = input.contestId || "";
  const isObjectIdContest = mongoose.Types.ObjectId.isValid(contestId);

  let penaltyDoc = null;
  if (isObjectIdContest) {
    penaltyDoc = await Penalty.create({
      teamId: new mongoose.Types.ObjectId(input.teamId),
      roundId: new mongoose.Types.ObjectId(contestId),
      scoreDeducted,
      timeDeducted,
      reason: input.reason,
    });

    const teamRound = await TeamRound.findOne({
      teamId: new mongoose.Types.ObjectId(input.teamId),
      roundId: new mongoose.Types.ObjectId(contestId),
    });

    if (teamRound) {
      teamRound.score = Math.max(0, Number(teamRound.score || 0) - scoreDeducted);
      teamRound.time = Math.max(0, Number(teamRound.time || 0) - timeDeducted);
      await teamRound.save();
    }
  }

  team.score = Math.max(0, Number(team.score || 0) - scoreDeducted);
  team.time = Math.max(0, Number(team.time || 0) - timeDeducted);
  await team.save();

  return {
    team,
    penalty: penaltyDoc,
  };
};

export const clearAllLogs = async () => {
  const deleteLogsResult = await MonitoringLog.deleteMany({});
  const deleteSummaryResult = await MonitoringSummary.deleteMany({});

  return {
    logsDeleted: deleteLogsResult.deletedCount,
    summariesDeleted: deleteSummaryResult.deletedCount,
  };
};
