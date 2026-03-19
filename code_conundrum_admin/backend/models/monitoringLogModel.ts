import mongoose, { Schema, Types } from "mongoose";

export type MonitoringEventType = "fullscreen_exit" | "tab_switch";

export interface IMonitoringLog {
  teamId: Types.ObjectId;
  contestId: string;
  eventType: MonitoringEventType;
  timestamp: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const monitoringLogSchema = new Schema<IMonitoringLog>(
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
    eventType: {
      type: String,
      enum: ["fullscreen_exit", "tab_switch"],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
    userAgent: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

monitoringLogSchema.index({ teamId: 1, contestId: 1, timestamp: -1 });

export const MonitoringLog = mongoose.model<IMonitoringLog>("MonitoringLog", monitoringLogSchema);
