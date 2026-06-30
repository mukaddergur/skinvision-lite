import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuth,
  fetchMe,
  getStoredUser,
  getToken,
  login as apiLogin,
  register as apiRegister,
  setAuth,
} from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((me) => {
        setUser(me);
        setAuth(token, me);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    setAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const data = await apiRegister(username, email, password);
    setAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAuthenticated: !!user }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
