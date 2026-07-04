import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While auth state is loading, show a spinner instead of the protected page.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // If the user is not logged in, redirect to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
