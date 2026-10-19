import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login supports email (student/coordinator), phone (admin/coordinator), or adminId (admin)
  const login = async ({ email, phone, adminId, password, role }) => {
    const payload = { password };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (adminId) payload.adminId = adminId;
    if (role) payload.role = role;

    const res = await api.post('/auth/login', payload);
    if (!res.requiresOtp && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const verifyLogin = async (challengeId, code) => {
    const res = await api.post('/auth/login/verify', { challengeId, code });
    if (res.user) {
      setUser(res.user);
    }
    return res.user;
  };

  // Register supports role-based payloads
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res;
  };

  const verifyRegister = async (challengeId, code) => {
    const res = await api.post('/auth/register/verify', { challengeId, code });
    if (res.user) {
      setUser(res.user);
    }
    return res.user;
  };

  const resendOtp = async (challengeId) => {
    return api.post('/auth/otp/resend', { challengeId });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isCoordinator: user?.role === 'coordinator',
        isAdmin: user?.role === 'admin',
        login,
        verifyLogin,
        register,
        verifyRegister,
        resendOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
