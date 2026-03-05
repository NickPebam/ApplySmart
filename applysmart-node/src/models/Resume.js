import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    fileName: String,
    filePath: String,
    extractedText: String,
    parsedData: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          year: String,
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);