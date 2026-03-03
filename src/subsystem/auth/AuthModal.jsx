import React, { useState } from "react";
import { Modal, Nav } from "react-bootstrap";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

// Centered authentication modal (Bootstrap) shown when user is logged out
const AuthModal = ({ show, onHide, initialTab = "login" }) => {
  const [tab, setTab] = useState(initialTab);

  const handleLoginDone = () => {
    onHide?.();
    // Open the side Account panel after login
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-panel", { detail: { tab: null } }));
    }, 50);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop keyboard>
      <div className="bg-dark text-light" style={{ borderRadius: 12 }}>
        <div className="px-3 py-2 border-bottom border-secondary">
          <h5 className="m-0">{tab === "login" ? "Welcome" : "Create Account"}</h5>
        </div>

        <div className="px-3 pt-3">
          <Nav variant="pills" activeKey={tab} onSelect={(k) => setTab(k || "login")} className="mb-3">
            <Nav.Item className="flex-fill text-center">
              <Nav.Link eventKey="login" className="fw-semibold">Login</Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill text-center">
              <Nav.Link eventKey="register" className="fw-semibold">Register</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="px-3 pb-3">
          {tab === "login" ? (
            <LoginForm onDone={handleLoginDone} />
          ) : (
            <RegisterForm onDone={() => setTab("login")} />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
