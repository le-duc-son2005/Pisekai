import { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Prefer validating token with backend; fall back to saved user only if needed
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await API.get("/auth/me");
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          return;
        } catch (err) {
          // Invalid token -> clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    };
    init();
  }, []);

  // userData expected: { username, role?, email? }, token?: string
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
