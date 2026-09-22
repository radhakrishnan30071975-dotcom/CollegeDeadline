import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const DEMO_TOKEN = "frontend-demo-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("coa_user");
    return stored ? JSON.parse(stored) : null;
  });
  const loading = false;

  const login = (token, userData) => {
    localStorage.setItem("coa_token", token);
    localStorage.setItem("coa_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("coa_token");
    localStorage.removeItem("coa_user");
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem("coa_user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
