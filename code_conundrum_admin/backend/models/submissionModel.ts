import mongoose, { Schema, Types } from "mongoose";

export interface IAnswerSubmission{
    questionId:Types.ObjectId;
    selectedAnswer:Types.ObjectId;
}
export interface ISubmission{
    teamId:Types.ObjectId;
    roundId:Types.ObjectId;
    answers:IAnswerSubmission[];
    score:number;
    timeTaken:number;
    submittedAt:Date;
    isInvalidated:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const answerSubSchema=new Schema<IAnswerSubmission>({
    questionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Question",
        required:true
    },
    selectedAnswer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Answer",
        required:true
    },
},
{_id:false}
);

const submissionSchema=new Schema<ISubmission>({
    teamId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        required:true,
        index:true
    },
    roundId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Round",
      index: true,
    },
    answers: {
      type: [answerSubSchema],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isInvalidated: {
      type: Boolean,
      default: false,
    },
},{timestamps:true});

submissionSchema.index({teamId:1,roundId:1},{unique:true});

export const Submission=mongoose.model<ISubmission>("Submission",submissionSchema);