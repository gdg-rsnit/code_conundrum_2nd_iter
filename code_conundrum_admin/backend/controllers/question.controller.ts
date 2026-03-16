import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { updateQuestionSchema, createQuestionsWithAnswersSchema } from "../../schemas/questionSchema.js";
import { Question } from "../models/questionModel.js";
import { Answer } from "../models/answerModel.js";
import { Round } from "../models/roundModel.js";
import mongoose from "mongoose";

const createQuestionsWithAnswers = asyncHandler(async (req: Request, res: Response) => {
  const result = createQuestionsWithAnswersSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { roundId, questions } = result.data;

  const round = await Round.findById(roundId);
  if (!round) {
    res.status(404);
    throw new Error("Round not found");
  }

  if (round.status !== "DRAFT") {
    res.status(400);
    throw new Error("Can only add questions to DRAFT rounds");
  }

  try {
    const answersToCreate = questions.map((q) => ({
      roundId,
      code: q.correctAnswer,
    }));

    const createdAnswers = await Answer.insertMany(answersToCreate);

    if (!createdAnswers || createdAnswers.length === 0 || createdAnswers.length !== questions.length) {
      res.status(400);
      throw new Error("Failed to create answers");
    }

    const questionsToCreate = questions.map((q, index) => {
      const correctAnswer = createdAnswers[index];
      if (!correctAnswer) {
        throw new Error(`Failed to map answer for question at index ${index}`);
      }
      return {
        roundId,
        question: q.question,
        correctAnswerId: correctAnswer._id,
      };
    });

    const createdQuestions = await Question.insertMany(questionsToCreate);

    if (!createdQuestions || createdQuestions.length === 0) {
      // Rollback: delete created answers
      await Answer.deleteMany({ _id: { $in: createdAnswers.map((a) => a._id) } });
      res.status(400);
      throw new Error("Failed to create questions");
    }

    return res.status(201).json({
      data: {
        questions: createdQuestions,
        answers: createdAnswers,
      },
      success: true,
      message: `${createdQuestions.length} questions with ${createdAnswers.length} answers successfully created`,
      count: createdQuestions.length,
    });
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || "Failed to create questions with answers");
  }
});

const getQuestionsbyRound = asyncHandler(async (req: Request, res: Response) => {
  const { roundId } = req.params;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    res.status(400);
    throw new Error("Invalid round ID");
  }

  const questions = await Question.find({ roundId: new mongoose.Types.ObjectId(roundId) }).sort({ createdAt: -1 });

  if (!questions) {
    throw new Error("Questions not found");
  }

  return res.status(200).json({
    data: questions,
    success: true,
    message: "Successfully retrieved questions",
    count: questions.length,
  });
});

const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const question = await Question.findById(questionId);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  return res.status(200).json({
    data: question,
    success: true,
    message: "Successfully retrieved question",
  });
});

const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    res.status(400);
    throw new Error("Invalid question ID");
  }


  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    res.status(400);
    throw new Error("Invalid question ID");
  }

  const result = updateQuestionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const question = await Question.findByIdAndUpdate(questionId, result.data, {
    new: true,
  });

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  return res.status(200).json({
    data: question,
    success: true,
    message: "Question successfully updated",
  });
});

const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;

  if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
    res.status(400);
    throw new Error("Invalid question ID");
  }

  const question = await Question.findByIdAndDelete(questionId);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  return res.status(200).json({
    data: question,
    success: true,
    message: "Question successfully deleted",
  });
});

const deleteQuestionsByRound = asyncHandler(async (req: Request, res: Response) => {
  const { roundId } = req.params;

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    res.status(400);
    throw new Error("Invalid round ID");
  }

  const result = await Question.deleteMany({ roundId: new mongoose.Types.ObjectId(roundId) });

  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("No questions found for this round");
  }

  return res.status(200).json({
    success: true,
    message: `${result.deletedCount} questions successfully deleted`,
    count: result.deletedCount,
  });
});

export {
  createQuestionsWithAnswers,
  getQuestionsbyRound,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  deleteQuestionsByRound,
};
