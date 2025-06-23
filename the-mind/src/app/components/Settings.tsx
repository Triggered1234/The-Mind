// src/app/components/Settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import './styles/Settings.css';

type CurrentPage = 'home' | 'auth' | 'setup' | 'create' | 'join' | 'lobby' | 'game' | 'rules' | 'settings';

interface SettingsProps {
  navigate: (page: CurrentPage) => void;
}

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notifications: boolean;
  autoSave: boolean;
  theme: 'dark' | 'light';
  language: 'ro' | 'en';
}

const Settings: React.FC<SettingsProps> = ({ navigate }) => {
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    notifications: true,
    autoSave: true,
    theme: 'dark',
    language: 'ro'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('themind_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, []);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themind_settings', JSON.stringify(settings));
      setHasUnsavedChanges(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings: GameSettings = {
      soundEnabled: true,
      musicEnabled: true,
      notifications: true,
      autoSave: true,
      theme: 'dark',
      language: 'ro'
    };
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const clearUserData = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        'Sigur vrei să ștergi toate datele? Aceasta va include progresul salvat și setările.'
      );
      
      if (confirmed) {
        localStorage.removeItem('themind_user_token');
        localStorage.removeItem('themind_user_id');
        localStorage.removeItem('themind_username');
        localStorage.removeItem('themind_is_guest');
        localStorage.removeItem('themind_settings');
        
        alert('Datele au fost șterse cu succes!');
        navigate('home');
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <button 
          className="back-button"
          onClick={() => navigate('home')}
        >
          ← Înapoi
        </button>

        <div className="settings-header">
          <h1>Setări Joc</h1>
          <p>Personalizează experiența ta de joc</p>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h2>🔊 Audio</h2>
            <div className="setting-item">
              <label>
                <span>Sunete de joc</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <span>Muzică de fundal</span>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h2>🔔 Notificări</h2>
            <div className="setting-item">
              <label>
                <span>Notificări în joc</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="setting-item">
              <label>
                <span>Salvare automată</span>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h2>🎨 Interfață</h2>
            <div className="setting-item">
              <label>Temă:</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="setting-select"
              >
                <option value="dark">Întunecată</option>
                <option value="light">Luminoasă</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Limbă:</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="setting-select"
              >
                <option value="ro">Română</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          <section className="settings-section danger-zone">
            <h2>⚠️ Zona Periculoasă</h2>
            <div className="setting-item">
              <button 
                className="reset-button"
                onClick={resetSettings}
              >
                🔄 Resetează Setările
              </button>
              <p className="setting-description">
                Resetează toate setările la valorile implicite
              </p>
            </div>
            <div className="setting-item">
              <button 
                className="clear-data-button"
                onClick={clearUserData}
              >
                🗑️ Șterge Toate Datele
              </button>
              <p className="setting-description">
                Șterge complet contul și progresul salvat (acțiune ireversibilă)
              </p>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button 
            className="save-button"
            onClick={saveSettings}
            disabled={!hasUnsavedChanges}
          >
            💾 Salvează Setările
          </button>
          {hasUnsavedChanges && (
            <p className="unsaved-notice">
              Ai modificări nesalvate
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;