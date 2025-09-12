import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken, loginApi, setToken, signupApi } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTok(getToken());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await loginApi({ email, password });
    if (!token) throw new Error("Invalid credentials");
    setToken(token);
    setTok(token);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    await signupApi({ email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setTok(null);
    navigate("/auth");
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
  }), [token, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
