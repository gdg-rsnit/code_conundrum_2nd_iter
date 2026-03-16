import mongoose, { Document, Schema } from 'mongoose'

export interface IParticipant extends Document {
  username: string
  score: number
  timeSeconds: number
  round: number
  submittedAt: Date
  accuracy: number
}

const participantSchema = new Schema<IParticipant>({
  username:    { type: String, required: true },
  score:       { type: Number, required: true, min: 0 },
  timeSeconds: { type: Number, required: true, min: 0 },
  round:       { type: Number, required: true, min: 1, max: 3 },
  submittedAt: { type: Date, default: Date.now },
  accuracy:    { type: Number, default: 0 }
})

export default mongoose.model<IParticipant>('Participant', participantSchema)