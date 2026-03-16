import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express";
import { createRoundSchema, updateRoundSchema } from "../../schemas/roundSchema.js";
import { Round } from "../models/roundModel.js";
import mongoose, { Types } from "mongoose";
import { Question } from "../models/questionModel.js";
import { Submission } from "../models/submissionModel.js";
import { Penalty } from "../models/penaltySchema.js";
import { Answer } from "../models/answerModel.js";

const createRound = asyncHandler(async (req: Request, res: Response) => {
    const result = createRoundSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
    }
    const { roundNumber, duration, status } = result.data
    const roundNo = await Round.findOne({ roundNumber });
    if (roundNo) {
        return res.status(400).json({ error: "roundno already exists" });
    }

    const round = await Round.create({ roundNumber, duration, status });

    if (!round) {
        res.status(400);
        throw new Error("round not created");
    }

    return res.status(201).json({ data: round, success: true, message: "round successfully created" });
})

const getRounds = asyncHandler(async (req: Request, res: Response) => {
    const rounds = await Round.find({}).sort({createdAt:-1})
    if (!rounds) {
        throw new Error("Round not found")
    }
    return res.status(200).json({data:rounds,success:true,message:"successfully retrieved rounds"})
})

const getRountById=asyncHandler(async(req:Request,res:Response)=>{
    const {roundId}=req.params;
    const round=await Round.findById(roundId);
    if(!round){
        res.status(404);
        throw new Error("round not found")
    }
    return res.status(200).json({data:round,success:true,message:"successfully retrieved round"})
})

const updateRound=asyncHandler(async(req:Request,res:Response)=>{
    const {roundId}=req.params;
    const result=updateRoundSchema.safeParse(req.body);
    if (!result.success){
        return res.status(400).json({ error: result.error.issues });
    }
    const {roundNumber,duration}=result.data;

    const round=await Round.findById(roundId);
    if(!round){
        return res.status(404).json({success:false,message:"round not found"})
    }

    if (round.status==="LIVE"){
        return res.status(400).json({success:false,message:"cannot edit a Live round"})
    }

        if (roundNumber !== undefined && roundNumber !== round.roundNumber) {
            const existingRound = await Round.findOne({
                roundNumber,
                _id: { $ne: new Types.ObjectId(roundId) }
            });

        if (existingRound) {
            return res.status(400).json({
                success: false,
                message: "round number already exists"
            });
        }

        round.roundNumber = roundNumber;
    }
    if (duration !== undefined) round.duration = duration;

    const updatedRound = await round.save();

    return res.status(200).json({
        success: true,
        message: "round updated successfully",
        data: updatedRound
    });
});

const startRound=asyncHandler(async(req:Request,res:Response)=>{
    const {roundId}=req.params

    const round=await Round.findById(roundId);
    if (!round){
        return res.status(404).json({message:"round not found"})
    }

    const anyLiveRound=await Round.findOne({status:"LIVE"})
    
    if(anyLiveRound){
        return res.status(400).json({message:"cannot start a round while another is ongoing"})
    }

    round.status="LIVE";
    round.startTime=new Date();
    round.endTime=new Date(Date.now()+round.duration*1000)

    const startedRound=await round.save();
     
    if (!startedRound){
        return res.status(400).json({success:false,message:"could not start round"})
    }
    return res.status(200).json({data:startedRound,message:"round has started",success:true})
    
})

const pauseAndResume=asyncHandler(async(req:Request,res:Response)=>{
    const {id}=req.params;
    
    const round=await Round.findById(id);
    
    if(!round){
        return res.status(404).json({success:false,message:"round not found"})
    }

    if (round.status!=="LIVE"){
        return res.status(400).json({success:false,message:"only live rounds can be paused/resumed"})
    }
    const now=new Date();
    if(!round.isPaused){
        round.isPaused=true;
        round.pauseStartAt=now;
        
        await round.save();

        return res.status(200).json({success:true,message:"round paused successfully",data:round})
    }

    if (round.isPaused){
        if(!round.pauseStartAt){
            return res.status(400).json({
                success:false,
                message:"the round isn't paused"
            })
        }
        const pauseDuration=now.getTime()-round.pauseStartAt.getTime();

        if(round.endTime){
            round.endTime=new Date(round.endTime.getTime()+pauseDuration)
        }
        round.totalPauseDuration += pauseDuration;
        round.isPaused = false;
        round.pauseStartAt = null;

        await round.save();

        return res.status(200).json({
            success: true,
            message: "Round resumed successfully",
            data: round
        });
    }
})


const extendRound = asyncHandler(async (req: Request, res: Response) => {
    const { roundId } = req.params;
    const { extraSeconds } = req.body;

    if (extraSeconds <= 0) {
        return res.status(400).json({
            success: false,
            message: "extraSeconds must be positive"
        });
    }

    const round = await Round.findById(roundId);

    if (!round) {
        return res.status(404).json({ success: false, message: "Round not found" });
    }

    if (round.status !== "LIVE") {
        return res.status(400).json({
            success: false,
            message: "Only LIVE rounds can be extended"
        });
    }

    if (!round.endTime) {
        return res.status(400).json({
            success: false,
            message: "Round has no endTime"
        });
    }

    round.endTime = new Date(
        round.endTime.getTime() + extraSeconds * 1000
    );

    await round.save();

    return res.status(200).json({
        success: true,
        message: "Round extended successfully",
        data: round
    });
});

const deleteRound = asyncHandler(async (req: Request, res: Response) => {
    const { roundId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const round = await Round.findById(roundId).session(session);

        if (!round) {
            throw new Error("Round not found");
        }

        if (round.status === "LIVE") {
            throw new Error("Cannot delete LIVE round");
        }

        await Question.deleteMany({ round: roundId }).session(session);
        await Submission.deleteMany({ round: roundId }).session(session);
        await Penalty.deleteMany({ round: roundId }).session(session);
        await Answer.deleteMany({ round: roundId }).session(session);

        await Round.findByIdAndDelete(roundId).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Round deleted successfully"
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

const endRound = asyncHandler(async (req: Request, res: Response) => {
    const { roundId } = req.params;

    const round = await Round.findById(roundId);

    if (!round) {
        return res.status(404).json({ success: false, message: "Round not found" });
    }

    if (round.status !== "LIVE") {
        return res.status(400).json({
            success: false,
            message: "Only LIVE round can be ended"
        });
    }

    round.status = "ENDED";
    round.endTime = new Date();
    round.submissionLocked = true;

    await round.save();

    // Trigger result calculation

    return res.status(200).json({
        success: true,
        message: "Round ended successfully"
    });
});
const resetRound = asyncHandler(async (req: Request, res: Response) => {
    const { roundId } = req.params;

    const round = await Round.findById(roundId);

    if (!round) {
        return res.status(404).json({ success: false });
    }

    if (round.status === "LIVE") {
        return res.status(400).json({
            success: false,
            message: "Cannot reset LIVE round"
        });
    }

    await Submission.deleteMany({ round: roundId });
    await Penalty.deleteMany({ round: roundId });

    round.status = "DRAFT";
    round.startTime = null;
    round.endTime = null;
    round.isPaused = false;
    round.pauseStartAt = null;

    await round.save();

    return res.status(200).json({
        success: true,
        message: "Round reset successfully"
    });
});

export { 
    createRound, 
    getRounds, 
    getRountById, 
    updateRound, 
    startRound, 
    pauseAndResume, 
    extendRound, 
    deleteRound, 
    endRound, 
    resetRound 
};