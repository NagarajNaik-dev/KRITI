import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatRole } from '../utils/api';

// Profile page shows the logged-in user's details, interview statistics,
// and history of past interview sessions.
export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);

  // Load profile stats and history when the page mounts.
  useEffect(() => {
    api.get('/interviews/stats').then(({ data }) => setStats(data.stats));
    api.get('/interviews/history').then(({ data }) => setInterviews(data.interviews));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card p-6 mb-8 flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      {stats && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Summary stats cards for completed interviews and average score. */}
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalInterviews}</div>
            <div className="text-sm text-gray-500">Interviews Completed</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.avgScore}</div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.roleStats?.length || 0}</div>
            <div className="text-sm text-gray-500">Roles Practiced</div>
          </div>
        </div>
      )}

      {stats?.roleStats?.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold mb-4">Progress by Role</h2>
          <div className="space-y-3">
            {stats.roleStats.map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <span>{formatRole(r.role)}</span>
                <span className="text-sm text-gray-500">
                  {r.count} interviews • avg {r.avgScore}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Interview History</h2>
          <Link to="/interview" className="text-sm text-primary-600 hover:underline">
            Start new
          </Link>
        </div>

        {interviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No interviews yet. Start your first one!</p>
        ) : (
          <div className="space-y-3">
            {interviews.map((iv) => (
              <Link
                key={iv._id}
                to={iv.status === 'completed' ? `/interview/${iv._id}/review` : `/interview/${iv._id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatRole(iv.role)}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {iv.type} • {new Date(iv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {iv.status === 'completed' ? (
                      <span className="font-bold text-primary-600">
                        {iv.overallScore?.toFixed?.(1) ?? iv.overallScore}/10
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-600">In Progress</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
