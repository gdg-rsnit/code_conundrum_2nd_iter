import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  createQuestionsWithAnswers,
  getQuestionsbyRound,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  deleteQuestionsByRound,
} from "../controllers/question.controller.js";

const router = express.Router();


router.post("/createQuestions", authenticate, authorizeAdmin, createQuestionsWithAnswers);

// Get all questions for a round - GET /questions/round/:roundId
router.get("/round/:roundId", authenticate, authorizeAdmin, getQuestionsbyRound);

// Get single question - GET /questions/:questionId
router.get("/:questionId", authenticate, authorizeAdmin, getQuestionById);

// Update question - PATCH /questions/:questionId
router.patch("/:questionId", authenticate, authorizeAdmin, updateQuestion);

// Delete single question - DELETE /questions/:questionId
router.delete("/:questionId", authenticate, authorizeAdmin, deleteQuestion);

// Delete all questions for a round - DELETE /questions/round/:roundId
router.delete("/round/:roundId", authenticate, authorizeAdmin, deleteQuestionsByRound);

export default router;
