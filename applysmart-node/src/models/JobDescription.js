import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    title: String,
    company: String,
    description: String,
    requirements: [String],
    skills: [String],
    recruiterEmail: String,
    matchScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model('JobDescription', jobDescriptionSchema);