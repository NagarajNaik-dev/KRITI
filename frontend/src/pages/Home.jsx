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
      // slight per-card rotation so the row doesn't read as a rigid grid
      // (full class kept literal — Tailwind's scanner can't see runtime string concatenation)
      tilt: 'hover:-rotate-[0.4deg]',
    },
    {
      num: '02',
      title: 'Technical & Aptitude',
      desc: 'Switch between coding concepts and logical reasoning.',
      icon: Brain,
      tilt: 'hover:rotate-[0.2deg]',
    },
    {
      num: '03',
      title: 'AI Feedback & Scoring',
      desc: 'Get rated answers and review ideal responses anytime.',
      icon: Sparkles,
      tilt: 'hover:-rotate-[0.15deg]',
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
          <p className="text-lg font-normal text-gray-600 dark:text-gray-400 max-w-lg mb-8">
            No more guessing how you did. Pick a role, answer like it's real, and see exactly where you lost points - before the actual interview does.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/interview"
              className="group btn-primary text-base px-7 py-3 inline-flex items-center gap-2
                shadow-[0_1px_2px_rgba(0,0,0,0.5),0_10px_20px_-8px_rgba(79,70,229,0.55)]
                transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_16px_28px_-8px_rgba(79,70,229,0.65)]
                hover:-translate-y-[1px] active:translate-y-0 active:duration-100"
            >
              Start Interview
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-primary-600" />
              No setup &mdash; pick a role and go
            </div>
          </div>
        </div>

        {/* Mock interview preview card — a concrete visual instead of a generic hero graphic */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 -rotate-2" />
          <div
            className="relative card p-5 rotate-1
              shadow-[0_1px_1px_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.25),0_18px_40px_-16px_rgba(0,0,0,0.5)]
              transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              hover:rotate-0 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <img
                src="/kriti.jpeg"
                alt="Kriti"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-primary-500/40"
              />
              <span className="text-sm font-semibold">Kriti Interviewer</span>
              <span className="ml-auto text-xs font-mono text-gray-400">Q2 / 5</span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              &ldquo;How would you design a rate limiter for a public API?&rdquo;
            </p>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 text-sm font-normal text-gray-500 dark:text-gray-400 mb-4">
              I&apos;d use a token bucket algorithm per client key
              <span className="inline-block w-[2px] h-3.5 bg-gray-400 ml-0.5 align-middle animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 tracking-tight">evaluating&hellip;</span>
              <span className="text-sm font-bold text-primary-600 tabular-nums">8.5/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature list — numbered rows instead of three identical cards */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800">
        {features.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`group pt-6 sm:px-6 first:sm:pl-0 pb-6 sm:pb-0
                transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${item.tilt} hover:-translate-y-0.5`}
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-gray-400 group-hover:text-primary-500 transition-colors duration-300">
                  {item.num}
                </span>
                <Icon
                  className="w-4 h-4 text-primary-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-6"
                  strokeWidth={2.25}
                />
              </div>
              <h3 className="font-semibold mb-1.5">{item.title}</h3>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}