import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { parseResume } from '../services/resumeParser.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// Upload and parse resume
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    const extractedText = await parseResume(req.file.path);

    const resume = new Resume({
      userId: req.user.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
    });

    await resume.save();

    res.json({
      message: 'Resume uploaded successfully',
      resumeId: resume._id,
      extractedText,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all resumes for user
router.get('/', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;