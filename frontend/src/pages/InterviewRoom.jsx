import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { formatRole } from '../utils/api';

// InterviewRoom displays the current question, handles answer submission,
// and shows feedback for each question in the interview session.
export default function InterviewRoom() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Current question text and answer input.
  const [question, setQuestion] = useState(location.state?.question || '');
  const [answer, setAnswer] = useState('');
  const [currentQ, setCurrentQ] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState(location.state?.experienceLevel || 'fresher');
  const [totalQ, setTotalQ] = useState(5);
  const [loading, setLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [role, setRole] = useState('');

  // Load interview state from the backend when the page loads.
  useEffect(() => {
    api.get(`/interviews/${id}`).then(({ data }) => {
      const iv = data.interview;
      setRole(iv.role);
      setExperienceLevel(iv.experienceLevel || 'fresher');
      setCurrentQ(iv.currentQuestion);
      setTotalQ(iv.totalQuestions);
      if (iv.currentQuestionText) setQuestion(iv.currentQuestionText);
    });
  }, [id]);

  // Submit the current answer and receive feedback + next question.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, { answer });
      if (data.completed) {
        toast.success('Interview completed!');
        navigate(`/interview/${id}/review`);
        return;
      }
      setLastFeedback(data.lastEvaluation);
      setCurrentQ(data.currentQuestion);
      setQuestion(data.question);
      setAnswer('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQ - 1) / totalQ) * 100;
  const formatExperienceLevel = (level) => {
    switch (level) {
      case 'senior':
        return 'Senior';
      case 'experienced':
        return 'Experienced';
      default:
        return 'Fresher';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interview Session</h1>
          {role && (
            <p className="text-sm text-gray-500">
              {formatRole(role)} • {formatExperienceLevel(experienceLevel)} • Question {currentQ} of {totalQ}
            </p>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-8">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress + 100 / totalQ}%` }}
        />
      </div>

      {lastFeedback && (
        <div className="card p-4 mb-6 border-l-4 border-primary-600">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">Previous answer:</span>
            <span className="text-primary-600 font-bold">{lastFeedback.rating}/10</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{lastFeedback.feedback}</p>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0">
            AI
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Interviewer</p>
            <p className="text-lg">{question || 'Loading question...'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium mb-2">Your Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="input-field min-h-[160px] mb-4 resize-y"
          placeholder="Type your answer here..."
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Evaluating...' : currentQ >= totalQ ? 'Submit Final Answer' : 'Submit & Next Question'}
        </button>
      </form>
    </div>
  );
}
