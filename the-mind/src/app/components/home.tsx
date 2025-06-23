import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homepage.css';

type Props = {};

function Home({}: Props) {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Logo */}
      <div className="logo-the-mind"></div>
      <div className="ellipse-5"></div>
      {/* Buttons in a circular layout */}
      <div className="buttons-container">
        <div className="play" onClick={() => navigate("/play")}>JOACĂ</div>
        <div className="online" onClick={() => navigate("/online")}>ONLINE</div>
        <div className="rules" onClick={() => navigate("/rules")}>REGULI</div>
        <div className="settings" onClick={() => navigate("/settings")}>SETĂRI</div>
        <div className="achievements" onClick={() => navigate("/achievements")}>REALIZĂRI</div>
      </div>
    </div>
  );
}

export default Home;