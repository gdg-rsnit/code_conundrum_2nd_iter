import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ISubmission extends Document {
  teamId: Types.ObjectId;
  roundId: Types.ObjectId;
  questionsSolved: number;
  timeSeconds: number;
  submittedAt: Date;
  accuracy: number;
  createdAt:Date;
  updatedAt:Date;
}

const participantSchema = new Schema<ISubmission>({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    index: true
  },
  roundId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Round",
    index: true,
  },
  questionsSolved: { type: Number, required: true, min: 0 },
  timeSeconds: { type: Number, required: true, min: 0 },
  submittedAt: { type: Date, default: Date.now },
  accuracy: { type: Number, default: 0 }
},{timestamps:true})

export const Submission = mongoose.model<ISubmission>('Participant', participantSchema)

export default Submission