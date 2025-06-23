// src/app/context/GameContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { GameState, Session, Player, apiService } from '../services/api';

interface GameContextState {
  // User & Session
  playerId: string | null;
  nickname: string | null;
  sessionId: string | null;
  session: Session | null;
  
  // Game State
  gameState: GameState | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Polling
  isPolling: boolean;
}

type GameAction =
  | { type: 'SET_PLAYER'; payload: { playerId: string; nickname: string } }
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_POLLING'; payload: boolean }
  | { type: 'CLEAR_SESSION' }
  | { type: 'RESET' };

const initialState: GameContextState = {
  playerId: null,
  nickname: null,
  sessionId: null,
  session: null,
  gameState: null,
  isLoading: false,
  error: null,
  isConnected: false,
  isPolling: false,
};

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_PLAYER':
      return {
        ...state,
        playerId: action.payload.playerId,
        nickname: action.payload.nickname,
      };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        sessionId: action.payload.session_id,
        isConnected: true,
      };
    case 'SET_GAME_STATE':
      return {
        ...state,
        gameState: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'SET_POLLING':
      return {
        ...state,
        isPolling: action.payload,
      };
    case 'CLEAR_SESSION':
      return {
        ...state,
        sessionId: null,
        session: null,
        gameState: null,
        isConnected: false,
      };
    case 'RESET':
      return {
        ...initialState,
        playerId: state.playerId,
        nickname: state.nickname,
      };
    default:
      return state;
  }
}

interface GameContextType extends GameContextState {
  // Actions
  setPlayer: (playerId: string, nickname: string) => void;
  createSession: (maxPlayers?: number) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  startLevel: () => Promise<void>;
  playCard: (card: number) => Promise<void>;
  useShuriken: () => Promise<void>;
  replayGame: () => Promise<void>;
  refreshGameState: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isClient, setIsClient] = useState(false);
  
  let pollingInterval: NodeJS.Timeout | null = null;

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved player data only on client side
  useEffect(() => {
    if (!isClient) return;
    
    if (!state.playerId) {
      try {
        const savedPlayerId = localStorage.getItem('themind_player_id');
        const savedNickname = localStorage.getItem('themind_nickname');
        
        if (savedPlayerId && savedNickname) {
          dispatch({ type: 'SET_PLAYER', payload: { playerId: savedPlayerId, nickname: savedNickname } });
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error);
      }
    }
  }, [isClient, state.playerId]);

  // Save player info to localStorage (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    if (state.playerId && state.nickname) {
      try {
        localStorage.setItem('themind_player_id', state.playerId);
        localStorage.setItem('themind_nickname', state.nickname);
      } catch (error) {
        console.warn('Could not save to localStorage:', error);
      }
    }
  }, [isClient, state.playerId, state.nickname]);

  const handleError = (error: any) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    dispatch({ type: 'SET_ERROR', payload: message });
    console.error('Game error:', error);
  };

  const setPlayer = (playerId: string, nickname: string) => {
    dispatch({ type: 'SET_PLAYER', payload: { playerId, nickname } });
  };

  const createSession = async (maxPlayers = 4) => {
    if (!state.playerId || !state.nickname) {
      handleError(new Error('Player ID and nickname are required'));
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const session = await apiService.createSession(state.playerId, state.nickname, maxPlayers);
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!state.playerId || !state.nickname) {
      handleError(new Error('Player ID and nickname are required'));
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiService.joinSession(sessionId, state.playerId, state.nickname);
      const session = await apiService.getSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveSession = async () => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.leaveSession(state.sessionId, state.playerId);
      dispatch({ type: 'CLEAR_SESSION' });
    } catch (error) {
      handleError(error);
    }
  };

  const toggleReady = async () => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.toggleReady(state.sessionId, state.playerId);
      // Refresh session data
      const session = await apiService.getSession(state.sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error) {
      handleError(error);
    }
  };

  const startGame = async () => {
    if (!state.sessionId) return;

    try {
      await apiService.startGame(state.sessionId);
      // Start polling for game state updates
      startPolling();
    } catch (error) {
      handleError(error);
    }
  };

  const startLevel = async () => {
    if (!state.sessionId) return;

    try {
      await apiService.startLevel(state.sessionId);
      // Refresh game state
      await refreshGameState();
    } catch (error) {
      handleError(error);
    }
  };

  const playCard = async (card: number) => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.playCard(state.sessionId, state.playerId, card);
      // Refresh game state immediately
      await refreshGameState();
    } catch (error) {
      handleError(error);
    }
  };

  const useShuriken = async () => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.useShuriken(state.sessionId, state.playerId);
      // Refresh game state
      await refreshGameState();
    } catch (error) {
      handleError(error);
    }
  };

  const replayGame = async () => {
    if (!state.sessionId) return;

    try {
      await apiService.replayGame(state.sessionId);
      dispatch({ type: 'RESET' });
    } catch (error) {
      handleError(error);
    }
  };

  const refreshGameState = async () => {
    if (!state.sessionId || !state.playerId) return;

    try {
      const gameState = await apiService.getGameState(state.sessionId, state.playerId);
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });
      
      // Also update session info
      const session = await apiService.getSession(state.sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error) {
      handleError(error);
    }
  };

  const startPolling = () => {
    if (pollingInterval) return; // Already polling

    dispatch({ type: 'SET_POLLING', payload: true });
    pollingInterval = setInterval(async () => {
      if (state.sessionId && state.playerId) {
        try {
          await refreshGameState();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    dispatch({ type: 'SET_POLLING', payload: false });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const contextValue: GameContextType = {
    ...state,
    setPlayer,
    createSession,
    joinSession,
    leaveSession,
    toggleReady,
    startGame,
    startLevel,
    playCard,
    useShuriken,
    replayGame,
    refreshGameState,
    startPolling,
    stopPolling,
    clearError,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}