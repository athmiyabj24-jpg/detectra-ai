// User & Auth Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Company & Claims Types
export type ClaimCategory = 'emissions' | 'packaging' | 'materials' | 'energy' | 'general';

export interface HistoricalClaim {
  id: string;
  text: string;
  category: ClaimCategory;
  date: string;
  verified: boolean;
  certifications?: string[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  historicalClaims: HistoricalClaim[];
  sustainabilityCertifications: string[];
  createdAt: string;
  updatedAt: string;
}

// Analysis Types
export type ClassificationLabel = 'genuine' | 'misleading' | 'exaggerated' | 'false';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type InputType = 'text' | 'image' | 'video';

export interface SuspiciousPhrase {
  text: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  startIndex: number;
  endIndex: number;
}

export interface SimilarityResult {
  claimId: string;
  claimText: string;
  similarity: number;
  isContradiction: boolean;
  contradictionReason?: string;
}

export interface AnalysisResult {
  id: string;
  companyId: string;
  companyName: string;
  inputType: InputType;
  originalInput: string;
  extractedText?: string;
  classification: {
    label: ClassificationLabel;
    confidence: number;
    reasons: string[];
  };
  riskScores: {
    greenwashingRisk: number;
    companyCredibility: number;
    riskLevel: RiskLevel;
  };
  suspiciousPhrases: SuspiciousPhrase[];
  historicalComparison: {
    consistencyScore: number;
    similarities: SimilarityResult[];
    contradictions: SimilarityResult[];
  };
  sustainabilityCheck: {
    sdgAlignment: string[];
    griCompliance: 'compliant' | 'partial' | 'non-compliant';
    esgNotes: string;
  };
  createdAt: string;
  processingTime: number;
}

// Activity Tracking
export interface UserActivity {
  id: string;
  userId: string;
  action: 'login' | 'analysis' | 'view_result' | 'chat';
  details: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Processing State
export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress?: number;
}

// Store State
export interface AppState {
  auth: AuthState;
  companies: Company[];
  analyses: AnalysisResult[];
  activities: UserActivity[];
  chatMessages: ChatMessage[];
}
