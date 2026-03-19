import mongoose from "mongoose";
import { MonitoringLog, type MonitoringEventType } from "../models/monitoringLogModel.js";
import { MonitoringSummary } from "../models/monitoringSummaryModel.js";
import { Team } from "../models/teamModel.js";
import { User } from "../models/userModel.js";
import { Penalty } from "../models/penaltyModel.js";
import { TeamRound } from "../models/teamRoundModel.js";

const FLAG_THRESHOLD = 3;
const AUTO_BAN_THRESHOLD = 5;

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

  if (!summary.autoBanned && summary.fullscreenExitCount > AUTO_BAN_THRESHOLD) {
    summary.autoBanned = true;
    summary.autoBannedAt = new Date();

    await Promise.all([
      Team.findByIdAndUpdate(input.teamId, { banned: true, bannedAt: new Date() }),
      User.updateMany(
        { teamId: new mongoose.Types.ObjectId(input.teamId), role: "TEAM" },
        { banned: true, bannedAt: new Date() }
      ),
    ]);
  }

  await summary.save();

  return { log, summary };
};

export const getMonitoringSummary = async () => {
  const summaries = await MonitoringSummary.find({})
    .populate("teamId", "teamName banned")
    .sort({ updatedAt: -1 })
    .lean();

  return summaries.map((item: any) => ({
    teamId: String(item.teamId?._id || item.teamId),
    teamName: item.teamId?.teamName || "UNKNOWN TEAM",
    contestId: item.contestId,
    fullscreenExitCount: Number(item.fullscreenExitCount || 0),
    tabSwitchCount: Number(item.tabSwitchCount || 0),
    flagged: Boolean(item.flagged),
    autoBanned: Boolean(item.autoBanned),
    isBanned: Boolean(item.teamId?.banned),
    updatedAt: item.updatedAt,
  }));
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
