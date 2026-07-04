import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  // Request a password reset link for the user's email.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetUrl('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      toast.success('Check your email for reset link');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 mb-4">
              If an account exists, a reset link has been sent. Check your inbox or server console (dev mode).
            </p>
            {resetUrl && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 break-words">
                Use this link to reset your password:
                <br />
                <a href={resetUrl} className="text-primary-600 hover:underline break-words">
                  {resetUrl}
                </a>
              </p>
            )}
            <Link to="/login" className="text-primary-600 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary-600 hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
