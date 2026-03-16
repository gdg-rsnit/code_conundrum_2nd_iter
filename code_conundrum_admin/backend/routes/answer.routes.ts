import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  createAnswer,
  getAnswersByRound,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  deleteAnswersByRound,
} from "../controllers/answer.controller.js";

const router = express.Router();

router.post("/", authenticate, authorizeAdmin, createAnswer);
router.get("/round/:roundId", authenticate, authorizeAdmin, getAnswersByRound);
router.get("/:answerId", authenticate, authorizeAdmin, getAnswerById);

router.patch("/:answerId", authenticate, authorizeAdmin, updateAnswer);

router.delete("/:answerId", authenticate, authorizeAdmin, deleteAnswer);
router.delete("/round/:roundId", authenticate, authorizeAdmin, deleteAnswersByRound);

export default router;
