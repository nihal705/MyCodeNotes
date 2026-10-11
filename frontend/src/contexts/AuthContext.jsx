import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      if (data?.authenticated) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = async (payload) => authApi.signup(payload);

  const verifyOtp = async (email, otp) => {
    const data = await authApi.verifyOtp(email, otp);
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await authApi.updateProfile(payload);
    setUser((prev) => ({ ...prev, ...data, authenticated: true }));
    return data;
  };

  const changePassword = (current_password, new_password) =>
    authApi.changePassword(current_password, new_password);

  const uploadAvatar = async (file) => {
    const data = await authApi.uploadAvatar(file);
    setUser((prev) => ({ ...prev, ...data, authenticated: true }));
    return data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    verifyOtp,
    login,
    logout,
    refresh,
    updateProfile,
    changePassword,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used inside AuthProvider");
  return ctx;
}