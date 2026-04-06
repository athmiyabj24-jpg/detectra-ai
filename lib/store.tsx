'use client';

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { 
  AppState, 
  User, 
  Company, 
  AnalysisResult, 
  UserActivity, 
  ChatMessage,
  HistoricalClaim 
} from './types';
import { SEED_COMPANIES, SEED_ANALYSES, SEED_ACTIVITIES, DEMO_USERS } from './seed-data';

const STORAGE_KEY = 'greenwashing-detector-state';

const initialState: AppState = {
  auth: { user: null, isAuthenticated: false },
  companies: SEED_COMPANIES,
  analyses: SEED_ANALYSES,
  activities: SEED_ACTIVITIES,
  chatMessages: [],
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_COMPANY'; payload: Company }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'DELETE_COMPANY'; payload: string }
  | { type: 'ADD_CLAIM'; payload: { companyId: string; claim: HistoricalClaim } }
  | { type: 'UPDATE_CLAIM'; payload: { companyId: string; claim: HistoricalClaim } }
  | { type: 'DELETE_CLAIM'; payload: { companyId: string; claimId: string } }
  | { type: 'ADD_ANALYSIS'; payload: AnalysisResult }
  | { type: 'ADD_ACTIVITY'; payload: UserActivity }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: { user: action.payload, isAuthenticated: true },
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: { user: null, isAuthenticated: false },
        chatMessages: [],
      };
    case 'ADD_COMPANY':
      return {
        ...state,
        companies: [...state.companies, action.payload],
      };
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter((c) => c.id !== action.payload),
      };
    case 'ADD_CLAIM':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.payload.companyId
            ? { ...c, historicalClaims: [...c.historicalClaims, action.payload.claim] }
            : c
        ),
      };
    case 'UPDATE_CLAIM':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.payload.companyId
            ? {
                ...c,
                historicalClaims: c.historicalClaims.map((claim) =>
                  claim.id === action.payload.claim.id ? action.payload.claim : claim
                ),
              }
            : c
        ),
      };
    case 'DELETE_CLAIM':
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.payload.companyId
            ? {
                ...c,
                historicalClaims: c.historicalClaims.filter(
                  (claim) => claim.id !== action.payload.claimId
                ),
              }
            : c
        ),
      };
    case 'ADD_ANALYSIS':
      return {
        ...state,
        analyses: [action.payload, ...state.analyses],
      };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        chatMessages: [],
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'historicalClaims'>) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  addClaim: (companyId: string, claim: Omit<HistoricalClaim, 'id'>) => void;
  updateClaim: (companyId: string, claim: HistoricalClaim) => void;
  deleteClaim: (companyId: string, claimId: string) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  addActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  getCompanyById: (id: string) => Company | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Keep auth as logged out on refresh, but load other data
        dispatch({ 
          type: 'LOAD_STATE', 
          payload: { 
            ...parsed, 
            auth: { user: null, isAuthenticated: false },
            chatMessages: [] 
          } 
        });
      }
    } catch {
      // Use initial state if localStorage is corrupted
    }
  }, []);

  // Save state to localStorage on changes (excluding auth)
  useEffect(() => {
    try {
      const toSave = {
        ...state,
        auth: { user: null, isAuthenticated: false },
        chatMessages: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage errors
    }
  }, [state.companies, state.analyses, state.activities]);

  const login = (username: string, password: string): boolean => {
    const user = DEMO_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      dispatch({
        type: 'LOGIN',
        payload: { id: user.id, username: user.username, role: user.role, createdAt: new Date().toISOString() },
      });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: `activity-${Date.now()}`,
          userId: user.id,
          action: 'login',
          details: `${user.role === 'admin' ? 'Admin' : 'User'} logged in`,
          timestamp: new Date().toISOString(),
        },
      });
      return true;
    }
    return false;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const addCompany = (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'historicalClaims'>) => {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_COMPANY',
      payload: {
        ...company,
        id: `company-${Date.now()}`,
        historicalClaims: [],
        createdAt: now,
        updatedAt: now,
      },
    });
  };

  const updateCompany = (company: Company) => {
    dispatch({
      type: 'UPDATE_COMPANY',
      payload: { ...company, updatedAt: new Date().toISOString() },
    });
  };

  const deleteCompany = (id: string) => dispatch({ type: 'DELETE_COMPANY', payload: id });

  const addClaim = (companyId: string, claim: Omit<HistoricalClaim, 'id'>) => {
    dispatch({
      type: 'ADD_CLAIM',
      payload: {
        companyId,
        claim: { ...claim, id: `claim-${Date.now()}` },
      },
    });
  };

  const updateClaim = (companyId: string, claim: HistoricalClaim) => {
    dispatch({ type: 'UPDATE_CLAIM', payload: { companyId, claim } });
  };

  const deleteClaim = (companyId: string, claimId: string) => {
    dispatch({ type: 'DELETE_CLAIM', payload: { companyId, claimId } });
  };

  const addAnalysis = (analysis: AnalysisResult) => {
    dispatch({ type: 'ADD_ANALYSIS', payload: analysis });
    if (state.auth.user) {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: `activity-${Date.now()}`,
          userId: state.auth.user.id,
          action: 'analysis',
          details: `Analyzed claim for ${analysis.companyName}`,
          timestamp: new Date().toISOString(),
          metadata: { analysisId: analysis.id, classification: analysis.classification.label },
        },
      });
    }
  };

  const addActivity = (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        ...activity,
        id: `activity-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const clearChat = () => dispatch({ type: 'CLEAR_CHAT' });

  const getCompanyById = (id: string) => state.companies.find((c) => c.id === id);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        addCompany,
        updateCompany,
        deleteCompany,
        addClaim,
        updateClaim,
        deleteClaim,
        addAnalysis,
        addActivity,
        addChatMessage,
        clearChat,
        getCompanyById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
