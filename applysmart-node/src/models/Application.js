import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
    },
    coverLetter: String,
    followUpEmail: String,
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Rejected', 'Accepted'],
      default: 'Applied',
    },
    followUpDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);