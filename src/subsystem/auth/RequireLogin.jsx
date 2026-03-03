import React from "react";
import { Container, Button } from "react-bootstrap";

// Reusable centered prompt to require authentication
const RequireLogin = ({ title = "Please login to continue" }) => {
  return (
    <Container className="py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <h4 className="auth-title mb-4 text-center">{title}</h4>
      <Button
        variant="warning"
        className="fw-bold px-4 py-2 auth-open-btn"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("open-panel", { detail: { tab: "login" } })); //detail provide info for doing action inside 
        }}
      >
        Login / Register
      </Button>
    </Container>
  );
};

export default RequireLogin;
