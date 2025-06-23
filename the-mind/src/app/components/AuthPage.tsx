// src/app/components/AuthPage.tsx
'use client';

import React, { useState } from 'react';
import { apiService } from '../services/api';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface AuthPageProps {
  navigate: (page: CurrentPage) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          throw new Error('Te rog introdu email-ul și parola');
        }

        const response = await apiService.login(formData.email, formData.password);
        
        // Store user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('themind_user_token', response.token);
          localStorage.setItem('themind_user_id', response.user_id);
          localStorage.setItem('themind_username', response.username);
        }

        setSuccess('Autentificare reușită!');
        setTimeout(() => navigate('setup'), 1500);

      } else {
        // Register
        if (!formData.username || !formData.email || !formData.password) {
          throw new Error('Te rog completează toate câmpurile');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Parolele nu se potrivesc');
        }

        if (formData.password.length < 6) {
          throw new Error('Parola trebuie să aibă cel puțin 6 caractere');
        }

        const response = await apiService.register(formData.username, formData.email, formData.password);
        
        // Store user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('themind_user_token', response.token);
          localStorage.setItem('themind_user_id', response.user_id);
          localStorage.setItem('themind_username', response.username);
        }

        setSuccess('Cont creat cu succes!');
        setTimeout(() => navigate('setup'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAuth = () => {
    // Allow guest play without registration
    navigate('setup');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-button" onClick={() => navigate('home')}>
          ← Înapoi
        </button>

        <div className="auth-header">
          <h1>The Mind</h1>
          <p>Creează un cont sau autentifică-te pentru a juca</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccess(null);
            }}
          >
            Autentificare
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccess(null);
            }}
          >
            Înregistrare
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="username">Nume utilizator:</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Alege un nume de utilizator"
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="adresa@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Parolă:</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Introdu parola"
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmă parola:</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmă parola"
                required={!isLogin}
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Se procesează...' : (isLogin ? 'Autentifică-te' : 'Creează cont')}
          </button>
        </form>

        <div className="auth-footer">
          <div className="divider">
            <span>sau</span>
          </div>
          
          <button 
            className="guest-button"
            onClick={handleSkipAuth}
          >
            🎮 Joacă ca Invitat (fără cont)
          </button>
          
          <p className="auth-note">
            {isLogin 
              ? "Nu ai cont? Apasă pe 'Înregistrare' mai sus."
              : "Ai deja cont? Apasă pe 'Autentificare' mai sus."
            }
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h1 {
          color: #C2730A;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .auth-header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .auth-tabs {
          display: flex;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 4px;
        }

        .tab {
          flex: 1;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .tab.active {
          background: rgba(194, 115, 10, 0.3);
          color: white;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .input-group input {
          padding: 12px 15px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #C2730A;
          background: rgba(255, 255, 255, 0.15);
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .auth-button {
          background: linear-gradient(45deg, #C2730A, #824728);
          border: none;
          color: white;
          padding: 15px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #D68A0B, #A05832);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(194, 115, 10, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .guest-button {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .guest-button:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.1);
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          color: #ff6b6b;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          font-size: 14px;
        }

        .success-message {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid rgba(0, 255, 0, 0.5);
          color: #4CAF50;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          font-size: 14px;
        }

        .auth-footer {
          text-align: center;
        }

        .divider {
          position: relative;
          margin: 20px 0;
          text-align: center;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
        }

        .divider span {
          background: linear-gradient(180deg, #00000D 15.17%, #0E182F 40.5%, #1C304E 54.27%, #07182B 73.38%, #22120D 93.08%);
          color: rgba(255, 255, 255, 0.6);
          padding: 0 15px;
          font-size: 12px;
        }

        .auth-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin-top: 15px;
        }

        @media (max-width: 600px) {
          .auth-container {
            padding: 30px 20px;
          }

          .auth-header h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;