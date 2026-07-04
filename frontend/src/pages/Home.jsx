import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGreeting } from '../utils/api';

// Home page that welcomes the user and explains the main app features.
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          {getGreeting(user?.name)}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Welcome to Kriti, your AI interview coach. Pick a role, choose your experience level, and practice with tailored questions and instant feedback.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Informational cards describing the main app features. */}
        {[
          {
            title: 'Role-Based Interviews',
            desc: 'SDE, Data Science, Cyber Security, Cloud, and more.',
            icon: '🎯',
          },
          {
            title: 'Technical & Aptitude',
            desc: 'Switch between coding concepts and logical reasoning.',
            icon: '🧠',
          },
          {
            title: 'AI Feedback & Scoring',
            desc: 'Get rated answers and review ideal responses anytime.',
            icon: '⭐',
          },
        ].map((item) => (
          <div key={item.title} className="card p-6 text-center">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/interview" className="btn-primary text-lg px-8 py-3 inline-block">
          Start Interview
        </Link>
      </div>
    </div>
  );
}
