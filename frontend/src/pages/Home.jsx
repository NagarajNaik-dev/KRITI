import { Link } from 'react-router-dom';
import { Target, Brain, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getGreeting } from '../utils/api';

// Home page that welcomes the user and explains the main app features.
export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      num: '01',
      title: 'Role-Based Interviews',
      desc: 'SDE, Data Science, Cyber Security, Cloud, and more.',
      icon: Target,
    },
    {
      num: '02',
      title: 'Technical & Aptitude',
      desc: 'Switch between coding concepts and logical reasoning.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'AI Feedback & Scoring',
      desc: 'Get rated answers and review ideal responses anytime.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
      {/* Hero: text on the left, a mock interview preview on the right instead of empty space */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center mb-24">
        <div>
          <h1 className="text-4xl md:text-[3.25rem] leading-[1.08] font-bold tracking-tight mb-5">
            {getGreeting(user?.name)}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-8">
            Kriti is your AI interview coach. Pick a role, choose your experience
            level, and practice with questions tailored to you &mdash; with
            feedback the moment you answer.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/interview"
              className="btn-primary text-base px-7 py-3 inline-flex items-center gap-2"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              No setup &mdash; pick a role and go
            </div>
          </div>
        </div>

        {/* Mock interview preview card — a concrete visual instead of a generic hero graphic */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 -rotate-2" />
          <div className="relative card p-5 rotate-1">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="text-sm font-medium">Kriti Interviewer</span>
              <span className="ml-auto text-xs text-gray-400">Question 2 of 5</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              &ldquo;How would you design a rate limiter for a public API?&rdquo;
            </p>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
              I&apos;d use a token bucket algorithm per client key...
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Evaluating answer</span>
              <span className="text-sm font-bold text-primary-600">8.5/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature list — numbered rows instead of three identical cards */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="pt-6 sm:px-6 first:sm:pl-0 pb-6 sm:pb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-gray-400">{item.num}</span>
                <Icon className="w-4 h-4 text-primary-600" strokeWidth={2.25} />
              </div>
              <h3 className="font-semibold mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}