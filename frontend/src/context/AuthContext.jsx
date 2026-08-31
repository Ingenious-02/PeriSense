import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = [
  {
    id: 1,
    name: 'Dr. Adeyemi',
    email: 'adeyemi@perisense.health',
    title: 'Dr.',
    role: 'Lead Obstetrician',
    department: 'Maternal-Fetal Medicine'
  },
  {
    id: 2,
    name: 'Nurse Okoye',
    email: 'okoye@perisense.health',
    title: 'Nurse',
    role: 'Maternal Health Specialist',
    department: 'Antenatal Triage Clinic'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('perisense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('perisense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('perisense_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setUser(res);
      setIsAuthModalOpen(false);
      return res;
    } catch (err) {
      // Fallback for demo users
      const demo = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demo && password === 'password123') {
        setUser(demo);
        setIsAuthModalOpen(false);
        return demo;
      }
      throw err;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setUser(res);
    setIsAuthModalOpen(false);
    return res;
  };

  const switchUser = (demoUser) => {
    setUser(demoUser);
  };

  const logout = () => {
    setUser(null);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        switchUser,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
