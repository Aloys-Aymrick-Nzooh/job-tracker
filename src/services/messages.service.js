exports.getAnalysisPrompt = (cv, desc) => `
You are a professional career coach.

Analyze this CV against this job description:

CV:
${cv.substring(0, 3000)}

Job Description:
${desc.substring(0, 2000)}

Provide:
1. Match Score (0–100%)
2. Matching Skills (5–7)
3. Missing Requirements (3–5)
4. Improvements (3–5 tips)
`;

exports.getCVPrompt = (cv, desc) => `
Rewrite this CV to match the job requirements.

Guidelines:
- Emphasize relevant skills
- Keep real experience
- ATS friendly
- Professional tone

Original CV:
${cv}

Job description:
${desc}

Return only the optimized CV.
`;

exports.getCoverLetterPrompt = (cv, desc, company, position) => `
Write a professional cover letter (250–300 words).

Role: ${position}
Company: ${company}

Candidate experience:
${cv.substring(0, 2000)}

Job description:
${desc.substring(0, 2000)}

Return only the cover letter text.
`;

exports.getRecruiterMessagesPrompt = (cv, company, position) => `
Create 3 recruiter outreach messages:

1. LinkedIn invite (max 150 chars)
2. LinkedIn DM (max 200 words)
3. Email: subject + body (max 250 words)

Role: ${position}
Company: ${company}

Candidate:
${cv.substring(0, 1500)}
`;

exports.getChatPrompt = (message, context) => `
You are a helpful career advisor.

Context:
${context || "none"}

User message:
${message}

Respond clearly and professionally.
`;
