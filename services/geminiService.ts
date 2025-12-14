import { GoogleGenAI } from "@google/genai";
import { Driver, Track, PredictionResult } from "../types";

export const generateRaceAnalysis = async (
  driver: Driver, 
  track: Track, 
  result: PredictionResult
): Promise<string> => {
  try {
    // Trim whitespace to prevent "API key not valid" errors due to copy-paste issues
    const apiKey = process.env.API_KEY?.trim();
    
    if (!apiKey) {
      return "Agent Insight: API Key missing. Unable to generate narrative analysis, but the statistical prediction remains valid.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are "APEX", an advanced Formula 1 strategy agent. 
      Analyze the following prediction data:
      
      Driver: ${driver.name} (${driver.team})
      Track: ${track.name}, ${track.location}
      Predicted Win Probability: ${result.probability}%
      
      Key Metrics:
      - Historical Track Performance Rating: ${result.rawStats.historicalScore}/10
      - Recent Form Rating: ${result.rawStats.recentFormScore}/10
      
      Task: Write a concise, professional 2-sentence tactical analysis explaining this probability. 
      Focus on the balance between their history at this track and their current season form.
      Use technical F1 terminology (e.g., downforce, tire degradation, sector times, chassis balance).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis complete.";
  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    
    // Attempt to extract a cleaner message if it's a JSON error string (common with Google APIs)
    let cleanMessage = error.message || 'Unknown Error';
    try {
      if (cleanMessage.includes('{')) {
        const jsonPart = cleanMessage.substring(cleanMessage.indexOf('{'));
        const jsonError = JSON.parse(jsonPart);
        if (jsonError.error?.message) {
          cleanMessage = jsonError.error.message;
        }
      }
    } catch (e) {
      // Parsing failed, stick to original message
    }

    return `Agent Insight: Tactical analysis system offline. (${cleanMessage})`;
  }
};