import React, { useContext, useState } from "react";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = ({ onDone }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
  const { data } = await API.post("/auth/login", { email, password });
  // Save token and set user context (include gold/gems/exp)
  login({ username: data.username, role: data.role, email: data.email, exp: data.exp, gold: data.gold, gems: data.gems }, data.token);
      onDone?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="label">Email
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="label">Password
        <input
          className="input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="error">{error}</div>}
      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
