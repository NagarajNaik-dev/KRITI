const Interview = require('../models/Interview');
const {
  ROLES,
  generateQuestion,
  evaluateAnswer,
  generateOverallFeedback,
  getIdealAnswer,
} = require('../services/aiService');

// Return the list of available interview roles to the frontend.
exports.getRoles = (req, res) => {
  const roles = Object.entries(ROLES).map(([id, label]) => ({ id, label }));
  res.json({ roles });
};

// Start a new interview session and generate the first AI question.
exports.startInterview = async (req, res) => {
  try {
    const { role, type, totalQuestions = 5, experienceLevel = 'fresher' } = req.body;

    if (!role || !type) {
      return res.status(400).json({ message: 'Role and type are required' });
    }

    if (!['technical', 'aptitude'].includes(type)) {
      return res.status(400).json({ message: 'Type must be technical or aptitude' });
    }

    if (!['fresher', 'senior', 'experienced'].includes(experienceLevel)) {
      return res.status(400).json({ message: 'Experience level must be fresher, senior, or experienced' });
    }

    const count = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 3), 10);

    const { question } = await generateQuestion(role, type, 1, count, [], experienceLevel);

    const interview = await Interview.create({
      user: req.user._id,
      role,
      type,
      experienceLevel,
      totalQuestions: count,
      currentQuestion: 1,
      questions: [{ question, userAnswer: '', rating: 0, feedback: '', idealAnswer: '' }],
    });

    res.status(201).json({
      interview: {
        id: interview._id,
        role: interview.role,
        type: interview.type,
        experienceLevel: interview.experienceLevel,
        totalQuestions: interview.totalQuestions,
        currentQuestion: interview.currentQuestion,
        question,
        status: interview.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to start interview' });
  }
};

// Save the user's answer, evaluate it, and generate the next question.
exports.submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'in_progress',
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const currentIndex = interview.currentQuestion - 1;
    const currentQ = interview.questions[currentIndex];

    if (!currentQ) {
      return res.status(400).json({ message: 'No active question' });
    }

    const evaluation = await evaluateAnswer(
      interview.role,
      interview.type,
      currentQ.question,
      answer,
      interview.experienceLevel
    );

    interview.questions[currentIndex].userAnswer = answer || '';
    interview.questions[currentIndex].rating = evaluation.rating;
    interview.questions[currentIndex].feedback = evaluation.feedback;
    interview.questions[currentIndex].idealAnswer = evaluation.idealAnswer;

    if (interview.currentQuestion >= interview.totalQuestions) {
      const overall = await generateOverallFeedback(
        interview.role,
        interview.type,
        interview.questions,
        interview.experienceLevel
      );
      interview.status = 'completed';
      interview.overallScore = overall.overallScore;
      interview.overallFeedback = overall.overallFeedback;
      await interview.save();

      return res.json({
        completed: true,
        interview: formatInterview(interview),
      });
    }

    const previousQuestions = interview.questions.map((q) => q.question);
    const nextNum = interview.currentQuestion + 1;
    const { question } = await generateQuestion(
      interview.role,
      interview.type,
      nextNum,
      interview.totalQuestions,
      previousQuestions,
      interview.experienceLevel
    );

    interview.questions.push({
      question,
      userAnswer: '',
      rating: 0,
      feedback: '',
      idealAnswer: '',
    });
    interview.currentQuestion = nextNum;
    await interview.save();

    res.json({
      completed: false,
      currentQuestion: interview.currentQuestion,
      totalQuestions: interview.totalQuestions,
      question,
      lastEvaluation: {
        rating: evaluation.rating,
        feedback: evaluation.feedback,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit answer' });
  }
};

// Fetch the current interview session state.
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ interview: formatInterview(interview) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return the ideal answer for a saved question, generating it if needed.
exports.getIdealAnswerForQuestion = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const index = parseInt(req.params.questionIndex, 10);
    const qa = interview.questions[index];

    if (!qa) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (qa.idealAnswer) {
      return res.json({ idealAnswer: qa.idealAnswer });
    }

    const result = await getIdealAnswer(interview.role, interview.type, qa.question);
    interview.questions[index].idealAnswer = result.idealAnswer;
    await interview.save();

    res.json({ idealAnswer: result.idealAnswer });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get ideal answer' });
  }
};

// Return the logged-in user's interview history.
exports.getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions.idealAnswer');

    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Compute aggregated statistics for the user's completed interviews.
exports.getUserStats = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
      status: 'completed',
    });

    const totalInterviews = interviews.length;
    const avgScore =
      totalInterviews > 0
        ? interviews.reduce((sum, i) => sum + i.overallScore, 0) / totalInterviews
        : 0;

    const byRole = {};
    interviews.forEach((i) => {
      if (!byRole[i.role]) byRole[i.role] = { count: 0, totalScore: 0 };
      byRole[i.role].count += 1;
      byRole[i.role].totalScore += i.overallScore;
    });

    const roleStats = Object.entries(byRole).map(([role, data]) => ({
      role,
      count: data.count,
      avgScore: (data.totalScore / data.count).toFixed(1),
    }));

    res.json({
      stats: {
        totalInterviews,
        avgScore: avgScore.toFixed(1),
        roleStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function formatInterview(interview) {
  const currentIndex = interview.status === 'in_progress' ? interview.currentQuestion - 1 : -1;
  const currentQ =
    currentIndex >= 0 ? interview.questions[currentIndex]?.question : null;

  return {
    id: interview._id,
    role: interview.role,
    type: interview.type,
    experienceLevel: interview.experienceLevel,
    status: interview.status,
    totalQuestions: interview.totalQuestions,
    currentQuestion: interview.currentQuestion,
    currentQuestionText: currentQ,
    questions: interview.questions,
    overallScore: interview.overallScore,
    overallFeedback: interview.overallFeedback,
    createdAt: interview.createdAt,
  };
}
