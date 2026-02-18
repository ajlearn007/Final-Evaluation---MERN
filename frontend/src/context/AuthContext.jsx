import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (userData) => {
    localStorage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("authUser");
      const token = localStorage.getItem("authToken");
      if (storedUser && token) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          const me = await apiRequest("/api/auth/me", { auth: true });
          if (me?.user) {
            persistUser(me.user);
          }
        } catch {
          localStorage.removeItem("authUser");
          localStorage.removeItem("authToken");
          setUser(null);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const activeTheme = user?.theme === "dark" ? "theme-dark" : "theme-light";
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(activeTheme);
  }, [user?.theme]);

  const login = (userData, token) => {
    localStorage.setItem("authToken", token);
    persistUser(userData);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };

  const signup = async (payload) => {
    const data = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: payload,
    });
    login(data.user, data.token);
  };

  const loginWithCredentials = async (payload) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: payload,
    });
    login(data.user, data.token);
  };

  const updateProfile = async (payload) => {
    const data = await apiRequest("/api/auth/me", {
      method: "PATCH",
      auth: true,
      body: payload,
    });

    if (data?.user) {
      persistUser(data.user);
    }

    return data?.user;
  };

  const updateSettings = async (payload) => {
    const data = await apiRequest("/api/auth/settings", {
      method: "PATCH",
      auth: true,
      body: payload,
    });

    if (data?.user) {
      persistUser(data.user);
    }

    return data?.user;
  };

  const value = {
    user,
    loading,
    loginWithCredentials,
    signup,
    updateProfile,
    updateSettings,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

