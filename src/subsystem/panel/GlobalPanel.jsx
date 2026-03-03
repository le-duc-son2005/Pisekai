import React, { useEffect, useState, useContext } from "react";
import SlidePanel from "./SlidePanel";
import AuthModal from "../auth/AuthModal";
import "../../style/panel.css";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { AuthContext } from "../../context/AuthContext";

// A single global trigger + drawer used across pages
const GlobalPanel = () => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [externalTab, setExternalTab] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const toggle = () => {
    if (!user) {
      // When logged out, clicking the arrow opens centered auth, not the side panel
      setExternalTab("login");
      setShowAuth(true);
      return;
    }
    setOpen(v => !v);
  };

  // Allow other components to open the panel and choose tab via a custom event
  useEffect(() => {
    const handler = (e) => {
      const tab = e?.detail?.tab || "login";
      setExternalTab(tab);
      if (!user) {
        // When logged out, show centered auth modal instead of side panel
        setShowAuth(true);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener("open-panel", handler);
    return () => window.removeEventListener("open-panel", handler);
  }, [user]);

  // When user logs out, close the side panel and show centered auth
  useEffect(() => {
    if (!user && open) {
      setOpen(false);
      setExternalTab("login");
      setShowAuth(true);
    }
  }, [user, open]);

  return (
    <>
      {/* Centered auth modal when logged out */}
      <AuthModal
        show={showAuth}
        onHide={() => setShowAuth(false)}
        initialTab={externalTab || "login"}
      />

      {/* Fixed arrow trigger that sticks to the right edge and moves with the drawer */}
      <button
        className={`panel-trigger ${open ? "open" : ""}`}
        style={{ right: open ? "min(92vw, 360px)" : 0 }}
        onClick={toggle}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <FaAngleLeft /> : <FaAngleRight   />}
      </button>

      {/* Slide-out panel */}
      <SlidePanel open={open} onClose={() => setOpen(false)} externalTab={externalTab} />
    </>
  );
};

export default GlobalPanel;
