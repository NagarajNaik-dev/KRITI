const mongoose = require('mongoose');

// Schema for a single interview question and the user's answer.
const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  feedback: { type: String, default: '' },
  idealAnswer: { type: String, default: '' },
});

// Interview schema stores the full session state for one user interview.
const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['technical', 'aptitude'], required: true },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'senior', 'experienced'],
      default: 'fresher',
    },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    totalQuestions: { type: Number, default: 5 },
    currentQuestion: { type: Number, default: 0 },
    questions: [qaSchema],
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    overallFeedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
