import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import InterviewReview from './pages/InterviewReview';
import Profile from './pages/Profile';

// Main application shell. This component defines the top-level layout,
// attaches the navigation bar, and sets up all application routes.
export default function App() {
  return (
    <>
      {/* Toast notifications for success / error messages */}
      <Toaster position="top-right" />
      {/* Persistent top navigation on every page */}
      <Navbar />
      {/* Keep footer at the bottom by giving the main route section enough height */}
      <div className="min-h-[calc(100vh-4rem)]">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password/:token" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email/:token" element={<Navigate to="/login" replace />} />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:id/review"
          element={
            <ProtectedRoute>
              <InterviewReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      {/* Footer credit shown on every page */}
      <footer className="border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-600 py-4 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
        Developed by Nagaraj Lakshman Naik
      </footer>
    </>
  );
}
