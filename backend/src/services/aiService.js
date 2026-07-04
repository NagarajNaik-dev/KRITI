const Groq = require('groq-sdk');

// Mapping of internal role IDs to display labels used by the AI prompts.
const ROLES = {
  software_developer: 'Software Developer (SDE)',
  data_scientist: 'Data Scientist',
  cyber_security: 'Cyber Security Analyst',
  cloud_engineer: 'Cloud Engineer',
  devops_engineer: 'DevOps Engineer',
  ml_engineer: 'Machine Learning Engineer',
  product_manager: 'Product Manager',
};

// Create a Groq client using the configured API key.
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Extract the first JSON object from the AI response and parse it safely.
const parseJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response');

  const rawJson = match[0];
  try {
    return JSON.parse(rawJson);
  } catch (parseError) {
    const normalizedJson = rawJson
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');

    try {
      return JSON.parse(normalizedJson);
    } catch (normalizedError) {
      const error = new Error(`Invalid AI response JSON: ${normalizedError.message}`);
      error.originalText = text;
      throw error;
    }
  }
};

// Send a chat prompt to the Groq AI model and return the raw response text.
const chat = async (systemPrompt, userPrompt) => {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || '';
};

// Return a level-specific instruction for the AI depending on candidate experience.
const getLevelInstruction = (experienceLevel = 'fresher') => {
  switch (experienceLevel) {
    case 'senior':
      return 'Ask moderately advanced questions suitable for a senior candidate, focusing on ownership, architecture decisions, mentoring, and tradeoffs.';
    case 'experienced':
      return 'Ask advanced, leadership-oriented questions suitable for an experienced candidate, focusing on system design, scaling, strategy, and team impact.';
    default:
      return 'Ask beginner-friendly questions suitable for a fresher candidate, focusing on fundamentals, clarity, and core concepts.';
  }
};

// Generate a new interview question based on role, type, and experience level.
const generateQuestion = async (role, type, questionNumber, totalQuestions, previousQuestions = [], experienceLevel = 'fresher') => {
  const roleLabel = ROLES[role] || role;
  const typeLabel = type === 'technical' ? 'technical' : 'aptitude/logical reasoning';
  const levelInstruction = getLevelInstruction(experienceLevel);

  const previous = previousQuestions.length
    ? `\nAvoid repeating these topics:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const systemPrompt = `You are a professional interviewer conducting a ${typeLabel} interview for a ${roleLabel} position.
${levelInstruction}
Ask realistic, industry-relevant questions that companies actually use.
Return ONLY valid JSON with this shape: {"question": "your question here"}. Do not surround the response with markdown or extra text.`;

  const userPrompt = `Generate question ${questionNumber} of ${totalQuestions} for a ${roleLabel} ${typeLabel} interview at the ${experienceLevel} level.${previous}`;

  const response = await chat(systemPrompt, userPrompt);
  return parseJSON(response);
};

// Evaluate a candidate answer and return score, feedback, and ideal answer.
const evaluateAnswer = async (role, type, question, userAnswer, experienceLevel = 'fresher') => {
  const roleLabel = ROLES[role] || role;
  const levelInstruction = getLevelInstruction(experienceLevel);

  const systemPrompt = `You are an expert interviewer evaluating a candidate's answer for a ${roleLabel} position.
${levelInstruction}
Be fair, constructive, and professional. Rate from 0-10.
Return ONLY valid JSON with this shape: {"rating": number, "feedback": "brief constructive feedback", "idealAnswer": "comprehensive ideal answer"}. Do not include markdown, explanations, or extra text.`;

  const userPrompt = `Interview type: ${type}\nExperience level: ${experienceLevel}\nQuestion: ${question}\nCandidate's answer: ${userAnswer || '(no answer provided)'}`;

  const response = await chat(systemPrompt, userPrompt);
  return parseJSON(response);
};

// Summarize the full interview and produce an overall score and feedback.
const generateOverallFeedback = async (role, type, questions, experienceLevel = 'fresher') => {
  const roleLabel = ROLES[role] || role;
  const levelInstruction = getLevelInstruction(experienceLevel);
  const summary = questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nRating: ${q.rating}/10\nAnswer: ${q.userAnswer}`)
    .join('\n\n');

  const avgRating =
    questions.reduce((sum, q) => sum + (q.rating || 0), 0) / (questions.length || 1);

  const systemPrompt = `You are a senior hiring manager summarizing a ${type} interview for ${roleLabel}.
${levelInstruction}
Return ONLY valid JSON with this shape: {"overallScore": number (0-10, can use decimals), "overallFeedback": "2-3 paragraph summary with strengths, weaknesses, and tips"}. Do not include commentary or markdown.`;

  const userPrompt = `Average rating so far: ${avgRating.toFixed(1)}/10\n\nInterview details:\n${summary}`;

  const response = await chat(systemPrompt, userPrompt);
  return parseJSON(response);
};

// Fetch or generate the ideal answer for a given question.
const getIdealAnswer = async (role, type, question, experienceLevel = 'fresher') => {
  const roleLabel = ROLES[role] || role;
  const levelInstruction = getLevelInstruction(experienceLevel);

  const systemPrompt = `You are an expert interviewer. Provide a detailed, correct answer for interview preparation.
${levelInstruction}
Return ONLY valid JSON with this shape: {"idealAnswer": "comprehensive answer with key points"}. Do not include commentary or markdown.`;

  const userPrompt = `Role: ${roleLabel}\nType: ${type}\nExperience level: ${experienceLevel}\nQuestion: ${question}`;

  const response = await chat(systemPrompt, userPrompt);
  return parseJSON(response);
};

module.exports = {
  ROLES,
  generateQuestion,
  evaluateAnswer,
  generateOverallFeedback,
  getIdealAnswer,
};
