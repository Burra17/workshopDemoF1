export interface Driver {
  id: string;
  name: string;
  team: string;
  image: string;
}

export interface Track {
  id: string;
  name: string;
  location: string;
  image: string;
}

export interface DriverStats {
  driverId: string;
  trackId: string;
  historicalScore: number; // 0-10 scale
  recentFormScore: number; // 0-10 scale
  totalRacesAtTrack: number;
  winsAtTrack: number;
}

export interface PredictionResult {
  probability: number;
  historicalContribution: number;
  formContribution: number;
  rawStats: DriverStats;
  aiAnalysis?: string;
}

export enum AgentState {
  IDLE = 'IDLE',
  FETCHING_DATA = 'FETCHING_DATA', // Tool A
  CALCULATING = 'CALCULATING',     // Tool B
  GENERATING_INSIGHTS = 'GENERATING_INSIGHTS', // Gemini
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}