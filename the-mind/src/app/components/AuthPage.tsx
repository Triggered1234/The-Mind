// src/app/components/AuthPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './styles/AuthPage.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface AuthPageProps {
  navigate: (page: CurrentPage) => void;
}

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('themind_user_token');
        const userId = localStorage.getItem('themind_user_id');
        
        if (token && userId) {
          try {
            // Fetch user profile to verify token is still valid
            const profile = await apiService.getUserProfile(userId);
            setUserProfile(profile);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear localStorage
            localStorage.removeItem('themind_user_token');
            localStorage.removeItem('themind_user_id');
            localStorage.removeItem('themind_username');
            localStorage.removeItem('themind_is_guest');
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoadingProfile(false);
    };

    checkAuthStatus();
  }, []);

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
    // Set guest mode
    if (typeof window !== 'undefined') {
      localStorage.setItem('themind_is_guest', 'true');
      localStorage.removeItem('themind_user_token');
      localStorage.removeItem('themind_user_id');
      localStorage.removeItem('themind_username');
    }
    navigate('setup');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('themind_user_token');
      localStorage.removeItem('themind_user_id');
      localStorage.removeItem('themind_username');
      localStorage.removeItem('themind_is_guest');
    }
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while checking auth status
  if (isLoadingProfile) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-spinner">
            <p>Se încarcă...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show profile page if authenticated
  if (isAuthenticated && userProfile) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <button 
            className="back-button"
            onClick={() => navigate('home')}
          >
            ← Înapoi
          </button>

          <div className="profile-header">
            <h1>👤 Profilul Meu</h1>
            <p>Informațiile contului tău</p>
          </div>

          <div className="profile-content">
            <div className="profile-info">
              <div className="info-item">
                <label>Nume de utilizator:</label>
                <span>{userProfile.username}</span>
              </div>
              
              <div className="info-item">
                <label>Email:</label>
                <span>{userProfile.email}</span>
              </div>
              
              <div className="info-item">
                <label>Membru din:</label>
                <span>{formatDate(userProfile.created_at)}</span>
              </div>
              
              <div className="info-item">
                <label>ID Utilizator:</label>
                <span className="user-id">{userProfile.user_id.slice(-8)}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="play-button"
                onClick={() => navigate('setup')}
              >
                🎮 Începe să Joci
              </button>
              
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                🚪 Deconectează-te
              </button>
            </div>
          </div>

          <div className="profile-stats">
            <h3>📊 Statistici</h3>
            <p className="coming-soon">
              Statisticile de joc vor fi disponibile în curând!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
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
          <h1>🔐 Autentificare</h1>
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