import mongoose, { Schema, Types } from "mongoose";

export interface IPenalty{
    teamId:Types.ObjectId;
    roundId:Types.ObjectId;
    timeDeducted:number;
    scoreDeducted:number;
    reason:string;
    createdAt:Date;
    updatedAt:Date;
}

const penaltySchema=new Schema<IPenalty>({
    teamId:{
        type:Schema.Types.ObjectId,
        ref:"Team",
        required:true,
        index:true
    },
    roundId:{
        type:Schema.Types.ObjectId,
        ref:"Round",
        required:true,
        index:true
    },
    timeDeducted:{
        type:Number,
        default:0
    },
    scoreDeducted:{
        type:Number,
        default:0
    },
    reason:{
        type:String,
        required:true
    }
},{timestamps:true});

penaltySchema.index({teamId:1,roundId:1});

export const Penalty=mongoose.model<IPenalty>("Penalty",penaltySchema);