// src/app/context/GameContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
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
  setPlayer: (nickname: string) => void;
  createSession: (maxPlayers?: number) => Promise<string | null>;
  joinSession: (sessionId: string) => Promise<string | null>;
  leaveSession: () => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  startLevel: () => Promise<void>;
  playCard: (card: number) => Promise<void>;
  
  // Shuriken voting
  initiateShurikenVote: () => Promise<void>;
  castShurikenVote: (vote: boolean) => Promise<void>;
  useShuriken: () => Promise<void>; // Legacy method
  
  replayGame: () => Promise<void>;
  chooseCharacter: (sessionId: string, playerId: string, characterId: string) => Promise<void>;
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Generate a unique player ID
  const generatePlayerId = (): string => {
    return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const setPlayer = (nickname: string) => {
    const playerId = generatePlayerId();
    dispatch({ type: 'SET_PLAYER', payload: { playerId, nickname } });
  };

  const createSession = async (maxPlayers = 4): Promise<string | null> => {
    if (!state.playerId || !state.nickname) {
      handleError(new Error('Player ID and nickname are required'));
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const session = await apiService.createSession(state.playerId, state.nickname, maxPlayers);
      dispatch({ type: 'SET_SESSION', payload: session });
      return session.session_id;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinSession = async (sessionId: string): Promise<string | null> => {
    if (!state.playerId || !state.nickname) {
      handleError(new Error('Player ID and nickname are required'));
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiService.joinSession(sessionId, state.playerId, state.nickname);
      const session = await apiService.getSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
      return sessionId;
    } catch (error) {
      handleError(error);
      return null;
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

  const chooseCharacter = async (sessionId: string, playerId: string, characterId: string) => {
    try {
      await apiService.chooseCharacter(sessionId, playerId, characterId);
      // Refresh session data
      const session = await apiService.getSession(sessionId);
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

  // New shuriken voting methods
  const initiateShurikenVote = async () => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.initiateShurikenVote(state.sessionId, state.playerId);
      // Refresh game state to show voting UI
      await refreshGameState();
    } catch (error) {
      handleError(error);
    }
  };

  const castShurikenVote = async (vote: boolean) => {
    if (!state.sessionId || !state.playerId) return;

    try {
      await apiService.castShurikenVote(state.sessionId, state.playerId, vote);
      // Refresh game state
      await refreshGameState();
    } catch (error) {
      handleError(error);
    }
  };

  // Legacy shuriken method (now shows error)
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
    if (pollingIntervalRef.current) return; // Already polling

    dispatch({ type: 'SET_POLLING', payload: true });
    pollingIntervalRef.current = setInterval(async () => {
      if (state.sessionId && state.playerId) {
        try {
          await refreshGameState();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    }, 1000); // Poll every 1 second for responsive voting
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    dispatch({ type: 'SET_POLLING', payload: false });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
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
    initiateShurikenVote,
    castShurikenVote,
    useShuriken,
    replayGame,
    chooseCharacter,
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