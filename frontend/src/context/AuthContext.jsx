import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Context for auth state: current user and helper methods.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return u;

    const out = { ...u };
    let avatar = out.avatar;

    if (!avatar) {
      out.avatar = '';
      return out;
    }

    if (typeof avatar === 'object') {
      avatar = avatar.value || avatar.url || '';
    }

    if (!avatar) {
      out.avatar = '';
      return out;
    }

    const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || window.location.origin;
    if (avatar.startsWith('//')) {
      avatar = 'https:' + avatar;
    } else if (/^\//.test(avatar)) {
      avatar = API_BASE.replace(/\/$/, '') + avatar;
    } else if (!/^https?:\/\//i.test(avatar)) {
      avatar = 'https://' + avatar;
    }

    if (/googleusercontent\.com/i.test(avatar)) {
      avatar = avatar.replace(/=s\d+(-c)?(?=$|[?&])/i, '=s200-c');
    }

    out.avatar = avatar;
    return out;
  };

  // When the app loads, try to restore the authenticated user from local storage.
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');

    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => {
          if (isMounted) {
            setUser(normalizeUser(data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else if (isMounted) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Log in with email and password, store token locally, and keep user info in state.
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.token) {
      localStorage.setItem('token', data.token);
      setUser(normalizeUser(data.user));
    }
    return data;
  };

  // Register a new user, receive an auth token, and set the user state.
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data?.requiresVerification) {
      return data;
    }
    if (data?.token) {
      localStorage.setItem('token', data.token);
      setUser(normalizeUser(data.user));
    }
    return data;
  };

  // Use an existing token to restore user authentication state.
  const loginWithToken = (token) => {
    localStorage.setItem('token', token);
    return api.get('/auth/me').then(({ data }) => {
      setUser(normalizeUser(data.user));
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
