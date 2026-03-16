import mongoose, { Schema } from "mongoose";

export interface IRound{
    roundNumber:number;
    duration:number;
    status:"DRAFT"|"LIVE"|"ENDED";
    startTime:Date|null;
    endTime:Date|null;
    isPaused:boolean;
    pauseStartAt:Date|null;
    totalPauseDuration:number;
    submissionLocked:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const roundSchema=new Schema<IRound>({
    roundNumber:{
        type:Number,
        required:true,
        unique:true
    },
    duration:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["DRAFT","LIVE","ENDED"],
        required:true,
        default:"DRAFT"
    },
    startTime:{
        type:Date,
        default:null
    },
    endTime:{
        type:Date,
        default:null
    },
    isPaused:{
        type:Boolean,
        default:false
    },
    pauseStartAt:{
        type:Date,
        default:null
    },
    totalPauseDuration:{
        type:Number,
        default:0
    },
    submissionLocked:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

export const Round=mongoose.model<IRound>("Round",roundSchema);
