import React, { useContext } from "react";
import { Spinner, Alert } from "react-bootstrap";
import "../style/Leaderboard.css";
import { AuthContext } from "../../../context/AuthContext";
import RequireLogin from "../../../subsystem/auth/RequireLogin.jsx";
import useLeaderboard from "../hook/useLeaderboard";

const FALLBACK_AVATAR = "/image/avatar/avatar-0.jpg";

export default function Leaderboard() {
  const { user } = useContext(AuthContext);
  const { players, loading, error } = useLeaderboard(20);

  if (!user) {
    return <RequireLogin title="Please login to view Leaderboard" />;
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Top Adventurers of PiSekai</h2>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mx-3">
          {error}
        </Alert>
      )}

      {!loading && !error && players.length === 0 && (
        <p className="text-center text-muted my-4">No players found.</p>
      )}

      {!loading && !error && players.length > 0 && (
        <div className="table-container show">
          {players.map((p) => (
            <div
              key={p.userId}
              className={`row-entry top-${p.rank <= 3 ? p.rank : "x"}${
                user?._id === p.userId ? " my-row" : ""
              }`}
            >
              <div className="rank">#{p.rank}</div>
              <img
                src={p.avatar || FALLBACK_AVATAR}
                alt={p.username}
                className="avatar"
                onError={(e) => { e.target.src = FALLBACK_AVATAR; }}
              />
              <div className="name">{p.username}</div>
              <div className="class">{p.class}</div>
              <div className="level">Lv. {p.level}</div>
            </div>
          ))}
        </div>
      )}

      <button className="view-rank-btn">View My Rank</button>
    </div>
  );
}
