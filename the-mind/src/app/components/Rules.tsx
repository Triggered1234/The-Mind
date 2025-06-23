// src/app/components/Rules.tsx
'use client';

import React from 'react';
import './styles/Rules.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface RulesProps {
  navigate: (page: CurrentPage) => void;
}

const Rules: React.FC<RulesProps> = ({ navigate }) => {
  return (
    <div className="rules-page">
      <div className="rules-container">
        <button 
          className="back-button"
          onClick={() => navigate('home')}
        >
          ← Înapoi
        </button>

        <div className="rules-header">
          <h1>Regulile Jocului "The Mind"</h1>
          <p>Învață să joci cel mai captivant joc cooperativ!</p>
        </div>

        <div className="rules-content">
          <section className="rule-section">
            <h2>🎯 Obiectivul Jocului</h2>
            <p>
              "The Mind" este un joc cooperativ în care jucătorii trebuie să joace toate cărțile 
              lor în ordine crescătoare, fără a comunica între ei! Singurul vostru ghid este 
              intuiția și sincronizarea perfectă cu echipa.
            </p>
          </section>

          <section className="rule-section">
            <h2>🃏 Componentele Jocului</h2>
            <ul>
              <li><strong>Cărți numerotate:</strong> de la 1 la 100</li>
              <li><strong>Vieți:</strong> Începeți cu un număr limitat de vieți</li>
              <li><strong>Shuriken:</strong> Instrumente speciale pentru ajutor</li>
              <li><strong>Niveluri:</strong> Dificultatea crește treptat</li>
            </ul>
          </section>

          <section className="rule-section">
            <h2>🎮 Cum să Joci</h2>
            <div className="steps">
              <div className="step">
                <h3>1. Primește Cărțile</h3>
                <p>La fiecare nivel, fiecare jucător primește un număr de cărți egal cu nivelul curent.</p>
              </div>
              <div className="step">
                <h3>2. Sincronizare</h3>
                <p>Fără a vorbi, jucătorii trebuie să joace cărțile în ordine crescătoare.</p>
              </div>
              <div className="step">
                <h3>3. Intuiție</h3>
                <p>Folosește-ți instinctul pentru a decide când să joci o carte!</p>
              </div>
              <div className="step">
                <h3>4. Progresare</h3>
                <p>Completează nivelul pentru a avansa la următorul.</p>
              </div>
            </div>
          </section>

          <section className="rule-section">
            <h2>⚡ Shuriken - Instrumente Speciale</h2>
            <p>
              Shuriken-urile sunt instrumente puternice care îți permit să "arunci" cea mai mică 
              carte din mâna fiecărui jucător. Folosește-le cu înțelepciune când echipa este blocată!
            </p>
          </section>

          <section className="rule-section">
            <h2>💖 Sistemul de Vieți</h2>
            <p>
              Dacă jucați o carte în ordine greșită, pierdeți o viață. Când rămâneți fără vieți, 
              jocul se termină. Colaborarea și timingul perfect sunt esențiale!
            </p>
          </section>

          <section className="rule-section">
            <h2>🏆 Câștigarea Jocului</h2>
            <p>
              Echipa câștigă atunci când completează cu succes toate nivelurile fără să rămână 
              fără vieți. Fiecare nivel completat este o victorie comună!
            </p>
          </section>

          <section className="rule-section tips">
            <h2>💡 Sfaturi pentru Succes</h2>
            <ul>
              <li>Concentrați-vă pe sincronizare, nu pe cărți</li>
              <li>Dezvoltați un ritm comun cu echipa</li>
              <li>Fiți răbdători - timpul perfect este crucial</li>
              <li>Folosiți shuriken-urile strategic</li>
              <li>Comunicați prin priviri și gesturi subtile</li>
            </ul>
          </section>
        </div>

        <div className="rules-footer">
          <button 
            className="play-button"
            onClick={() => navigate('home')}
          >
            🎮 Înapoi la Meniu Principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rules;