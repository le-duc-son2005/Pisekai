import React, { useEffect, useMemo, useState, useContext } from "react";
import { Container, Button, ButtonGroup, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import "../style/quest.css";

const TYPES = [
  { key: "all", label: "Tất cả" },
  { key: "daily", label: "Daily" },
  { key: "main", label: "Main" },
  { key: "enhance", label: "Enhance" },
  { key: "event", label: "Event" },
  { key: "special", label: "Special" },
  { key: "newbie", label: "Newbie" },
  { key: "completed", label: "Đã hoàn thành" },
];

const Quest = () => {
  const { user } = useContext(AuthContext);
  const [activeType, setActiveType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quests, setQuests] = useState([]);

  const fetchQuests = async (type) => {
    setLoading(true);
    setError("");
    try {
      if (type === "completed") {
        // Requires auth
        const { data } = await API.get("/quests/completed");
        setQuests(data || []);
      } else {
        const q = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : "";
        const { data } = await API.get(`/quests${q}`);
        setQuests(data || []);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[QUEST FETCH ERROR]', {
        type,
        status: e?.response?.status,
        message: e?.response?.data?.message || e.message,
        urlTried: e?.config?.url,
      });
      setError(e?.response?.data?.message || e.message || "Load quests failed");
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  // Default to Daily when logged in; otherwise 'all'
  useEffect(() => {
    if (user && activeType === 'all') {
      setActiveType('daily');
      return;
    }
    // If user state changes while staying on an auth-only tab, refetch
    if ((activeType === 'daily' || activeType === 'completed')) {
      fetchQuests(activeType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return; // don't fetch when not logged in (page is gated)
    fetchQuests(activeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, user]);

  const visibleTypes = useMemo(() => TYPES, []);

  // Require login for the entire Quest page
  if (!user) {
    return (
      <Container className="py-5 text-center quest-title">
        <h4 className="mb-3">Please log in to view Quests</h4>
        <button
          className="auth-open-btn"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-panel', { detail: { tab: 'login' } }));
          }}
        >
          Login / Register
        </button>
      </Container>
    );
  }

  return (
    <Container className="py-4 text-light">
      <div className="d-flex justify-content-between align-items-center mb-3 quest-title ">
        <h3 className="m-0 ">Quests</h3>
      </div>

      <div className="mb-3">
        <ButtonGroup className="flex-wrap gap-2">
          {visibleTypes.map((t) => (
            <Button
              key={t.key}
              variant={activeType === t.key ? "warning" : "outline-warning"}
              onClick={() => setActiveType(t.key)}
              className="quest-filter-btn"
            >
              {t.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Page-level login required already handled above */}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" /> Đang tải...
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : quests.length === 0 ? (
        <div className="text-center text-secondary py-5">Không có nhiệm vụ nào.</div>
      ) : (
        <Row className="g-3">
          {quests.map((q) => (
            <Col xs={12} md={6} lg={4} key={q.questId}>
              <Card className="quest-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{q.name}</Card.Title>
                    <span className={`quest-type-badge type-${q.type}`}>{q.type}</span>
                  </div>
                  <Card.Text className="text-secondary mb-2">{q.description}</Card.Text>
                  {/* Requirement hidden for cleaner UI */}
                  {q.reward && (
                    <div className="small text-danger">
                      Phần thưởng: {typeof q.reward === "object" ? JSON.stringify(q.reward) : String(q.reward)}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Quest;
