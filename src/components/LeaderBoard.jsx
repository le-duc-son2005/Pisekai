import React, { useEffect, useState } from "react";
import "../style/Leaderboard.css";
import  { topPlayers } from "../share/data";
const sampleData = [
  { rank: 1, name: "Alysia", class: "Mage", level: 120, avatar: require("../asserts/Battlepass-Iconic.png") },
  { rank: 2, name: "Ragnar", class: "Fighter", level: 115, avatar: "/fighters/fighter1.png" },
  { rank: 3, name: "Luna", class: "Healer", level: 110, avatar: "/healers/healer1.png" },
  { rank: 4, name: "Kael", class: "Archer", level: 108, avatar: "/archers/archer1.png" },
  { rank: 5, name: "Taro", class: "Mage", level: 105, avatar: "/mages/mage2.png" },
];

export default function Leaderboard() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Top Adventurers of PiSekai</h2>

      <div className={`table-container ${loaded ? "show" : ""}`}>
        {sampleData.map((p) => (
          <div key={p.rank} className={`row-entry top-${p.rank <= 3 ? p.rank : "x"}`}>
            <div className="rank">#{p.rank}</div>
            <img src={p.avatar} alt={p.name} className="avatar" />
            <div className="name">{p.name}</div>
            <div className="class">{p.class}</div>
            <div className="level">{p.level}</div>
          </div>
        ))}
      </div>

      <button className="view-rank-btn">View My Rank</button>
    </div>
  );
}
