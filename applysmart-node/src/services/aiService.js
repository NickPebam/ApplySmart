import { getGemini } from '../config/gemini.js';


//   Analyze Resume vs JD

export const analyzeResumeVsJD = async (resumeText, jdText) => {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are an expert recruiter. Analyze the match between this resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Provide:
1. Match score (0-100)
2. Matching skills
3. Missing skills
4. Recommendations

Format as JSON.
`;

  const result = await model.generateContent(prompt);
  return result.response.text(); // SAME as OpenAI before
};

//   Generate Cover Letter

export const generateCoverLetter = async (resumeText, jdText, userName) => {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Write a professional cover letter for ${userName} applying to this job.

RESUME SUMMARY:
${resumeText.substring(0, 1000)}

JOB DESCRIPTION:
${jdText}

Requirements:
- Professional tone
- Highlight relevant skills
- 250-300 words
- No placeholder text
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};


//  Generate Follow-up Email

export const generateFollowUpEmail = async (jobTitle, companyName, userName) => {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Write a professional follow-up email for ${userName} who applied to ${jobTitle} at ${companyName} 5 days ago.

Requirements:
- Polite and professional
- Express continued interest
- Ask for update
- 100-150 words
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};