import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Context for auth state: current user and helper methods.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app loads, try to restore the authenticated user from local storage.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Log in with email and password, store token locally, and keep user info in state.
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  // Register a new user, receive an auth token, and set the user state.
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  // Use an existing token to restore user authentication state.
  const loginWithToken = (token) => {
    localStorage.setItem('token', token);
    return api.get('/auth/me').then(({ data }) => {
      setUser(data.user);
      return data;
    });
  };

  // Clear auth data when the user logs out.
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
