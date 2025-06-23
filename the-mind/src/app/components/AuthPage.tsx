// src/app/components/AuthPage.tsx
'use client';

import React, { useState } from 'react';
import { apiService } from '../services/api';
import './styles/AuthPage.css';

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
      setError(err.message || 'A apărut o eroare. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAuth = () => {
    // Generate a temporary guest user
    const guestId = `guest_${Date.now()}`;
    const guestName = `Invitat_${Math.random().toString(36).substring(2, 6)}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('themind_user_id', guestId);
      localStorage.setItem('themind_username', guestName);
      localStorage.setItem('themind_is_guest', 'true');
    }
    
    navigate('setup');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button 
          className="back-button"
          onClick={() => navigate('home')}
        >
          ← Înapoi
        </button>

        <div className="auth-header">
          <h1>Cont Jucător</h1>
          <p>Creează un cont sau autentifică-te pentru a salva progresul</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Autentificare
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Înregistrare
          </button>
        </div>

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

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="username">Nume de utilizator</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Introdu numele de utilizator"
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Introdu adresa de email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Parola</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Introdu parola"
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmă parola</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmă parola"
                required={!isLogin}
              />
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
    </div>
  );
};

export default AuthPage;