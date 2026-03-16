import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { createAnswerSchema, createBulkAnswersSchema, updateAnswerSchema } from "../../schemas/answerSchema.js";
import { Answer } from "../models/answerModel.js";
import { Round } from "../models/roundModel.js";
import mongoose from "mongoose";


const createAnswer = asyncHandler(async (req: Request, res: Response) => {
  const result = createAnswerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { roundId, code } = result.data;

  const round = await Round.findById(roundId);
  if (!round) {
    res.status(404);
    throw new Error("Round not found");
  }

  if (round.status !== "DRAFT") {
    res.status(400);
    throw new Error("Can only add answers to DRAFT rounds");
  }

  const answer = await Answer.create({ roundId, code });

  return res.status(201).json({
    data: answer.toJSON(),
    success: true,
    message: "Answer successfully created",
  });
});


const getAnswersByRound = asyncHandler(async (req: Request, res: Response) => {
  const { roundId } = req.params;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    res.status(400);
    throw new Error("Invalid round ID");
  }

  const answers = await Answer.find({ roundId }).sort({ createdAt: -1 }).lean();

  return res.status(200).json({
    data: answers,
    success: true,
    message: "Successfully retrieved answers",
    count: answers.length,
  });
});

const getAnswerById = asyncHandler(async (req: Request, res: Response) => {
  const { answerId } = req.params;

  if (!answerId || !mongoose.Types.ObjectId.isValid(answerId)) {
    res.status(400);
    throw new Error("Invalid answer ID");
  }

  const answer = await Answer.findById(answerId).lean();

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  return res.status(200).json({
    data: answer,
    success: true,
    message: "Successfully retrieved answer",
  });
});

const updateAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { answerId } = req.params;

  if (!answerId || !mongoose.Types.ObjectId.isValid(answerId)) {
    res.status(400);
    throw new Error("Invalid answer ID");
  }

  const result = updateAnswerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const answer = await Answer.findByIdAndUpdate(
    answerId,
    { code: result.data.code },
    { new: true, lean: true }
  );

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  return res.status(200).json({
    data: answer,
    success: true,
    message: "Answer successfully updated",
  });
});

const deleteAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { answerId } = req.params;

  if (!answerId || !mongoose.Types.ObjectId.isValid(answerId)) {
    res.status(400);
    throw new Error("Invalid answer ID");
  }

  const answer = await Answer.findByIdAndDelete(answerId).lean();

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  return res.status(200).json({
    data: answer,
    success: true,
    message: "Answer successfully deleted",
  });
});

const deleteAnswersByRound = asyncHandler(async (req: Request, res: Response) => {
  const { roundId } = req.params;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    res.status(400);
    throw new Error("Invalid round ID");
  }

  const result = await Answer.deleteMany({ roundId });

  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("No answers found for this round");
  }

  return res.status(200).json({
    success: true,
    message: `${result.deletedCount} answers successfully deleted`,
    count: result.deletedCount,
  });
});

export {
  createAnswer,
  getAnswersByRound,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  deleteAnswersByRound,
};
