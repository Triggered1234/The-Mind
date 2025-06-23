// src/app/components/Settings.tsx
'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="settings">
      <div className="settings-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Înapoi
        </button>

        <h1>Setări</h1>

        <div className="settings-content">
          <div className="coming-soon">
            <h2>🚧 În curând...</h2>
            <p>Setările vor fi disponibile în versiunile viitoare!</p>
            <ul>
              <li>Setări audio</li>
              <li>Notificări</li>
              <li>Temă vizuală</li>
              <li>Preferințe de joc</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .settings-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 15px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        h1 {
          color: white;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .coming-soon {
          background: rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 15px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
        }

        .coming-soon h2 {
          color: #C2730A;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .coming-soon p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin-bottom: 25px;
        }

        .coming-soon ul {
          color: rgba(255, 255, 255, 0.7);
          text-align: left;
          max-width: 300px;
          margin: 0 auto;
        }

        .coming-soon li {
          margin-bottom: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
export default Settings;