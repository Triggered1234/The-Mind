
// src/app/components/Rules.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Rules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="rules">
      <div className="rules-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Înapoi
        </button>

        <h1>Regulile Jocului "The Mind"</h1>

        <div className="rules-content">
          <section>
            <h2>🎯 Obiectivul Jocului</h2>
            <p>
              "The Mind" este un joc cooperativ în care jucătorii trebuie să joace toate cărțile 
              lor în ordine crescătoare, fără a comunica între ei! Trebuie să vă sincronizați 
              mental pentru a reuși.
            </p>
          </section>

          <section>
            <h2>🃏 Cum se Joacă</h2>
            <ol>
              <li><strong>La Nivelul 1:</strong> Fiecare jucător primește 1 carte</li>
              <li><strong>La Nivelul 2:</strong> Fiecare jucător primește 2 cărți</li>
              <li><strong>La Nivelul N:</strong> Fiecare jucător primește N cărți</li>
              <li>Cărțile au valori de la 1 la 100</li>
              <li>Trebuie să jucați toate cărțile în ordine crescătoare</li>
              <li><strong>IMPORTANT:</strong> Nu aveți voie să comunicați!</li>
            </ol>
          </section>

          <section>
            <h2>❤️ Vieți și Shurikens</h2>
            <ul>
              <li><strong>Vieți:</strong> Începeți cu 3 vieți</li>
              <li>Pierdeți o viață dacă jucați o carte greșită</li>
              <li>Jocul se termină când rămâneți fără vieți</li>
              <li><strong>Shurikens:</strong> Începeți cu 1 shuriken</li>
              <li>Un shuriken elimină cartea cea mai mică din toate mâinile</li>
              <li>Câștigați shurikens bonus la nivelurile 3, 6 și 9</li>
            </ul>
          </section>

          <section>
            <h2>🏆 Condiții de Victorie</h2>
            <ul>
              <li><strong>Câștigați:</strong> Completați toate cele 12 niveluri</li>
              <li><strong>Pierdeți:</strong> Rămâneți fără vieți</li>
              <li>Pentru a trece la nivelul următor, trebuie să jucați toate cărțile corect</li>
            </ul>
          </section>

          <section>
            <h2>💡 Sfaturi</h2>
            <ul>
              <li>Concentrați-vă și simțiți ritmul celorlalți jucători</li>
              <li>Dacă aveți o carte foarte mică, jucați-o rapid</li>
              <li>Dacă aveți o carte foarte mare, așteptați</li>
              <li>Folosiți shurikens când vă blocați</li>
              <li>Răbdarea este cheia succesului!</li>
            </ul>
          </section>
        </div>
      </div>

      <style jsx>{`
        .rules {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          padding: 20px;
        }

        .rules-container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
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
          text-align: center;
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .rules-content {
          color: white;
        }

        section {
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 15px;
        }

        h2 {
          color: #C2730A;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 15px;
        }

        p, li {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        ol, ul {
          padding-left: 25px;
        }

        li {
          margin-bottom: 8px;
        }

        strong {
          color: #C2730A;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .rules-container {
            padding: 30px 20px;
          }

          h1 {
            font-size: 24px;
          }

          h2 {
            font-size: 20px;
          }

          section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};
export default Rules;