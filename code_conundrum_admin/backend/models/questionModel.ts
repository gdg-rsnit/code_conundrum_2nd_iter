import mongoose, { Schema, Types } from "mongoose";

export interface IQuestion{
    roundId:Types.ObjectId;
    question:string;
    correctAnswerId:Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
}

const questionSchema=new Schema<IQuestion>({
    roundId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Round",
        required:true,
        index:true
    },
    question:{
        type:String,
        required:true
    },
    correctAnswerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Answer",
        required:true
    }
},{timestamps:true});

export const Question=mongoose.model<IQuestion>("Question",questionSchema);