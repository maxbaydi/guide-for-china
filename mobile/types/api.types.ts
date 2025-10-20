/**
 * API Types для HanGuide Mobile App
 */

export interface Character {
  id: string;
  simplified: string;
  traditional?: string;
  pinyin: string;
  hskLevel?: number;
  frequency?: number;
  definitions: Definition[];
  examples?: Example[];
  similarWords?: SimilarWord[];
  reverseTranslations?: ReverseTranslation[];
  createdAt?: string;
}

export interface Definition {
  id: string;
  translation: string;
  partOfSpeech?: string;
  context?: string;
  order: number;
}

export interface Example {
  id: string;
  chinese: string;
  pinyin?: string;
  russian: string;
}

export interface SimilarWord {
  id: string;
  simplified: string;
  pinyin: string;
  mainTranslation: string;
}

export interface ReverseTranslation {
  russian: string;
  chinese: string;
  pinyin?: string;
}

export interface Phrase {
  id: string;
  chinese: string;
  pinyin: string;
  translation: string;
  hskLevel?: number;
}

export interface AnalyzedCharacter {
  character: string;
  pinyin: string;
  translation: string;
  characterId?: string;
}

export interface CharacterAnalysis {
  position: number;
  word: string;  // Изменено с character на word для пословного анализа
  details?: {
    id: string;
    simplified: string;
    pinyin?: string;
    definitions: Array<{
      translation: string;
      partOfSpeech?: string;
    }>;
  };
}

export interface AnalysisResult {
  text: string;
  characters: AnalyzedCharacter[];
}

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  subscriptionTier?: string;
  dailyRequestsUsed: number;
  dailyRequestsLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  username?: string;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  itemCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  characterId: string;
  character: Character;
  notes?: string;
  createdAt: string;
}

// Statistics types
export interface UserStatistics {
  searchCount: number;
  analysisCount: number;
  charactersLearned: number;
  studyTimeMinutes: number;
  lastActiveAt: string;
  createdAt: string;
  collectionsCount: number;
  totalCharactersInCollections: number;
}

// Subscription types
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

