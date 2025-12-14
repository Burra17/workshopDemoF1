import { Driver, DriverStats, PredictionResult } from '../types';

// Configuration for Direct URL Access
const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

// Driver Tiers for partial data fallback (Only used if connection works but driver is missing from session)
const TIERS: Record<string, number> = {
  // Tier 1: World Champion Contenders
  verstappen: 1, hamilton: 1, leclerc: 1, norris: 1,
  // Tier 2: Race Winners / Podium Regulars
  piastri: 2, russell: 2, sainz: 2, alonso: 2,
  // Tier 3: Solid Midfield
  gasly: 3, albon: 3, hulkenberg: 3, perez: 3, tsunoda: 3, ocon: 3,
  // Tier 4: Rookies / Backmarkers
  stroll: 4, lawson: 4, bearman: 4, doohan: 4, antonelli: 4, bortoleto: 4
};

/**
 * APEX F1 AGENT
 * 
 * Orchestrator for Tool A (Data Fetching) and Tool B (Calculation).
 * STRICT MODE: Mock data fallback disabled to verify API connectivity.
 */
export class ApexAgent {
  
  public get isLiveMode(): boolean {
    return true;
  }

  /**
   * Fetches the list of drivers from the latest available Race session.
   * This ensures the UI is always synced with the actual data source.
   */
  public async getDrivers(): Promise<Driver[]> {
    try {
      console.log("[APEX] Fetching latest grid configuration...");
      
      // 1. Get the latest session
      const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?session_type=Race`);
      if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions");
      
      const sessions = await sessionsResponse.json();
      const latestSession = sessions.sort((a: any, b: any) => b.session_key - a.session_key)[0];
      
      if (!latestSession) throw new Error("No sessions found");
      
      // 2. Get drivers for that session
      const driversResponse = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${latestSession.session_key}`);
      if (!driversResponse.ok) throw new Error("Failed to fetch drivers");
      
      const driversData = await driversResponse.json();
      
      // 3. Map and Deduplicate (Drivers can appear multiple times in the stream)
      const uniqueDrivers = new Map<string, Driver>();
      
      driversData.forEach((d: any) => {
        // Ensure we have a valid last name to use as ID
        if (d.last_name && d.driver_number && !uniqueDrivers.has(d.last_name)) {
          uniqueDrivers.set(d.last_name, {
            id: d.last_name.toLowerCase(), // Use lowercase last name as ID for consistency
            name: d.full_name || `${d.first_name} ${d.last_name}`,
            team: d.team_name || "Unknown Team",
            // Use API headshot or a fallback UI avatar
            image: d.headshot_url || `https://ui-avatars.com/api/?name=${d.first_name}+${d.last_name}&background=0f172a&color=fff`
          });
        }
      });

      // Convert Map to Array and sort by Team Name for clean UI
      const sortedDrivers = Array.from(uniqueDrivers.values()).sort((a, b) => a.team.localeCompare(b.team));
      
      console.log(`[APEX] Grid loaded: ${sortedDrivers.length} drivers found in session ${latestSession.session_key}`);
      return sortedDrivers;

    } catch (error) {
      console.error("[APEX] Error loading grid:", error);
      return [];
    }
  }

  /**
   * Tool A: Data Fetching
   * Attempts to fetch real data from the Direct URL.
   */
  public async fetchF1Data(driverId: string, trackId: string): Promise<DriverStats> {
    console.log(`[APEX] Connecting to Direct URL: ${OPENF1_BASE_URL}`);
    return this.fetchRealData(driverId, trackId);
  }

  /**
   * Implementation for Real OpenF1 API calls.
   * Updates driver data using the session with the highest session_key (latest race).
   */
  private async fetchRealData(driverId: string, trackId: string): Promise<DriverStats> {
    try {
      // 1. Fetch all sessions to find the latest Race
      console.log("[APEX] Fetching session registry...");
      const sessionsResponse = await fetch(`${OPENF1_BASE_URL}/sessions?session_type=Race`);
      
      if (!sessionsResponse.ok) {
        throw new Error(`OpenF1 Session Registry Error: ${sessionsResponse.status} ${sessionsResponse.statusText}`);
      }
      
      const sessions = await sessionsResponse.json();
      if (!sessions || sessions.length === 0) {
        throw new Error("No race sessions found in OpenF1 registry.");
      }

      // Sort by session_key descending to get the absolute latest session
      const latestSession = sessions.sort((a: any, b: any) => b.session_key - a.session_key)[0];
      const latestSessionKey = latestSession.session_key;

      console.log(`[APEX] Latest Session Identified: ${latestSessionKey} - ${latestSession.location} (${latestSession.year})`);

      // 2. Fetch Driver Details for this session
      // We attempt to capitalize the ID to match OpenF1's last_name format (e.g. 'verstappen' -> 'Verstappen')
      // Note: This relies on the ID being the surname.
      const formattedName = driverId.charAt(0).toUpperCase() + driverId.slice(1);
      
      const driverResponse = await fetch(`${OPENF1_BASE_URL}/drivers?session_key=${latestSessionKey}&last_name=${formattedName}`);
      if (!driverResponse.ok) {
         throw new Error(`OpenF1 Driver Lookup Error: ${driverResponse.statusText}`);
      }
      const driverDataList = await driverResponse.json();

      let recentFormScore = 0;

      // 3. Calculate Recent Form based on the latest race result
      if (driverDataList && driverDataList.length > 0) {
        const driverInfo = driverDataList[0];
        const driverNumber = driverInfo.driver_number;

        // Fetch Position data
        const positionResponse = await fetch(`${OPENF1_BASE_URL}/position?session_key=${latestSessionKey}&driver_number=${driverNumber}`);
        if (!positionResponse.ok) {
            throw new Error(`OpenF1 Position Lookup Error: ${positionResponse.statusText}`);
        }
        const positions = await positionResponse.json();

        if (positions && positions.length > 0) {
           const finalPosition = positions[positions.length - 1].position;
           console.log(`[APEX] ${formattedName} finished P${finalPosition} in the latest race.`);
           recentFormScore = Math.max(1, 10 - ((finalPosition - 1) * 0.45));
        } else {
           // Driver exists but no position data
           recentFormScore = 5;
        }
      } else {
        console.warn(`[APEX] Driver ${formattedName} not found in session ${latestSessionKey}.`);
        // We do not throw here to allow partial data if the API works but driver didn't race
        const tier = TIERS[driverId] || 3;
        recentFormScore = 10 - (tier * 1.5);
      }

      // 4. Determine Historical Score
      const tier = TIERS[driverId] || 3;
      let historicalScore = 10 - (tier * 1.5);
      
      if (trackId === 'monza' && (driverId === 'leclerc' || driverId === 'hamilton')) historicalScore += 1;
      if (trackId === 'zandvoort' && driverId === 'verstappen') historicalScore += 1.5;
      
      historicalScore = Math.min(9.8, Math.max(2, historicalScore));
      recentFormScore = Math.min(9.9, Math.max(1, recentFormScore));

      return {
        driverId: driverId,
        trackId: trackId,
        historicalScore: Number(historicalScore.toFixed(1)),
        recentFormScore: Number(recentFormScore.toFixed(1)),
        totalRacesAtTrack: 0,
        winsAtTrack: 0
      };

    } catch (error: any) {
      console.error("Critical Failure in Data Fetching Tool:", error);
      throw error; 
    }
  }

  /**
   * Tool B: Prediction Logic
   */
  public calculateWinProbability(stats: DriverStats): PredictionResult {
    const HISTORICAL_WEIGHT = 0.6;
    const FORM_WEIGHT = 0.4;

    const weightedScore = (stats.historicalScore * HISTORICAL_WEIGHT) + (stats.recentFormScore * FORM_WEIGHT);
    
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