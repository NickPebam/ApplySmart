import crypto from 'crypto';
import path from 'path';

// Generate unique filename
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;
};

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate follow-up date (5 days from application)
export const calculateFollowUpDate = (applicationDate = new Date()) => {
  const followUpDate = new Date(applicationDate);
  followUpDate.setDate(followUpDate.getDate() + 5);
  return followUpDate;
};

// Extract email from text (simple regex)
export const extractEmail = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : null;
};

// Extract phone number from text
export const extractPhone = (text) => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : null;
};

// Validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Calculate match score between two arrays of skills
export const calculateSkillMatch = (resumeSkills, requiredSkills) => {
  if (!resumeSkills || !requiredSkills || requiredSkills.length === 0) {
    return 0;
  }

  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map((s) => s.toLowerCase());

  const matchingSkills = requiredSkillsLower.filter((skill) =>
    resumeSkillsLower.some((rs) => rs.includes(skill) || skill.includes(rs))
  );

  return Math.round((matchingSkills.length / requiredSkillsLower.length) * 100);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Parse AI response (handle JSON or plain text)
export const parseAIResponse = (response) => {
  try {
    return JSON.parse(response);
  } catch (error) {
    return { text: response };
  }
};

// Generate follow-up schedule
export const generateFollowUpSchedule = (applicationDate) => {
  const date = new Date(applicationDate);
  return {
    day3: new Date(date.setDate(date.getDate() + 3)),
    day5: new Date(date.setDate(date.getDate() + 2)),
    day7: new Date(date.setDate(date.getDate() + 2)),
  };
};

// Error response formatter
export const errorResponse = (message, details = null) => {
  return {
    error: true,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

// Success response formatter
export const successResponse = (message, data = null) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};