import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { Team, type ITeam } from "../models/teamModel.js";
import { Penalty, type IPenalty } from "../models/penaltySchema.js";
import { createPenaltySchema, updatePenaltySchema } from "../../schemas/penaltySchema.js";
import { ZodError } from "zod";
import { TeamRound } from "../models/teamRoundSchema.js";


//ban/unban
const updateTeamStatus = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { banned } = req.body;

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
            bannedAt: banned ? new Date() : null
        },
        { new: true }
    );

    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found",
        });
    }

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

export { getTeams, getBannedTeams, updateTeamStatus, penalizeTeams, getPenalizedTeams, deletePenalty };
