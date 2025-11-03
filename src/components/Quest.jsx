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
  const [progressMap, setProgressMap] = useState({}); // { [questId]: { status, claimed } }

  const loadProgress = async () => {
    try {
      const { data } = await API.get('/quests/progress');
      const map = {};
      (data || []).forEach((p) => { map[p.questId] = { status: p.status, claimed: !!p.claimed }; });
      setProgressMap(map);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[QUEST PROGRESS ERROR]', e?.response?.data || e.message);
      setProgressMap({});
    }
  };

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
      await loadProgress();
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

  // On user changes, refetch if current tab requires auth
  useEffect(() => {
    if ((activeType === 'daily' || activeType === 'completed') && user) {
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

  // Helpers
  const isCompleted = (qid) => !!progressMap[qid]?.status && progressMap[qid].status === 'completed';
  const isClaimed = (qid) => !!progressMap[qid]?.claimed;
  const isLoginQuest = (q) => typeof q?.name === 'string' && /login|đăng\s*nhập/i.test(q.name) && String(q?.type || '').toLowerCase() === 'daily';

  const { login } = useContext(AuthContext);

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      login(data);
      // Notify Character page to refresh exp/level if open
      window.dispatchEvent(new Event('character-refresh'));
    } catch {}
  };

  const claimQuest = async (qid) => {
    try {
      await API.post(`/quests/${qid}/claim`);
      await loadProgress();
      await refreshUser();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[QUEST CLAIM ERROR]', e?.response?.data || e.message);
      alert(e?.response?.data?.message || 'Claim thất bại');
    }
  };

  // For daily login quest: offer a one-click flow even if not yet auto-completed
  const quickClaimDailyLogin = async (q) => {
    const idParam = Number(q?.questId) ? Number(q.questId) : q?.questId; // prefer numeric
    try {
      if (!isCompleted(q.questId)) {
        await API.post(`/quests/${idParam}/complete`);
      }
      if (!isClaimed(q.questId)) {
        await API.post(`/quests/${idParam}/claim`);
      }
      await loadProgress();
      await refreshUser();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[QUEST QUICK CLAIM LOGIN ERROR]', e?.response?.data || e.message);
      alert(e?.response?.data?.message || 'Không thể nhận nhiệm vụ đăng nhập');
    }
  };

  // Auto-complete daily login quest heuristic: if a daily with name contains 'login' or 'đăng nhập'
  useEffect(() => {
    if (!user) return;
    if (!(activeType === 'daily' || activeType === 'all')) return;
    const loginQuest = quests.find((q) => typeof q.name === 'string' && /login|đăng\s*nhập/i.test(q.name));
    if (!loginQuest) return;
    const qid = loginQuest.questId;
    const ensureCompleted = async () => {
      try {
        if (!isCompleted(qid)) {
          await API.post(`/quests/${qid}/complete`);
          await loadProgress();
        }
      } catch {}
    };
    ensureCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests, activeType, user]);

  // Require login for the entire Quest page (place after hooks to satisfy Rules of Hooks)
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
          {[...quests]
            .sort((a, b) => {
              // Completed but unclaimed first, then in-progress, then claimed last
              const ra = isClaimed(a.questId) ? 2 : isCompleted(a.questId) ? 0 : 1;
              const rb = isClaimed(b.questId) ? 2 : isCompleted(b.questId) ? 0 : 1;
              if (ra !== rb) return ra - rb;
              return (a.questId || 0) - (b.questId || 0);
            })
            .map((q) => (
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
                    <div className="small">
                      {(() => {
                        const R = q.reward;
                        const val = (k) => (typeof R === 'object' && !Array.isArray(R) ? (R[k] ?? R[k.toUpperCase()] ?? R[k.toLowerCase()]) : undefined);
                        const exp = val('exp') ?? val('xp') ?? val('experience');
                        const gold = val('gold') ?? val('coins') ?? val('coin');
                        const gems = val('gems') ?? val('gem');
                        const item = val('item');
                        const lines = [];
                        const toNum = (v) => typeof v === 'number' ? v : (typeof v === 'string' ? (parseInt((v.match(/[-+]?\d+/)||['0'])[0],10)) : 0);
                        if (exp !== undefined) lines.push(<div key="exp">EXP +{toNum(exp)}</div>);
                        if (gold !== undefined) lines.push(<div key="gold">Coin +{toNum(gold)}</div>);
                        if (gems !== undefined) lines.push(<div key="gems">Gems +{toNum(gems)}</div>);
                        if (item !== undefined) lines.push(<div key="item">Item: {String(item)}</div>);
                        if (lines.length === 0 && typeof R === 'string') {
                          // fallback: try parse string like "EXP +50, Coin +50"
                          const parts = R.split(/[;,]/);
                          parts.forEach((p, i) => lines.push(<div key={`s${i}`}>{p.trim()}</div>));
                        }
                        return lines;
                      })()}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    {isClaimed(q.questId) ? (
                      <span className="badge bg-success">Đã nhận ✓</span>
                    ) : isCompleted(q.questId) ? (
                      <Button size="sm" variant="warning" onClick={() => claimQuest(q.questId)}>Claim</Button>
                    ) : isLoginQuest(q) ? (
                      <Button size="sm" variant="warning" onClick={() => quickClaimDailyLogin(q)}>Claim</Button>
                    ) : (
                      <span className="badge bg-secondary">Đang làm</span>
                    )}
                  </div>
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
