import express from "express"
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { 
    createRound, 
    getRounds, 
    getRoundById, 
    updateRound, 
    startRound, 
    pauseAndResume, 
    extendRound, 
    deleteRound, 
    endRound, 
    resetRound
} from "../controllers/round.controller.js";

const router = express.Router();

// CRUD operations
router.route("/").post(authenticate, authorizeAdmin, createRound).get(authenticate, authorizeAdmin, getRounds);
router.route("/:roundId")
    .get(authenticate, authorizeAdmin, getRoundById)
    .patch(authenticate, authorizeAdmin, updateRound)
    .delete(authenticate, authorizeAdmin, deleteRound);

// Round control operations
router.post("/:roundId/start", authenticate, authorizeAdmin, startRound);
router.post("/:roundId/end", authenticate, authorizeAdmin, endRound);
router.post("/:roundId/pause-resume", authenticate, authorizeAdmin, pauseAndResume);
router.post("/:roundId/extend", authenticate, authorizeAdmin, extendRound);
router.post("/:roundId/reset", authenticate, authorizeAdmin, resetRound);

export default router;