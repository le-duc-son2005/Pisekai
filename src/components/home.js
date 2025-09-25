import React, { useEffect } from 'react';
import '../style/home.css';
import { useNavigate } from "react-router-dom";
import { startRain, stopRain } from "../Utils.js";

const Home = () => {
  const navigate = useNavigate();
   useEffect(() => {
    const container = document.body; 
    startRain(container);

    return () => {
      stopRain();
    };
  }, []);


  return (
    <div className="home-page">
      <div className="rain"></div>
      <div className="container-fluid home-container" >
        <h1 className="title">PiseKai</h1>
        <button className="start-button" onClick={() => navigate("/weapons")}>Get Start</button>
        <div className="description">
          Khám phá thế giới pixel đầy màu sắc với những cuộc phiêu lưu hấp dẫn! Hãy sẵn sàng để chiến đấu, thu thập và trở thành huyền thoại trong Pixel Adventure.
        </div>
      </div>
    </div>
  );
};

export default Home;