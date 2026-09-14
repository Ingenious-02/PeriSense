import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = [
  {
    id: 1,
    name: 'Dr. Adeyemi',
    email: 'adeyemi@perisense.health',
    title: 'Dr.',
    role: 'Lead Obstetrician',
    department: 'Maternal-Fetal Medicine',
    clinic_name: 'PeriSense Care Center'
  },
  {
    id: 2,
    name: 'Nurse Okoye',
    email: 'okoye@perisense.health',
    title: 'Nurse',
    role: 'Maternal Health Specialist',
    department: 'Antenatal Triage Clinic',
    clinic_name: 'PeriSense Care Center'
  }
];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('perisense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Validate active token on initial load
  useEffect(() => {
    async function verifySession() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
          localStorage.setItem('perisense_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Stored session invalid or expired:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();

    // Listen for 401 expiration events from api.js
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('perisense_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('perisense_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    setAuthToken(res.access_token);
    localStorage.setItem('perisense_user', JSON.stringify(res.user));
    setIsAuthModalOpen(false);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setToken(res.access_token);
    setUser(res.user);
    setAuthToken(res.access_token);
    localStorage.setItem('perisense_user', JSON.stringify(res.user));
    setIsAuthModalOpen(false);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('perisense_user');
    localStorage.removeItem('perisense_jwt_token');
  };

  const switchDemoUser = async (demoUser) => {
    return login(demoUser.email, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAuthenticated: !!user && !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
