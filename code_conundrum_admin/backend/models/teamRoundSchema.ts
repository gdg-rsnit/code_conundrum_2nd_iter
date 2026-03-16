import mongoose, { Schema } from "mongoose";

export interface ITeamRound {
    teamId: mongoose.Types.ObjectId;
    roundId: mongoose.Types.ObjectId;
    score: number;
    time: number;
    createdAt: Date;
    updatedAt: Date;
}

const teamRoundSchema = new Schema<ITeamRound>({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true,
    },
    roundId: {
        type: Schema.Types.ObjectId,
        ref: "Round",
        required: true,
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
    },
    time: {
        type: Number,
        default: 0,
        min: 0,
    }
}, { timestamps: true });

export const TeamRound = mongoose.model<ITeamRound>("TeamRound", teamRoundSchema);