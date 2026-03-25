import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { Team, type ITeam } from "../models/teamModel.js";
import { User } from "../models/userModel.js";
import { Penalty, type IPenalty } from "../models/penaltyModel.js";
import { createPenaltySchema, updatePenaltySchema } from "../../schemas/penaltySchema.js";
import { ZodError } from "zod";
import { TeamRound } from "../models/teamRoundModel.js";
import bcrypt from "bcryptjs";
import { adminCreateTeamSchema } from "../../schemas/teamSchema.js";
import { WaitingPresence } from "../models/waitingPresenceModel.js";

const WAITING_ROOM_TTL_MS = 30 * 1000;

interface AuthenticatedRequest extends Request {
    user?: {
        role: "ADMIN" | "TEAM";
        teamId: string | null;
        _id: string;
    };
}

const getActiveWaitingTeams = async () => {
    const threshold = new Date(Date.now() - WAITING_ROOM_TTL_MS);
    await WaitingPresence.deleteMany({ lastSeenAt: { $lt: threshold } });

    const teams = await WaitingPresence.find({})
        .sort({ lastSeenAt: -1 })
        .lean();

    return teams.map((item: { teamId: unknown; teamName: string; members: string[]; lastSeenAt: Date }) => ({
        teamId: String(item.teamId),
        teamName: item.teamName,
        members: item.members,
        lastSeenAt: item.lastSeenAt.toISOString(),
    }));
};


//ban/unban
const updateTeamStatus = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { banned } = req.body;
    const bannedAt = banned ? new Date() : null;

    if (typeof banned !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "banned must be boolean"
        });
    }

    const team = await Team.findByIdAndUpdate(
        teamId,
        {
            banned,
            bannedAt
        },
        { new: true }
    );

    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found",
        });
    }

    await User.updateMany(
        { teamId: team._id, role: "TEAM" },
        { banned, bannedAt }
    );

    res.status(200).json({
        data: team,
        success: true,
        message: banned ? "Team banned successfully" : "Team unbanned successfully",
    });
});

const getBannedTeams = asyncHandler(async (req: Request, res: Response) => {
    const bannedTeams = await Team.find({ banned: true });
    res.status(200).json({
        data: bannedTeams,
        success: true,
        message: "Banned teams retrieved successfully",
    });
});


const getTeams = asyncHandler(async (req: Request, res: Response) => {
    const teams = await Team.find({});
    res.status(200).json({
        data: teams,
        success: true,
        message: "Teams retrieved successfully",
    });
});

const createTeamByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const parsed = adminCreateTeamSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error.issues });
    }

    const { teamName, memberOne, memberTwo, password } = parsed.data;

    if (memberOne.toLowerCase() === memberTwo.toLowerCase()) {
        return res.status(400).json({ success: false, message: "Members must be different" });
    }

    const existingTeam = await Team.findOne({ teamName: { $regex: new RegExp(`^${teamName}$`, "i") } }).lean();
    if (existingTeam) {
        return res.status(409).json({ success: false, message: "Team name already exists" });
    }

    const baseSlug = teamName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "team";

    let generatedEmail = `${baseSlug}@contest.local`;
    let suffix = 1;

    while (await User.findOne({ email: generatedEmail }).lean()) {
        generatedEmail = `${baseSlug}-${suffix}@contest.local`;
        suffix += 1;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const team = await Team.create({
        teamName,
        teamMembers: [memberOne, memberTwo],
    });

    await User.create({
        email: generatedEmail,
        password: hashedPassword,
        role: "TEAM",
        teamId: team._id,
    });

    res.status(201).json({
        success: true,
        message: "Team created successfully",
        data: {
            team,
            login: {
                email: generatedEmail,
                teamName: team.teamName,
            },
        },
    });
});

const markTeamWaiting = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== "TEAM" || !req.user.teamId) {
        return res.status(403).json({ success: false, message: "Only team accounts can mark waiting status" });
    }

    const team = await Team.findById(req.user.teamId).select("teamName teamMembers").lean();
    if (!team) {
        return res.status(404).json({ success: false, message: "Team not found" });
    }

    await WaitingPresence.findOneAndUpdate(
        { teamId: team._id },
        {
            teamId: team._id,
            teamName: team.teamName,
            members: team.teamMembers,
            lastSeenAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const activeTeams = await getActiveWaitingTeams();
    return res.status(200).json({
        success: true,
        message: "Waiting status updated",
        data: {
            waitingCount: activeTeams.length,
        },
    });
});

const getWaitingRoomCount = asyncHandler(async (req: Request, res: Response) => {
    const activeTeams = await getActiveWaitingTeams();
    return res.status(200).json({
        success: true,
        message: "Waiting room count fetched",
        data: {
            waitingCount: activeTeams.length,
        },
    });
});

const getWaitingRoomSnapshot = asyncHandler(async (req: Request, res: Response) => {
    const activeTeams = await getActiveWaitingTeams();
    return res.status(200).json({
        success: true,
        message: "Waiting room snapshot fetched",
        data: {
            waitingCount: activeTeams.length,
            teams: activeTeams,
        },
    });
});

const penalizeTeams = asyncHandler(async (req: Request, res: Response) => {
    const result = createPenaltySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
    }

    const { teamId, roundId, timeDeducted, scoreDeducted, reason } = result.data;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const penalty = new Penalty({ teamId, roundId, timeDeducted, scoreDeducted, reason });
    await penalty.save();

    let teamRound = await TeamRound.findOne({ teamId, roundId });
    if (!teamRound) {
        teamRound = await TeamRound.create({
            teamId,
            roundId,
            score: 0,
            time: 0
        });
    }

    const actualScoreDeduction = Math.min(teamRound.score, scoreDeducted || 0);
    const actualTimeDeduction = Math.min(teamRound.time, timeDeducted || 0);

    teamRound.score -= actualScoreDeduction;
    teamRound.time -= actualTimeDeduction;
    await teamRound.save();

    team.score = Math.max(0, (team.score || 0) - actualScoreDeduction);
    team.time = Math.max(0, (team.time || 0) - actualTimeDeduction);
    await team.save();

    res.status(201).json({
        success: true,
        message: "Penalty applied and scores updated",
        data: penalty,
    });
});

const getPenalizedTeams = asyncHandler(async (req: Request, res: Response) => {

    const penalties = await Penalty.find({})
        .sort({ createdAt: -1 });

    res.status(200).json({
        data: penalties,
        success: true,
        message: "Penalties retrieved successfully",
    });
});

const deletePenalty = asyncHandler(async (req: Request, res: Response) => {
    const { penaltyId } = req.params;

    const penalty = await Penalty.findById(penaltyId);
    if (!penalty) return res.status(404).json({ success: false, message: "Penalty not found" });

    const { teamId, roundId, scoreDeducted, timeDeducted } = penalty;

    const teamRound = await TeamRound.findOne({ teamId, roundId });
    if (teamRound) {
        teamRound.score += scoreDeducted || 0;
        teamRound.time += timeDeducted || 0;
        await teamRound.save();
    }

    const team = await Team.findById(teamId);
    if (team) {
        team.score = (team.score || 0) + (scoreDeducted || 0);
        team.time = (team.time || 0) + (timeDeducted || 0);
        await team.save();
    }

    await Penalty.deleteOne({ _id: penaltyId });

    res.status(200).json({
        success: true,
        message: "Penalty deleted and scores updated",
        data: penalty,
    });
});

export {
    getTeams,
    getBannedTeams,
    updateTeamStatus,
    penalizeTeams,
    getPenalizedTeams,
    deletePenalty,
    createTeamByAdmin,
    markTeamWaiting,
    getWaitingRoomCount,
    getWaitingRoomSnapshot,
};
