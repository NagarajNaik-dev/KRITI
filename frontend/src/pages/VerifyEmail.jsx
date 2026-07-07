import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    api
      .get(`/auth/verify-email/${token}`)
      .then(({ data }) => loginWithToken(data.token))
      .then(() => {
        setStatus('success');
        toast.success('Email verified!');
        navigate('/');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token, loginWithToken, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Verifying your email...</p>
          </>
        )}

        {status === 'success' && <p className="text-green-600 dark:text-green-400">Redirecting...</p>}

        {status === 'error' && (
          <>
            <p className="text-red-600 dark:text-red-400 mb-4">{message}</p>
            <Link to="/login" className="text-primary-600 hover:underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
