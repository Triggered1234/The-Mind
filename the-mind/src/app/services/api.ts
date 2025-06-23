// src/app/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Player {
  player_id: string;
  nickname: string;
  character_id?: string;
  is_ready?: boolean;
  cards_remaining?: number;
}

export interface GameState {
  session_id: string;
  level: number;
  lives: number;
  shurikens: number;
  status: string;
  my_hand: number[];
  cards_played: Array<{
    card: number;
    player_id: string;
    timestamp: string;
  }>;
  players: Player[];
  next_expected_card?: number;
  is_level_complete: boolean;
  is_game_over: boolean;
}

export interface Session {
  session_id: string;
  max_players: number;
  status: string;
  level: number;
  lives: number;
  shurikens: number;
  players: Player[];
  cards_played_count: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Session Management
  async createSession(playerId: string, nickname: string, maxPlayers: number = 4): Promise<Session> {
    return this.request(`/api/sessions?player_id=${playerId}&nickname=${nickname}&max_players=${maxPlayers}`, {
      method: 'POST',
    });
  }

  async joinSession(sessionId: string, playerId: string, nickname: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/players`, {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, nickname }),
    });
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request(`/api/sessions/${sessionId}`);
  }

  async getPlayers(sessionId: string): Promise<{ players: Player[] }> {
    return this.request(`/api/sessions/${sessionId}/players`);
  }

  async leaveSession(sessionId: string, playerId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/players`, {
      method: 'DELETE',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  // Game Preparation
  async chooseCharacter(sessionId: string, playerId: string, characterId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, character_id: characterId }),
    });
  }

  async toggleReady(sessionId: string, playerId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/ready`, {
      method: 'PATCH',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async startGame(sessionId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/start`, {
      method: 'POST',
    });
  }

  // Gameplay
  async startLevel(sessionId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/level/start`, {
      method: 'POST',
    });
  }

  async getGameState(sessionId: string, playerId: string): Promise<GameState> {
    return this.request(`/api/sessions/${sessionId}/state?player_id=${playerId}`);
  }

  async playCard(sessionId: string, playerId: string, card: number): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, card }),
    });
  }

  async useShuriken(sessionId: string, playerId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/shuriken`, {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async getCardsPlayed(sessionId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/cards`);
  }

  async replayGame(sessionId: string): Promise<any> {
    return this.request(`/api/sessions/${sessionId}/replay`, {
      method: 'POST',
    });
  }

  // Authentication
  async register(username: string, email: string, password: string): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email: string, password: string): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.request(`/auth/users/${userId}`);
  }
}

export const apiService = new ApiService();