import mongoose, { Schema, Types } from "mongoose";

export interface IMonitoringSummary {
  teamId: Types.ObjectId;
  contestId: string;
  fullscreenExitCount: number;
  tabSwitchCount: number;
  flagged: boolean;
  autoBanned: boolean;
  autoBannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const monitoringSummarySchema = new Schema<IMonitoringSummary>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    contestId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    fullscreenExitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tabSwitchCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    autoBanned: {
      type: Boolean,
      default: false,
    },
    autoBannedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

monitoringSummarySchema.index({ teamId: 1, contestId: 1 }, { unique: true });

export const MonitoringSummary = mongoose.model<IMonitoringSummary>("MonitoringSummary", monitoringSummarySchema);
