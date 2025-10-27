import React, { useState } from "react";
import SlidePanel from "./SlidePanel";
import "../style/panel.css";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

// A single global trigger + drawer used across pages
const GlobalPanel = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(v => !v);

  return (
    <>
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
      <SlidePanel open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default GlobalPanel;
