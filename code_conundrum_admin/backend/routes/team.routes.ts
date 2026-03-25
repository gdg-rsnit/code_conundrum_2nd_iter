import express from "express"

import {
    getTeams,
    getBannedTeams,
    penalizeTeams,
    getPenalizedTeams,
    deletePenalty,
    updateTeamStatus,
    createTeamByAdmin,
    markTeamWaiting,
    getWaitingRoomCount,
    getWaitingRoomSnapshot,
} from "../controllers/team.controller.js"

import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router();

// Team routes
router.get("/", authenticate, authorizeAdmin, getTeams);
router.post("/", authenticate, authorizeAdmin, createTeamByAdmin);
router.get("/banned", authenticate, authorizeAdmin, getBannedTeams);
router.patch("/:teamId/status", authenticate, authorizeAdmin, updateTeamStatus);
router.post("/waiting-room/heartbeat", authenticate, markTeamWaiting);
router.get("/waiting-room/count", authenticate, getWaitingRoomCount);
router.get("/waiting-room", authenticate, authorizeAdmin, getWaitingRoomSnapshot);

// Penalty routes
router.post("/:teamId/penalties", authenticate, authorizeAdmin, penalizeTeams);
router.get("/penalties/all", authenticate, authorizeAdmin, getPenalizedTeams);
router.delete("/penalties/:penaltyId", authenticate, authorizeAdmin, deletePenalty);

export default router;