'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type UserRole = 'free' | 'pro' | 'enterprise' | null;

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  handleMockLogin: (role: UserRole) => void;
  handleMockLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock initial states - these can be adjusted for default testing behavior
const MOCK_INITIAL_LOGGED_IN_STATE_GLOBAL = false; 
const MOCK_INITIAL_USER_ROLE_GLOBAL: UserRole = 'free';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(MOCK_INITIAL_LOGGED_IN_STATE_GLOBAL);
  const [userRole, setUserRole] = useState<UserRole>(MOCK_INITIAL_USER_ROLE_GLOBAL);

  useEffect(() => {
    // Initialize based on mock constants after component mounts
    // This helps if you want to quickly toggle the default test state
    if (MOCK_INITIAL_LOGGED_IN_STATE_GLOBAL) {
      setIsLoggedIn(true);
      setUserRole(MOCK_INITIAL_USER_ROLE_GLOBAL);
    } else {
      setIsLoggedIn(false);
      setUserRole(null); // Ensure role is null if not logged in initially
    }
  }, []);

  const handleMockLogin = (role: UserRole) => {
    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  };

  const handleMockLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, handleMockLogin, handleMockLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 