import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import CharacterSelector from "./Character.jsx";
import { Button, Container, Spinner, ProgressBar, Modal, Row, Col } from "react-bootstrap";
import "../style/Character.css";

const CharacterPage = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [mode, setMode] = useState("loading"); // loading | select | profile | success | require-login
  const [character, setCharacter] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
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
      <Container className="py-5 text-center character-title">
        <h4 className="mb-4">Please log in to select a character</h4>
        <div className="d-flex justify-content-center">
          <button
            className="auth-open-btn"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-panel', { detail: { tab: 'login' } }));
            }}
          >
            Login / Register
          </button>
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
  const level = profile?.level ?? 1;
  const exp = profile?.exp ?? 0;
  const expNow = Math.max(0, Math.min(100, exp));

  // Derive bonus stats from buff string
  const buffText = (stats.buff || "").toLowerCase();
  const getPercentFromText = (text) => {
    const m = text.match(/([0-9]{1,3})\s*%/);
    return m ? parseInt(m[1], 10) : 0;
  };
  let bonus = {
    critRate: 0,
    critDamage: 0,
    armorPen: 0,
    damageReduction: 0,
    lifesteal: 0,
  };
  if (buffText.includes("crit damage")) bonus.critDamage = getPercentFromText(buffText) || 25;
  if (buffText.includes("crit") && buffText.includes("chance")) bonus.critRate = getPercentFromText(buffText) || 15;
  if (buffText.includes("armor penetration") || buffText.includes("magic penetration")) bonus.armorPen = getPercentFromText(buffText) || 20;
  if (buffText.includes("damage reduction")) bonus.damageReduction = getPercentFromText(buffText) || 10;
  if (buffText.includes("lifesteal")) bonus.lifesteal = getPercentFromText(buffText) || 15;

  const viewCritRate = (stats.critRate ?? 0) + bonus.critRate;
  const viewCritDamage = (stats.critDamage ?? 0) + bonus.critDamage;

  return (
    <Container className="py-5 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4 character-title">
        <h3>Character Profile</h3>
      </div>

      <div className="p-4 rounded-4" style={{ background: "#121212", border: "1px solid #333" }}>
        <div className="d-flex align-items-start gap-4">
          {/* Avatar box */}
          <div className="position-relative avatar-edit-wrap" style={{ width: 120, height: 120 }}>
            <img
              src={user?.avatar || "/image/avatar/avatar-0.jpg"}
              alt="avatar"
              className="rounded-3"
              style={{ width: "120px", height: "120px", objectFit: "cover", border: "1px solid #333" }}
            />
            <button
              className="auth-open-btn avatar-edit-btn"
              style={{ position: "absolute", bottom: 8, left: 8, padding: "6px 10px" }}
              onClick={() => setShowAvatarModal(true)}
            >
              Chỉnh sửa
            </button>
          </div>

          {/* Stats and info */}
          <div className="flex-grow-1">
            <div className="mb-2"><strong>Name:</strong> {user?.username}</div>
            <div className="mb-2"><strong>Class:</strong> {profile?.class || "-"}</div>
            <div className="mb-2"><strong>Level:</strong> {level}</div>
            <div className="mb-3">
              <div className="mb-1"><strong>EXP:</strong> {expNow}/100</div>
              <ProgressBar now={expNow} variant="info" />
            </div>
            <div className="mb-2"><strong>Buff:</strong> {stats.buff}</div>
            <hr className="border-secondary" />
            <div className="row g-3">
              <div className="col-6 col-md-3"><strong>HP:</strong> {stats.hp}</div>
              <div className="col-6 col-md-3"><strong>Speed:</strong> {stats.speed}</div>
              <div className="col-6 col-md-3"><strong>Damage:</strong> {stats.damage}</div>
              <div className="col-6 col-md-3"><strong>Armor:</strong> {stats.armor}</div>
              <div className="col-6 col-md-3"><strong>Crit Rate:</strong> {viewCritRate}%</div>
              <div className="col-6 col-md-3"><strong>Crit Damage:</strong> {viewCritDamage}%</div>
              <div className="col-6 col-md-3"><strong>Armor Penetration:</strong> {bonus.armorPen}%</div>
              <div className="col-6 col-md-3"><strong>Damage Reduction:</strong> {bonus.damageReduction}%</div>
              <div className="col-6 col-md-3"><strong>Lifesteal:</strong> {bonus.lifesteal}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar picker modal */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            {Array.from({ length: 12 }).map((_, idx) => {
              const path = `/image/avatar/avatar-${idx}.jpg`;
              const active = selectedAvatar ? selectedAvatar === path : (user?.avatar || "/image/avatar/avatar-0.jpg") === path;
              return (
                <Col xs={3} key={idx}>
                  <button
                    onClick={() => setSelectedAvatar(path)}
                    className={`p-0 ${active ? 'border border-3 border-primary' : ''}`}
                    style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: 'transparent' }}
                  >
                    <img src={path} alt={`avatar-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setSelectedAvatar(null); setShowAvatarModal(false); }}>Hủy</Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const avatarPath = selectedAvatar || user?.avatar || "/image/avatar/avatar-0.jpg";
                await API.put('/users/avatar', { avatar: avatarPath });
                const me = await API.get('/auth/me');
                login(me.data);
                setShowAvatarModal(false);
              } catch (e) {
                console.error('Update avatar error:', e?.response?.data || e.message);
                alert(e?.response?.data?.message || 'Cập nhật avatar thất bại');
              }
            }}
          >
            Thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CharacterPage;
