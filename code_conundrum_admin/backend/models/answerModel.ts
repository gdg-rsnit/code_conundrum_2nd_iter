import mongoose, { Schema, Types } from "mongoose";

export interface IAnswer{
    roundId:Types.ObjectId;
    code:string;
    isDecoy:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const answerSchema=new Schema<IAnswer>({
    roundId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Round",
        required:true,
        index:true
    },
    code:{
        type:String,
        required:true
    },
    isDecoy:{
        type:Boolean,
        default:false
    },
},{timestamps:true});

export const Answer=mongoose.model<IAnswer>("Answer",answerSchema);