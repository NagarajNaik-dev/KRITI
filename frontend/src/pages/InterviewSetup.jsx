import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Page for selecting the interview role, experience level, question type, and length.
export default function InterviewSetup() {
  // Role options loaded from the backend.
  const [roles, setRoles] = useState([]);
  // Selected role ID.
  const [role, setRole] = useState('');
  // Technical or aptitude question type.
  const [type, setType] = useState('technical');
  // Interview difficulty level for AI question generation.
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  // Number of questions in the interview.
  const [totalQuestions, setTotalQuestions] = useState(5);
  // Loading state for the start button.
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load available roles when the setup page first mounts.
  useEffect(() => {
    api.get('/interviews/roles').then(({ data }) => {
      setRoles(data.roles);
      if (data.roles.length) setRole(data.roles[0].id);
    });
  }, []);

  // Begin a new interview session using the selected settings.
  const handleStart = async () => {
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/start', {
        role,
        type,
        experienceLevel,
        totalQuestions,
      });
      navigate(`/interview/${data.interview.id}`, {
        state: { question: data.interview.question, experienceLevel: data.interview.experienceLevel },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Start Interview</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure your session and Kritiwill adapt questions to your role and experience level.
      </p>

      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Target Role</label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-lg border text-left text-sm transition ${
                  role === r.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience Level</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'fresher', label: 'Fresher' },
              { id: 'senior', label: 'Senior' },
              { id: 'experienced', label: 'Experienced' },
            ].map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setExperienceLevel(level.id)}
                className={`p-3 rounded-lg border text-sm transition ${
                  experienceLevel === level.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Interview Type</label>
          <div className="flex gap-4">
            {[
              { id: 'technical', label: 'Technical', desc: 'Role-specific concepts & problem solving' },
              { id: 'aptitude', label: 'Aptitude', desc: 'Logic, reasoning & analytical skills' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 p-4 rounded-lg border text-left transition ${
                  type === t.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Number of Questions</label>
          <select
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="input-field"
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleStart} disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Starting...' : 'Begin Interview'}
        </button>
      </div>
    </div>
  );
}
