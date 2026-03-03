import React, { useState } from "react";
import API from "../../api/api";

const RegisterForm = ({ onDone }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDoneMsg("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { username, email, password });
      setDoneMsg(data?.message || "Đăng ký thành công. Hãy đăng nhập!");
      onDone?.("register");
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="label">Username
        <input
          className="input"
          type="text"
          placeholder="yourname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
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
      {doneMsg && <div className="success">{doneMsg}</div>}
      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Creating…" : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
