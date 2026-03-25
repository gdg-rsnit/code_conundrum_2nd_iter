import mongoose, { Schema } from "mongoose";

interface IWaitingPresence {
  teamId: mongoose.Types.ObjectId;
  teamName: string;
  members: string[];
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const waitingPresenceSchema = new Schema<IWaitingPresence>(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [String],
      default: [],
    },
    lastSeenAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const WaitingPresence = mongoose.model<IWaitingPresence>(
  "WaitingPresence",
  waitingPresenceSchema
);
