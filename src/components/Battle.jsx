import React, { useEffect, useState, useRef, useContext } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button, Modal } from "react-bootstrap";
import { FaCoins } from "react-icons/fa";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import "../style/battle.css";
import "../style/quest.css"; // reuse quest card styling

const rarityColor = (r) => {
  const k = String(r || '').toLowerCase();
  if (k === 'mythic') return 'danger';
  if (k === 'legendary') return 'warning';
  if (k === 'epic') return 'primary';
  if (k === 'rare') return 'info';
  if (k === 'uncommon') return 'success';
  return 'secondary';
};

const difficultyOf = (m) => {
  const d = m?.difficulty || m?.rarity;
  if (d) return String(d).charAt(0).toUpperCase() + String(d).slice(1);
  const lvl = Number(m?.level) || 0;
  if (lvl <= 10) return 'Easy';
  if (lvl <= 20) return 'Medium';
  if (lvl <= 30) return 'Hard';
  return 'Nightmare';
};

const parseRewards = (reward) => {
  const res = { exp: 0, gold: 0, gems: 0, item: null, loot: [] };
  if (!reward) return res;
  const parseNum = (v) => typeof v === 'number' ? v : (typeof v === 'string' ? (parseInt((v.match(/[-+]?\d+/)||['0'])[0],10) || 0) : 0);
  const val = (obj, k) => obj?.[k] ?? obj?.[k?.toLowerCase?.()] ?? obj?.[k?.toUpperCase?.()];
  if (typeof reward === 'object' && !Array.isArray(reward)) {
    const exp = val(reward,'exp') ?? val(reward,'xp') ?? val(reward,'experience');
    const gold = val(reward,'gold') ?? val(reward,'coins') ?? val(reward,'coin');
    const gems = val(reward,'gems') ?? val(reward,'gem');
    const item = val(reward,'item');
    const loot = val(reward,'loot');
    if (exp !== undefined) res.exp = parseNum(exp);
    if (gold !== undefined) res.gold = parseNum(gold);
    if (gems !== undefined) res.gems = parseNum(gems);
    if (item !== undefined) res.item = String(item);
    if (loot !== undefined) {
      if (Array.isArray(loot)) res.loot = loot.map(String);
      else if (typeof loot === 'string') res.loot = loot.split(/[;,]/).map(s=>s.trim()).filter(Boolean);
    }
  } else if (typeof reward === 'string') {
    const parts = reward.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    parts.forEach(p => {
      if (/exp/i.test(p)) res.exp = parseNum(p);
      if (/(coin|gold)/i.test(p)) res.gold = parseNum(p);
      if (/gem/i.test(p)) res.gems = parseNum(p);
    });
  }
  return res;
};

const monsterGifPath = (name) => {
  if (!name) return null;
  try {
    return `/image/monster/${encodeURIComponent(String(name))}.gif`;
  } catch (_) {
    return `/image/monster/${String(name).replace(/\s/g, '%20')}.gif`;
  }
};

// Fallback compute stats on frontend in case backend doesn't provide them yet
const computeStats = (m) => {
  if (!m) return null;
  // Prefer nested stats from API/DB
  const s = m.stats && typeof m.stats === 'object' ? m.stats : {};
  if (s && (s.hp != null || s.attack != null || s.defense != null || s.speed != null)) return s;
  // If DB stored stats as top-level fields (hp/attack/defense/speed), use them directly
  const hp = m?.hp ?? m?.HP ?? m?.health;
  const attack = m?.attack ?? m?.atk;
  const defense = m?.defense ?? m?.def;
  const speed = m?.speed ?? m?.spd ?? m?.agi;
  if (hp != null || attack != null || defense != null || speed != null) {
    return { hp, attack, defense, speed };
  }
  // Fallback: compute basic defaults by level to avoid empty UI (will be overridden once API provides real stats)
  const lvl = Number(m.level) || 1;
  return {
    hp: 30 + Math.max(0, lvl - 1) * 10,
    attack: 5 + Math.max(0, lvl - 1) * 2,
    defense: 2 + Math.max(0, lvl - 1) * 1,
    speed: 1 + Math.max(0, lvl - 1) * 1,
  };
};

const Battle = () => {
  const { user, login } = useContext(AuthContext);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState(null);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pvLoading, setPvLoading] = useState(false);
  const [pvError, setPvError] = useState('');
  const [fightLoading, setFightLoading] = useState(false);
  const [fightError, setFightError] = useState('');
  const [fightResult, setFightResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const logRef = useRef(null);
  const revealTimerRef = useRef(null);
  const appliedSyncRef = useRef(false);
  // Load battle levels on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const { data } = await API.get('/battle/levels');
        setLevels(Array.isArray(data) ? data : []);
        setDebug(null);
      } catch (e) {
        const errMsg = e?.response?.data?.message || e?.response?.data || e.message || 'Load levels failed';
        setError(errMsg);
        const code = e?.response?.status;
        if (code === 404) {
          setDebug({
            tip: 'Backend trả 404 cho /api/battle/levels. Thường là route chưa được đăng ký hoặc server chưa restart.',
            quickChecks: [
              'Mở http://localhost:5000/api/battle/ping (phải trả về { ok: true })',
              'Mở http://localhost:5000/api/battle/levels (phải trả về [] hoặc list JSON)',
              'Mở http://localhost:5000/api/_routes để xem danh sách routes đã mount',
              "Trong backend/server.js phải có: app.use('/api/battle', battleRoutes) và app.get('/api/battle/levels', listLevels)",
            ],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When a monster is selected, load its preview; reset states when deselected
  useEffect(() => {
    if (selected) {
      // eslint-disable-next-line no-console
      console.log('[BATTLE] Selected monster:', {
        name: selected?.name,
        level: selected?.level,
        stats: selected?.stats,
        rewards: selected?.rewards,
      });

      const loadPreview = async () => {
        try {
          setPvLoading(true); setPvError('');
          const { data } = await API.get(`/battle/preview/${selected._id || selected.id}`);
          setPreview(data);
        } catch (e) {
          const code = e?.response?.status;
          const msg = e?.response?.data?.message || e.message || 'Preview failed';
          setPvError(code === 401 ? 'Cần đăng nhập để xem tỷ lệ thắng.' : msg);
          setPreview(null);
        } finally {
          setPvLoading(false);
        }
      };
      loadPreview();
    } else {
      setPreview(null); setPvError(''); setPvLoading(false);
      setFightResult(null); setFightError(''); setFightLoading(false);
      setVisibleLogs([]);
    }
  }, [selected]);

  // Incrementally reveal fight logs when result panel is open
  useEffect(() => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setVisibleLogs([]);
    const logs = fightResult?.log || [];
    if (showResult && logs.length > 0) {
      let i = 0;
      revealTimerRef.current = setInterval(() => {
        i += 1;
        setVisibleLogs(logs.slice(0, Math.min(i, logs.length)));
        if (i >= logs.length) {
          clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
        }
      }, 250);
    }
    return () => {
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [showResult, fightResult]);

  // Auto-scroll to bottom as new logs appear
  useEffect(() => {
    if (logRef.current) {
      try {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      } catch (_) {}
    }
  }, [visibleLogs]);

  // Sync wallet/exp from backend after a win so UI reflects new coins immediately
  useEffect(() => {
    if (fightResult && showResult && fightResult.winner === 'hero' && !appliedSyncRef.current) {
      appliedSyncRef.current = true;
      (async () => {
        try {
          const { data } = await API.get('/auth/me');
          if (data) login(data);
        } catch (_) {
          // Fallback: optimistic local update using applied deltas if provided
          try {
            const goldDelta = Number(fightResult?.applied?.gold || 0);
            const expDelta = Number(fightResult?.applied?.exp || 0);
            if (goldDelta || expDelta) {
              const next = { ...(user || {}), gold: (user?.gold || 0) + goldDelta, exp: (user?.exp || 0) + expDelta };
              login(next);
            }
          } catch { /* ignore */ }
        }
      })();
    }
  }, [fightResult, showResult, login, user]);

  return (
    <Container className="py-4 text-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0 battle-title">Battle</h3>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" size="sm"/> Đang tải...</div>
      ) : error ? (
        <>
          <Alert variant="danger">{String(error)}</Alert>
          {debug && (
            <Alert variant="secondary" className="mt-2">
              <div className="fw-bold">Gợi ý khắc phục nhanh:</div>
              <ul className="mb-0">
                {debug.quickChecks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      ) : levels.length === 0 ? (
        <div className="text-center text-secondary py-5">Chưa có level nào.</div>
      ) : (
        <Row className="g-3">
          {levels.map((m) => (
            <Col xs={12} md={6} lg={4} key={m._id || `${m.name}-${m.level}`}>
              <Card className="quest-card h-100">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="text-secondary small">Level {m.level}</div>
                    <div className="mt-1">Độ khó: <Badge bg={rarityColor(m.rarity)}>{difficultyOf(m)}</Badge></div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="danger" onClick={() => { setSelected(m); setShow(true); }}>Fight</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Fight Panel */}
      <Modal show={show} onHide={() => setShow(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{selected?.name || 'Battle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="d-flex align-items-center justify-content-center">
              <div style={{ width: 360, height: 260, background: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {selected && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={monsterGifPath(selected.name)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
              </div>
            </Col>
            <Col md={6}>
              <h5 className="mb-2">{selected?.name}</h5>
              <div className="text-secondary mb-3">Level {selected?.level} • {difficultyOf(selected || {})}</div>
              <div>
                {(() => {
                  const S = computeStats(selected);
                  return (
                    <ul className="mb-3" style={{ paddingLeft: 18 }}>
                      {Object.entries(S || {}).map(([k, v]) => (
                        <li key={k}><strong>{k}:</strong> {String(v)}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div className="d-flex align-items-center gap-4 flex-wrap">
                  {(() => {
                    const R = parseRewards(selected?.rewards);
                    return (
                      <>
                        <div><strong>EXP:</strong> {R.exp}</div>
                        <div className="d-flex align-items-center"><FaCoins className="me-1"/> {R.gold}</div>
                        {R.loot && R.loot.length > 0 && (
                          <div className="d-flex align-items-center flex-wrap" style={{ gap: 6 }}>
                            <span className="text-secondary me-1">Loot:</span>
                            {R.loot.map((it, idx) => (
                              <Badge bg="secondary" key={idx}>{String(it)}</Badge>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
                  {pvLoading ? (
                    <span className="text-secondary small">Đang tính tỉ lệ...</span>
                  ) : pvError ? (
                    <span className="text-danger small">{pvError}</span>
                  ) : preview ? (
                    <Badge bg={preview.winRate >= 0.7 ? 'success' : preview.winRate >= 0.4 ? 'warning' : 'danger'}>
                      Tỷ lệ thắng: {Math.round(preview.winRate * 100)}%
                    </Badge>
                  ) : null}
                  <Button variant="danger" disabled={fightLoading} onClick={async () => {
                    if (!selected) return;
                    try {
                      setFightLoading(true);
                      setFightError('');
                      // Open result panel immediately and close monster panel
                      setShowResult(true);
                      setShow(false);
                      setFightResult(null);
                      setVisibleLogs([]);
                      const { data } = await API.post(`/battle/fight/${selected._id || selected.id}`);
                      setFightResult(data);
                      // If backend returns updated user snapshot, sync it now
                      if (data?.userAfter) {
                        login(data.userAfter);
                      }
                    } catch (e) {
                      const code = e?.response?.status;
                      const msg = e?.response?.data?.message || e.message || 'Fight failed';
                      setFightError(code === 401 ? 'Cần đăng nhập để chiến đấu.' : msg);
                    } finally {
                      setFightLoading(false);
                    }
                  }}>
                    {fightLoading ? 'Đang chiến...' : 'Fight'}
                  </Button>
                </div>
              </div>
              {/* Battle log */}
              {fightError && (
                <Alert variant="danger" className="mt-3 mb-0">{fightError}</Alert>
              )}
              {fightResult && !showResult && (
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Badge bg={fightResult.winner === 'hero' ? 'success' : 'danger'}>
                      Kết quả: {fightResult.winner === 'hero' ? 'Thắng' : 'Thua'}
                    </Badge>
                    <div className="text-secondary small">
                      HP bạn: {fightResult.hero?.hpRemaining} / {fightResult.hero?.hp} • HP quái: {fightResult.monster?.hpRemaining} / {fightResult.monster?.hp}
                    </div>
                  </div>
                  <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: 'auto', background: '#0b0b0b' }}>
                    {(fightResult.log || []).map((ev) => (
                      <div key={ev.turn} className="small" style={{ lineHeight: 1.4 }}>
                        <span className="text-secondary">Turn {ev.turn} • </span>
                        {ev.actor === 'hero' ? 'Bạn' : 'Quái'} tấn công {ev.target === 'monster' ? 'quái' : 'bạn'}
                        {ev.evaded ? ' nhưng bị né!' : `, ${ev.crit ? 'chí mạng ' : ''}gây ${ev.damage} sát thương`}.
                        <span className="text-secondary">  (HP bạn: {ev.heroHp} • HP quái: {ev.monsterHp})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Result Panel (white theme) */}
      <Modal
        show={showResult}
        onHide={() => {
          // Close result and return to battle list screen
          setShowResult(false);
          setShow(false);
          setSelected(null);
          // keep the result for history? Clear it to reset state
          setFightResult(null);
          setVisibleLogs([]);
          if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
          }
        }}
        centered
        size="lg"
        backdrop="static"
        contentClassName="battle-result-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className={`battle-result-title ${fightResult?.winner === 'hero' ? 'victory' : 'lose'}`}>
              {fightResult ? (fightResult.winner === 'hero' ? 'Victory' : 'Lose') : ''}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Loading/error while waiting */}
          {showResult && fightLoading && !fightResult && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-dark">Đang chiến...</span>
            </div>
          )}
          {fightError && !fightResult && (
            <Alert variant="danger" className="mb-3">{fightError}</Alert>
          )}
          {fightResult && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="small text-muted">
                  Bạn: {fightResult.hero?.hpRemaining} / {fightResult.hero?.hp} • Quái: {fightResult.monster?.hpRemaining} / {fightResult.monster?.hp}
                </div>
                <Button
                  variant="outline-dark"
                  onClick={() => {
                    setShowResult(false);
                    setShow(false);
                    setSelected(null);
                    setFightResult(null);
                    setVisibleLogs([]);
                  }}
                >
                  Thoát
                </Button>
              </div>
              <div className="battle-result-log" ref={logRef}>
                {(visibleLogs || []).map((ev) => (
                  <div key={ev.turn} className="battle-result-line">
                    <span className="turn">Turn {ev.turn}:</span>
                    <span className="action">
                      {ev.actor === 'hero' ? ' Bạn' : ' Quái'} tấn công {ev.target === 'monster' ? 'quái' : 'bạn'}
                      {ev.evaded ? ' nhưng bị né!' : ''}
                    </span>
                    {!ev.evaded && (
                      <span className="damage">
                        {ev.crit ? ' chí mạng' : ''} gây {ev.damage} sát thương
                      </span>
                    )}
                    <span className="remain">  • Máu còn lại — Bạn: {ev.heroHp} • Quái: {ev.monsterHp}</span>
                  </div>
                ))}
              </div>
              {(() => {
                const total = fightResult?.log?.length || 0;
                const done = total === 0 || (visibleLogs?.length || 0) >= total;
                const isWin = fightResult?.winner === 'hero';
                if (!done) return null;
                const Rfight = parseRewards(fightResult?.rewards || {});
                const Rsel = parseRewards(selected?.rewards || {});
                const lootList = (Rfight.loot && Rfight.loot.length ? Rfight.loot : Rsel.loot) || [];
                const R = {
                  exp: Rfight.exp ?? Rsel.exp ?? 0,
                  gold: (Rfight.gold ?? 0) || (Rsel.gold ?? 0),
                  loot: lootList,
                };
                return (
                  <div className="battle-reward mt-3">
                    <div className="battle-reward-title">Reward:</div>
                    <div className="battle-reward-list">
                      {isWin ? (
                        <>
                          <div className="battle-reward-item">
                            <strong>EXP:</strong> {R.exp}
                          </div>
                          <div className="battle-reward-item d-flex align-items-center">
                            <FaCoins className="me-1"/> {R.gold}
                          </div>
                          {R.loot && R.loot.length > 0 && (
                            <div className="battle-reward-item">
                              <div className="mb-1"><strong>Loot:</strong></div>
                              <ul className="mb-0 ps-3">
                                {R.loot.map((it, i) => (
                                  <li key={i}>{String(it)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="battle-reward-item"><strong>Thua trận — không nhận được phần thưởng.</strong></div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Battle;

