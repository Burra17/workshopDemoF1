import { DriverStats, PredictionResult } from '../types';

// Configuration for Real API
// Set OPENF1_API_KEY in your environment variables to enable Live Mode
const OPENF1_API_KEY = process.env.OPENF1_API_KEY;
const OPENF1_BASE_URL = process.env.OPENF1_BASE_URL || 'https://api.openf1.org/v1';

// Driver Tiers for simulated data accuracy (Fallback Logic)
const TIERS: Record<string, number> = {
  // Tier 1: World Champion Contenders (Base score: 8-9)
  verstappen: 1, hamilton: 1, leclerc: 1, norris: 1,
  
  // Tier 2: Race Winners / Podium Regulars (Base score: 7-8)
  piastri: 2, russell: 2, sainz: 2, alonso: 2,
  
  // Tier 3: Solid Midfield (Base score: 5-7)
  gasly: 3, albon: 3, hulkenberg: 3, perez: 3, tsunoda: 3, ocon: 3,
  
  // Tier 4: Rookies / Backmarkers / Unproven (Base score: 4-6)
  stroll: 4, lawson: 4, bearman: 4, doohan: 4, antonelli: 4, bortoleto: 4
};

/**
 * APEX F1 AGENT
 * 
 * Orchestrator for Tool A (Data Fetching) and Tool B (Calculation).
 * Supports switching between Real API and Simulation based on env config.
 */
export class ApexAgent {
  
  public get isLiveMode(): boolean {
    return !!OPENF1_API_KEY;
  }

  /**
   * Tool A: Data Fetching
   * Routes to Real API if key is present, otherwise uses Simulation.
   */
  public async fetchF1Data(driverId: string, trackId: string): Promise<DriverStats> {
    if (this.isLiveMode) {
      console.log(`[APEX] Live Mode Active. Fetching ${driverId} @ ${trackId} from external API.`);
      return this.fetchRealData(driverId, trackId);
    } else {
      console.log(`[APEX] Simulation Mode. Generating synthetic telemetry for ${driverId} @ ${trackId}.`);
      return this.fetchMockData(driverId, trackId);
    }
  }

  /**
   * Implementation for Real OpenF1 API calls.
   * Customize the endpoint mapping here when connecting your specific data provider.
   */
  private async fetchRealData(driverId: string, trackId: string): Promise<DriverStats> {
    try {
      // NOTE: This is a structural template for the fetch call. 
      // Ensure your backend endpoint matches this schema or adjust the mapping below.
      const response = await fetch(`${OPENF1_BASE_URL}/analytics/driver-stats?driver=${driverId}&track=${trackId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENF1_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`External API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate and Map Response to Application Type
      return {
        driverId: data.driver_id || driverId,
        trackId: data.track_id || trackId,
        // Ensure scores are normalized to 0-10 range
        historicalScore: this.normalizeScore(data.historical_score), 
        recentFormScore: this.normalizeScore(data.current_form_score),
        totalRacesAtTrack: Number(data.races_count || 0),
        winsAtTrack: Number(data.wins || 0)
      };

    } catch (error: any) {
      console.error("Critical Failure in Data Fetching Tool:", error);
      throw new Error(`Live Data Fetch Failed: ${error.message || 'Unknown Error'}`);
    }
  }

  private normalizeScore(val: any): number {
    const num = Number(val);
    if (isNaN(num)) return 5; // Default average
    return Math.min(10, Math.max(0, num));
  }

  /**
   * Simulation Logic (Fallback)
   * Uses realistic tier-based generation when no API key is present.
   */
  private async fetchMockData(driverId: string, trackId: string): Promise<DriverStats> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const tier = TIERS[driverId] || 3;
    
    // Generate base stats based on Tier
    const baseScore = 10 - (tier * 1.5); 
    
    let historical = baseScore + (Math.random() * 2);
    let form = baseScore + (Math.random() * 2);

    // Specific Driver Buffs/Debuffs (Simulation Flavor)
    if (driverId === 'verstappen') { historical += 1; form += 1; }
    if (driverId === 'alonso') { historical += 1.5; }
    if (driverId === 'antonelli' || driverId === 'bearman') { historical -= 2; form += 1; }

    // Track Specific modifiers
    if (trackId === 'monza' && (driverId === 'leclerc' || driverId === 'hamilton')) historical += 1;
    if (trackId === 'silverstone' && (driverId === 'hamilton' || driverId === 'russell' || driverId === 'norris')) historical += 1.5;
    if (trackId === 'zandvoort' && driverId === 'verstappen') historical += 2;
    if (trackId === 'monaco' && driverId === 'leclerc') historical -= 1;
    if (trackId === 'mexico' && driverId === 'perez') historical += 1.5;

    // Clamp values between 0 and 10
    historical = Math.min(9.9, Math.max(1, historical));
    form = Math.min(9.9, Math.max(1, form));

    const variance = (Math.random() * 1.5) - 0.75;
    
    return {
      driverId,
      trackId,
      historicalScore: Number((historical + variance).toFixed(1)),
      recentFormScore: Number((form + variance).toFixed(1)),
      totalRacesAtTrack: tier === 4 ? 0 : Math.floor(Math.random() * 10) + 1,
      winsAtTrack: tier === 1 ? Math.floor(Math.random() * 3) : 0
    };
  }

  /**
   * Tool B: Prediction Logic
   * Historical Track Record: 60% weight
   * Current Driver Form: 40% weight
   */
  public calculateWinProbability(stats: DriverStats): PredictionResult {
    const HISTORICAL_WEIGHT = 0.6;
    const FORM_WEIGHT = 0.4;

    const weightedScore = (stats.historicalScore * HISTORICAL_WEIGHT) + (stats.recentFormScore * FORM_WEIGHT);
    
    // Probability Curve
    let probability = Math.pow(weightedScore, 1.8) * 1.5;
    probability = Math.min(96.5, Math.max(1.0, probability));

    return {
      probability: Number(probability.toFixed(1)),
      historicalContribution: stats.historicalScore * HISTORICAL_WEIGHT * 10,
      formContribution: stats.recentFormScore * FORM_WEIGHT * 10,
      rawStats: stats
    };
  }
}

export const apexAgent = new ApexAgent();