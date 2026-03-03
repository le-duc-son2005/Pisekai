import React, { useContext, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from "react-bootstrap";
import { FaCoins, FaGem, FaUser } from "react-icons/fa";
import { AuthContext } from "../../../context/AuthContext";
import RequireLogin from "../../../subsystem/auth/RequireLogin.jsx";
import useProfile from "../hook/useProfile";
import "../style/profile.css";

const AVATARS = Array.from({ length: 14 }, (_, i) => `/image/avatar/avatar-${i}.jpg`);
const FALLBACK = "/image/avatar/avatar-0.jpg";

const RARITY_COLOR = {
  Fighter: "#e05c5c",
  Mage: "#9b59f7",
  Archer: "#4caf50",
  Healer: "#4fc3f7",
  Assassin: "#f39c12",
};

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { profile, loading, error, changeAvatar } = useProfile();
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  if (!user) return <RequireLogin title="Please login to view your Profile" />;

  const handlePickAvatar = async (path) => {
    setSavingAvatar(true);
    setAvatarMsg(null);
    const result = await changeAvatar(path);
    if (result.success) {
      setAvatarMsg({ type: "success", text: "Avatar đã được cập nhật!" });
      setPickingAvatar(false);
    } else {
      setAvatarMsg({ type: "danger", text: result.message });
    }
    setSavingAvatar(false);
    setTimeout(() => setAvatarMsg(null), 3000);
  };

  const charClass = profile?.characterId?.class || null;
  const charLevel = profile?.characterId?.level ?? null;
  const charExp = profile?.characterId?.exp ?? null;

  return (
    <div className="profile-page">
      <Container className="py-5">
        <h1 className="profile-title">My Profile</h1>

        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="warning" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {avatarMsg && (
          <Alert variant={avatarMsg.type} dismissible onClose={() => setAvatarMsg(null)}>
            {avatarMsg.text}
          </Alert>
        )}

        {!loading && !error && profile && (
          <Row className="g-4 justify-content-center">
            {/* Avatar card */}
            <Col xs={12} md={4}>
              <Card className="profile-card text-center shadow">
                <Card.Body className="py-4">
                  <div className="profile-avatar-wrap mx-auto mb-3">
                    <img
                      src={profile.avatar || FALLBACK}
                      alt="avatar"
                      className="profile-avatar"
                      onError={(e) => { e.target.src = FALLBACK; }}
                    />
                  </div>
                  <h4 className="profile-username">{profile.username}</h4>
                  {profile.email && <p className="text-muted small mb-1">{profile.email}</p>}
                  <Badge bg="secondary" className="text-capitalize">{profile.role}</Badge>

                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="d-block mx-auto mt-3"
                    onClick={() => setPickingAvatar((v) => !v)}
                    disabled={savingAvatar}
                  >
                    {pickingAvatar ? "Cancel" : "Change Avatar"}
                  </Button>

                  {/* Avatar picker grid */}
                  {pickingAvatar && (
                    <div className="avatar-picker mt-3">
                      {AVATARS.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className={`avatar-option ${profile.avatar === src ? "selected" : ""}`}
                          onClick={() => !savingAvatar && handlePickAvatar(src)}
                        />
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Stats card */}
            <Col xs={12} md={5}>
              <Card className="profile-card shadow">
                <Card.Body className="py-4">
                  <h5 className="profile-section-title mb-3">Wallet</h5>
                  <div className="wallet-row mb-4">
                    <div className="wallet-pill gold">
                      <FaCoins className="me-1" />
                      <span>{(profile.gold ?? 0).toLocaleString("vi-VN")}</span>
                      <small className="ms-1 text-muted">Gold</small>
                    </div>
                    <div className="wallet-pill gems ms-3">
                      <FaGem className="me-1" />
                      <span>{(profile.gems ?? 0).toLocaleString("vi-VN")}</span>
                      <small className="ms-1 text-muted">Gems</small>
                    </div>
                  </div>

                  <h5 className="profile-section-title mb-3">Character</h5>
                  {charClass ? (
                    <div className="char-info">
                      <div className="char-class" style={{ color: RARITY_COLOR[charClass] || "#ccc" }}>
                        <FaUser className="me-2" />
                        {charClass}
                      </div>
                      <div className="char-stats">
                        <span className="char-stat">Lv. <strong>{charLevel}</strong></span>
                        <span className="char-stat ms-3">EXP: <strong>{charExp?.toLocaleString?.() ?? charExp}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted small">Chưa chọn nhân vật. Vào trang Character để chọn!</p>
                  )}

                  {profile.joinedAt && (
                    <>
                      <h5 className="profile-section-title mt-4 mb-1">Joined</h5>
                      <p className="text-muted small">
                        {new Date(profile.joinedAt).toLocaleDateString("vi-VN", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
