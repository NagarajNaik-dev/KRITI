import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { formatRole } from '../utils/api';

// Review page shown after the interview completes. This page displays
// overall scores, per-question feedback, and ideal answers on demand.
export default function InterviewReview() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loadingIdeal, setLoadingIdeal] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Load the completed interview from the backend.
  useEffect(() => {
    api.get(`/interviews/${id}`).then(({ data }) => setInterview(data.interview));
  }, [id]);

  // Fetch the AI-generated ideal answer for a specific question.
  const showIdealAnswer = async (index) => {
    if (revealedAnswers[index]) return;
    setLoadingIdeal((prev) => ({ ...prev, [index]: true }));
    try {
      const { data } = await api.get(`/interviews/${id}/question/${index}/ideal-answer`);
      setRevealedAnswers((prev) => ({ ...prev, [index]: data.idealAnswer }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load answer');
    } finally {
      setLoadingIdeal((prev) => ({ ...prev, [index]: false }));
    }
  };

  if (!interview) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Interview Complete</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {formatRole(interview.role)} • {interview.type}
        </p>
        <div className="text-5xl font-bold text-primary-600 mb-2">
          {interview.overallScore?.toFixed?.(1) ?? interview.overallScore}/10
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          {interview.overallFeedback}
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Question Review</h2>
      <div className="space-y-6">
        {interview.questions.map((q, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-600">Q{i + 1}</span>
              <span className="text-sm font-bold">{q.rating}/10</span>
            </div>
            <p className="font-medium mb-3">{q.question}</p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-500 mb-1">Your answer</p>
              <p className="text-sm">{q.userAnswer || '(no answer)'}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{q.feedback}</p>
            {revealedAnswers[i] ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">Ideal Answer</p>
                <p className="text-sm">{revealedAnswers[i]}</p>
              </div>
            ) : (
              <button
                onClick={() => showIdealAnswer(i)}
                disabled={loadingIdeal[i]}
                className="text-sm text-primary-600 hover:underline"
              >
                {loadingIdeal[i] ? 'Loading...' : 'Show correct answer'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Link to="/interview" className="btn-primary">
          New Interview
        </Link>
        <Link to="/profile" className="btn-secondary">
          View Profile
        </Link>
      </div>
    </div>
  );
}
