export type AppTab = 'landing' | 'auth' | 'explore' | 'seasons' | 'profile';

export interface UserProfile {
  email: string;
  loggedIn: boolean;
  explorerName: string;
  level: string;
  currentSeason: string;
}

export interface StoryNode {
  title: string;
  text: string;
  imageUrl: string;
  choices: string[];
  cycle: string;
  depth: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  cycle: string;
  depth: string;
  description: string;
  imageUrl: string;
  date: string;
}

export interface SavedDiscovery {
  id: string;
  title: string;
  imageUrl: string;
  bookmarked: boolean;
  cycle?: string;
  depth?: string;
  description?: string;
}

export interface SeasonExhibition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'current' | 'archiving' | 'coming_soon' | 'active';
  bgImage: string;
  isLocked: boolean;
}
