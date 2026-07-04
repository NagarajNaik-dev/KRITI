import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  // Handle the redirect back from Google OAuth and exchange the token to sign in.
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token)
        .then(() => {
          toast.success('Signed in with Google!');
          navigate('/');
        })
        .catch(() => {
          toast.error('Google sign-in failed');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );
}
