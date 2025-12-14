import { DriverStats, PredictionResult } from '../types';

// Configuration for Direct URL Access
const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

// Driver Tiers for simulated data accuracy (Fallback Logic for when specific endpoints aren't available)
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
 * Now configured to use direct URL fetching without API keys.
 */
export class ApexAgent {
  
  public get isLiveMode(): boolean {
    return true; // Always active since we are using the public Direct URL
  }

  /**
   * Tool A: Data Fetching
   * Attempts to fetch real data from the Direct URL.
   */
  public async fetchF1Data(driverId: string, trackId: string): Promise<DriverStats> {
    console.log(`[APEX] Live Mode Active. Connecting to Direct URL: ${OPENF1_BASE_URL}`);
    return this.fetchRealData(driverId, trackId);
  }

  /**
   * Implementation for Real OpenF1 API calls.
   * Updates driver data using the session with the highest session_key (latest race).
   */
  private async fetchRealData(driverId: string, trackId: string): Promise<DriverStats> {
    try {
      // 1. Fetch all sessions to find the latest Race
      // We use 'session_type=Race' to get meaningful form data from main events
      console.log("[APEX] Fetching session registry...");
      const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?session_type=Race`);
      
      if (!sessionsResponse.ok) {
        throw new Error(`OpenF1 Session Registry Error: ${sessionsResponse.status}`);
      }
      
      const sessions = await sessionsResponse.json();
      if (!sessions || sessions.length === 0) {
        throw new Error("No race sessions found in OpenF1 registry.");
      }

      // Sort by session_key descending to get the absolute latest session
      const latestSession = sessions.sort((a: any, b: any) => b.session_key - a.session_key)[0];
      const latestSessionKey = latestSession.session_key;

      console.log(`[APEX] Latest Session Identified: ${latestSessionKey} - ${latestSession.location} (${latestSession.year})`);

      // 2. Fetch Driver Details for this session to get their specific driver_number
      // We capitalize the ID to match OpenF1's last_name format (e.g. 'verstappen' -> 'Verstappen')
      const formattedName = driverId.charAt(0).toUpperCase() + driverId.slice(1);
      
      const driverResponse = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${latestSessionKey}&last_name=${formattedName}`);
      const driverDataList = await driverResponse.json();

      let recentFormScore = 0;
      let driverFoundInLatest = false;

      // 3. Calculate Recent Form based on the latest race result
      if (driverDataList && driverDataList.length > 0) {
        const driverInfo = driverDataList[0];
        const driverNumber = driverInfo.driver_number;
        driverFoundInLatest = true;

        // Fetch Position data for this driver in the latest session
        // The API returns a stream of position updates; the last one is the finishing position.
        const positionResponse = await fetch(`${OPENF1_BASE_URL}/position?session_key=${latestSessionKey}&driver_number=${driverNumber}`);
        const positions = await positionResponse.json();

        if (positions && positions.length > 0) {
           const finalPosition = positions[positions.length - 1].position;
           console.log(`[APEX] ${formattedName} finished P${finalPosition} in the latest race.`);
           
           // Calculate Form Score: P1 = 10, P20 = ~1. 
           // Formula: 10 - ((Position - 1) * 0.45)
           // P1 -> 10, P5 -> 8.2, P10 -> 5.95, P20 -> 1.45
           recentFormScore = Math.max(1, 10 - ((finalPosition - 1) * 0.45));
        } else {
           // Driver exists but no position data (DNF or issue), fallback to average
           recentFormScore = 5;
        }
      } else {
        console.warn(`[APEX] Driver ${formattedName} not found in session ${latestSessionKey}. Using Tier fallback.`);
        // Fallback for drivers not in the latest race (reserves, etc.)
        const tier = TIERS[driverId] || 3;
        recentFormScore = 10 - (tier * 1.5);
      }

      // 4. Determine Historical Score
      // While we have real form data, fetching historical data for the specific *selected* track 
      // requires searching years of sessions. For responsiveness, we stick to the Tier model 
      // for historical stats but add variance.
      const tier = TIERS[driverId] || 3;
      let historicalScore = 10 - (tier * 1.5);
      
      // Add track-specific adjustments (Simulated logic mixed with real form)
      if (trackId === 'monza' && (driverId === 'leclerc' || driverId === 'hamilton')) historicalScore += 1;
      if (trackId === 'zandvoort' && driverId === 'verstappen') historicalScore += 1.5;
      
      // Clamp scores
      historicalScore = Math.min(9.8, Math.max(2, historicalScore));
      recentFormScore = Math.min(9.9, Math.max(1, recentFormScore));

      return {
        driverId: driverId,
        trackId: trackId,
        historicalScore: Number(historicalScore.toFixed(1)),
        recentFormScore: Number(recentFormScore.toFixed(1)),
        totalRacesAtTrack: 0, // Not fetching historical count to save API calls
        winsAtTrack: 0
      };

    } catch (error: any) {
      console.error("Critical Failure in Data Fetching Tool:", error);
      console.log("[APEX] Network failure. Falling back to internal simulation model.");
      return this.fetchMockData(driverId, trackId);
    }
  }

  /**
   * Fallback for standard OpenF1 public API connectivity check.
   * Checks if we can reach the /sessions endpoint.
   */
  private async fetchRawOpenF1Fallback(driverId: string, trackId: string): Promise<DriverStats> {
     const response = await fetch(`${OPENF1_BASE_URL}/sessions?limit=1`);
     if(response.ok) {
        return this.fetchMockData(driverId, trackId);
     }
     throw new Error("Could not connect to OpenF1 fallback endpoint.");
  }

  private normalizeScore(val: any): number {
    const num = Number(val);
    if (isNaN(num)) return 5; 
    return Math.min(10, Math.max(0, num));
  }

  /**
   * Simulation Logic (Internal Model)
   * Used when raw data processing isn't available on the endpoint.
   */
  private async fetchMockData(driverId: string, trackId: string): Promise<DriverStats> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));

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