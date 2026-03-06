import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';

const router = express.Router();

// ── Create application ────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      resumeId,
      jdId,
      coverLetter,
      followUpEmail,
      followUpDate,
      atsScore,         // ✅ now saved
      analysisResult,   // ✅ full JSON string from Gemini — for viewing later
    } = req.body;

    const application = new Application({
      userId: req.user.userId,
      resumeId,
      jdId,
      coverLetter,
      followUpEmail,
      followUpDate,
      status: 'Applied',
      atsScore,
      analysisResult,
    });

    await application.save();

    const io = req.app.get('io');
    io.emit(`notification-${req.user.userId}`, {
      type: 'application_created',
      message: 'Application saved successfully',
      applicationId: application._id,
    });

    res.json({
      message: 'Application created successfully',
      applicationId: application._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get all applications for user ─────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.userId })
      .populate('resumeId', 'fileName')
      .populate('jdId', 'title company')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get single application ────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })
      .populate('resumeId')
      .populate('jdId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Update application status ─────────────────────────────────────────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Applied', 'Interview', 'Rejected', 'Accepted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const io = req.app.get('io');
    io.emit(`notification-${req.user.userId}`, {
      type: 'status_updated',
      message: `Application status updated to ${status}`,
      applicationId: application._id,
      status,
    });

    res.json({ message: 'Status updated successfully', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Delete application ────────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get application statistics ────────────────────────────────────────────────
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const total = await Application.countDocuments({ userId: req.user.userId });

    const summary = { total, Applied: 0, Interview: 0, Rejected: 0, Accepted: 0 };
    stats.forEach((stat) => { summary[stat._id] = stat.count; });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;