import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import "../style/panel.css";
import { FaUser } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";
import { FaGem } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


// Right-side slide-out panel with 2 modes: auth forms or user menu
const SlidePanel = ({ open, onClose, externalTab }) => {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();

  // Reset to login view when panel is opened without user
  useEffect(() => {
    if (open && !user) setTab("login");
  }, [open, user]);

  // React to external requests to switch tab (e.g., open-panel event)
  useEffect(() => {
    if (externalTab) setTab(externalTab);
  }, [externalTab]);

  // format big numbers so they don't overflow (e.g., 2.2K, 3.4M)
  const fmtCompact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

  return (
    <div className={`slide-panel ${open ? "open" : ""}`} aria-hidden={!open}>
      <button className="panel-backdrop" onClick={onClose} aria-label="Close menu" />
      <div className="panel-body">
        <div className="panel-header">
          <h4 className="panel-title">{user ? "Account" : "Welcome"}</h4>
        </div>

        {!user ? (
          <>
            <div className="panel-tabs">
              <button
                className={`panel-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                Login
              </button>
              <button
                className={`panel-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
              >
                Register
              </button>
            </div>
            <div className="panel-content">
              {tab === "login" ? (
                <LoginForm onDone={onClose} />
              ) : (
                <RegisterForm onDone={() => setTab("login")} />
              )}
            </div>
          </>
        ) : (
          <div className="panel-content">
            <div className="user-card">
              <div className="user-left">
                <div className="avatar" aria-hidden><FaUser /></div>
                <div>
                  <div className="username">{user.username}</div>
                  {user.email && <div className="user-sub">{user.email}</div>}
                </div>
              </div>
            </div>

            {(user.gold !== undefined || user.gems !== undefined) && (
              <div className="wallet-row">
                <div className="wallet-pill gold" title="Gold">
                  <span className="wallet-icon" aria-hidden><FaCoins/></span>
                  <span className="wallet-value">{fmtCompact.format(user.gold ?? 0)}</span>
                </div>
                <div className="wallet-pill gems" title="Gems">
                  <span className="wallet-icon" aria-hidden><FaGem/></span>
                  <span className="wallet-value">{fmtCompact.format(user.gems ?? 0)}</span>
                </div>
              </div>
            )}

            <nav className="user-menu">
              <button className="menu-item" onClick={() => alert("Profile đang cập nhật")}>Profile</button>
              <button className="menu-item" onClick={() => { navigate("/recharge"); onClose && onClose(); }}>Recharge</button>
              <button className="menu-item danger" onClick={logout}>Logout</button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidePanel;
