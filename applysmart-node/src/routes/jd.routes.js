import express from 'express';
import { authenticate } from '../middleware/auth.js';
import JobDescription from '../models/JobDescription.js';

const router = express.Router();

// Create job description
router.post('/', authenticate, async (req, res) => {
  try {
    const jd = new JobDescription({
      userId: req.user.userId,
      ...req.body,
    });

    await jd.save();

    res.json({
      message: 'Job description saved',
      jdId: jd._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all JDs for user
router.get('/', authenticate, async (req, res) => {
  try {
    const jds = await JobDescription.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(jds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;