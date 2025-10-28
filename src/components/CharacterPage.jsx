import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import CharacterSelector from "./Character.jsx";
import { Button, Container, Spinner } from "react-bootstrap";

const CharacterPage = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [mode, setMode] = useState("loading"); // loading | select | profile | success | require-login
  const [character, setCharacter] = useState(null);
  
  // Always verify from server to avoid stale local state
  useEffect(() => {
    let alive = true;
    const init = async () => {
      try {
        // Try refresh current user (updates characterId if changed)
        const me = await API.get("/auth/me");
        if (!alive) return;
        login(me.data);
      } catch (e) {
        if (!alive) return;
        setMode("require-login");
        return;
      }

      try {
        const { data } = await API.get("/characters/me");
        if (!alive) return;
        setCharacter(data);
        setMode("profile");
      } catch (e) {
        if (!alive) return;
        // 404 => chưa có nhân vật
        setMode("select");
      }
    };
    init();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load character details when in profile mode
  useEffect(() => {
    const load = async () => {
      if (mode !== "profile") return;
      try {
        const { data } = await API.get("/characters/me");
        setCharacter(data);
      } catch (e) {
        // If not found, fall back to select
        setMode("select");
      }
    };
    load();
  }, [mode]);

  const handleCloseSelector = async () => {
    // After successful selection, refresh user and fetch character; then show success
    try {
      const me = await API.get("/auth/me");
      login(me.data);
      const { data } = await API.get("/characters/me");
      setCharacter(data);
      setMode("success");
    } catch (e) {
      setMode("select");
    }
  };

  if (mode === "loading") {
    return (
      <Container className="py-5 text-center text-light">
        <Spinner animation="border" size="sm" /> Loading...
      </Container>
    );
  }

  if (mode === "require-login") {
    return (
      <Container className="py-5 text-center text-light">
        <h4>Vui lòng đăng nhập để chọn nhân vật</h4>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => navigate("/Home")}>Về trang chủ</Button>
        </div>
      </Container>
    );
  }

  if (mode === "select") {
    return (
      <>
        {/* Force selector visible as full-screen overlay; on successful pick it will call onClose */}
        <CharacterSelector show={true} onClose={handleCloseSelector} />
      </>
    );
  }

  if (mode === "success") {
    return (
      <Container className="py-5 text-center text-light">
        <h2 className="mb-4">Chuyển sinh thành công!</h2>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="primary" onClick={() => setMode("profile")}>Xem hồ sơ nhân vật</Button>
          <Button variant="secondary" onClick={() => navigate("/Home")}>Về trang chủ</Button>
        </div>
      </Container>
    );
  }

  // profile
  const profile = character;
  const stats = {
    hp: profile?.stats?.hp ?? 0,
    speed: profile?.stats?.speed ?? 0,
    damage: profile?.stats?.damage ?? 0,
    armor: profile?.stats?.armor ?? 0,
    buff: profile?.stats?.buff ?? "",
    critRate: 0,
    critDamage: 0,
  };

  return (
    <Container className="py-5 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4 character-title">
        <h3>Character Profile</h3>
        
      </div>

      <div className="p-4 rounded-4" style={{ background: "#121212", border: "1px solid #333" }}>
        <div className="mb-2"><strong>Name:</strong> {user?.username}</div>
        <div className="mb-2"><strong>Class:</strong> {profile?.class || "-"}</div>
        <div className="mb-2"><strong>Buff:</strong> {stats.buff}</div>
        <hr className="border-secondary" />
        <div className="row g-3">
          <div className="col-6 col-md-3"><strong>HP:</strong> {stats.hp}</div>
          <div className="col-6 col-md-3"><strong>Speed:</strong> {stats.speed}</div>
          <div className="col-6 col-md-3"><strong>Damage:</strong> {stats.damage}</div>
          <div className="col-6 col-md-3"><strong>Armor:</strong> {stats.armor}</div>
          <div className="col-6 col-md-3"><strong>Crit Rate:</strong> 0%</div>
          <div className="col-6 col-md-3"><strong>Crit Damage:</strong> 0%</div>
        </div>
      </div>
    </Container>
  );
};

export default CharacterPage;
