import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { analyzeResumeVsJD, generateCoverLetter, generateFollowUpEmail } from '../services/aiService.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';

const router = express.Router();

// Analyze resume vs JD
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { resumeId, jdId } = req.body;

    const resume = await Resume.findById(resumeId);
    const jd = await JobDescription.findById(jdId);

    if (!resume || !jd) {
      return res.status(404).json({ error: 'Resume or JD not found' });
    }

    const analysis = await analyzeResumeVsJD(resume.extractedText, jd.description);

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate cover letter
router.post('/cover-letter', authenticate, async (req, res) => {
  try {
    const { resumeId, jdId, userName } = req.body;

    const resume = await Resume.findById(resumeId);
    const jd = await JobDescription.findById(jdId);

    const coverLetter = await generateCoverLetter(resume.extractedText, jd.description, userName);

    res.json({ coverLetter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate follow-up email
router.post('/follow-up', authenticate, async (req, res) => {
  try {
    const { jobTitle, companyName, userName } = req.body;

    const followUpEmail = await generateFollowUpEmail(jobTitle, companyName, userName);

    res.json({ followUpEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;