import React, { useState, useEffect } from 'react';
import { Activity, Cpu, ChevronRight, BarChart2, Zap, MapPin, Radio, Wifi, Loader2 } from 'lucide-react';
import { Driver, Track, AgentState, PredictionResult } from './types';
import { apexAgent } from './services/f1Agent';
import { generateRaceAnalysis } from './services/geminiService';
import { AnalysisChart } from './components/AnalysisChart';

const App: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLiveMode = apexAgent.isLiveMode;

  // Initial Data Load (Drivers + Tracks)
  useEffect(() => {
    const loadF1Data = async () => {
      try {
        setIsLoadingData(true);
        // Execute fetching in parallel for speed
        const [gridData, calendarData] = await Promise.all([
          apexAgent.getDrivers(),
          apexAgent.getTracks()
        ]);
        
        setDrivers(gridData);
        setTracks(calendarData);
      } catch (error) {
        console.error("Failed to load F1 data", error);
        setErrorMessage("Failed to connect to OpenF1 Network. Please check your internet connection.");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadF1Data();
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedDriver || !selectedTrack) return;

    setAgentState(AgentState.FETCHING_DATA);
    setPrediction(null);
    setErrorMessage(null);

    try {
      // Step 1: Tool A - Data Fetching
      const stats = await apexAgent.fetchF1Data(selectedDriver.id, selectedTrack.id);
      
      // Step 2: Tool B - Calculation
      setAgentState(AgentState.CALCULATING);
      // Reduce delay if live mode to feel snappier, or keep for effect
      await new Promise(r => setTimeout(r, isLiveMode ? 200 : 600)); 
      
      const result = apexAgent.calculateWinProbability(stats);

      // Step 3: Optional AI Enhancement
      setAgentState(AgentState.GENERATING_INSIGHTS);
      const analysis = await generateRaceAnalysis(selectedDriver, selectedTrack, result);
      
      setPrediction({ ...result, aiAnalysis: analysis });
      setAgentState(AgentState.COMPLETE);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred during the agent workflow.");
      setAgentState(AgentState.ERROR);
    }
  };

  const isRunning = agentState !== AgentState.IDLE && agentState !== AgentState.COMPLETE && agentState !== AgentState.ERROR;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500 selection:text-white pb-12 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">APEX F1</h1>
              <div className="flex items-center gap-2">
                 <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Live Strategy Agent</p>
                 <span className="text-slate-700">|</span>
                 {isLiveMode ? (
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     <Wifi className="w-3 h-3" /> LIVE DATA FEED
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                     <Radio className="w-3 h-3" /> SIMULATION MODE
                   </div>
                 )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            SYSTEM {isRunning ? 'ACTIVE' : 'READY'}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full space-y-8">
        
        {/* Input Section - Split into 2 columns */}
        <section className="grid lg:grid-cols-2 gap-8">
          
          {/* Driver Select */}
          <div className="space-y-4 flex flex-col h-[500px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Select Driver
              </label>
              <span className="text-xs text-slate-600 font-mono">
                {isLoadingData ? 'CONNECTING...' : `${drivers.length} ACTIVE`}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-900/30 p-2 rounded-2xl border border-slate-800/50">
              
              {isLoadingData && (
                <div className="col-span-2 flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                   <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                   <div className="text-xs font-mono">SYNCING GRID...</div>
                </div>
              )}

              {!isLoadingData && drivers.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  disabled={isRunning}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                    selectedDriver?.id === driver.id 
                      ? 'bg-slate-800 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                    <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className={`font-semibold truncate ${selectedDriver?.id === driver.id ? 'text-white' : 'text-slate-300'}`}>{driver.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide truncate">{driver.team}</div>
                  </div>
                  {selectedDriver?.id === driver.id && (
                    <div className="absolute inset-y-0 right-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Track Select */}
          <div className="space-y-4 flex flex-col h-[500px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                 Select Circuit
              </label>
              <span className="text-xs text-slate-600 font-mono">
                {isLoadingData ? 'CONNECTING...' : `${tracks.length} CONFIRMED`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-900/30 p-2 rounded-2xl border border-slate-800/50">
              
              {isLoadingData && (
                <div className="col-span-2 flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                   <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                   <div className="text-xs font-mono">SYNCING CALENDAR...</div>
                </div>
              )}

              {!isLoadingData && tracks.map(track => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  disabled={isRunning}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                    selectedTrack?.id === track.id 
                      ? 'bg-slate-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-12 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                    <img 
                      src={track.image} 
                      alt={track.name} 
                      className={`w-full h-full object-cover transition-all duration-500 ${selectedTrack?.id === track.id ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} 
                    />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className={`font-semibold truncate ${selectedTrack?.id === track.id ? 'text-white' : 'text-slate-300'}`}>{track.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" /> {track.location}
                    </div>
                  </div>
                  {selectedTrack?.id === track.id && (
                    <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex flex-col items-center justify-center pt-2 space-y-6">
          <button
            onClick={handleRunSimulation}
            disabled={!selectedDriver || !selectedTrack || isRunning}
            className={`
              relative overflow-hidden group px-16 py-5 rounded-2xl font-bold text-lg tracking-widest transition-all duration-300 w-full max-w-md
              ${!selectedDriver || !selectedTrack 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:scale-[1.02] active:scale-[0.98] border border-red-400'
              }
            `}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isRunning ? 'PROCESSING TELEMETRY...' : 'INITIATE PREDICTION'}
              {!isRunning && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            {isRunning && (
              <div className="absolute inset-0 bg-red-700/50 w-full h-full animate-pulse"></div>
            )}
          </button>

           {/* Status Terminal */}
           {agentState !== AgentState.IDLE && (
            <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-800 pb-2">
                <Activity className="w-3 h-3" />
                <span>AGENT LOGS</span>
              </div>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 ${agentState === AgentState.FETCHING_DATA ? 'text-amber-400' : 'text-emerald-500'}`}>
                  <span className="opacity-50">[Tool A]</span>
                  <span>
                    {isLiveMode 
                      ? `Fetching Real-Time Telemetry (${selectedDriver?.id})...` 
                      : `Generating Synthetic Data (${selectedDriver?.id})...`
                    } 
                    {agentState === AgentState.FETCHING_DATA && <span className="animate-pulse">_</span>}
                  </span>
                  {agentState !== AgentState.FETCHING_DATA && <span>✓</span>}
                </div>
                
                {(agentState === AgentState.CALCULATING || agentState === AgentState.GENERATING_INSIGHTS || agentState === AgentState.COMPLETE) && (
                  <div className={`flex items-center gap-2 ${agentState === AgentState.CALCULATING ? 'text-amber-400' : 'text-emerald-500'}`}>
                    <span className="opacity-50">[Tool B]</span>
                    <span>Running Weighted Algorithm... {agentState === AgentState.CALCULATING && <span className="animate-pulse">_</span>}</span>
                    {agentState !== AgentState.CALCULATING && <span>✓</span>}
                  </div>
                )}

                {(agentState === AgentState.GENERATING_INSIGHTS || agentState === AgentState.COMPLETE) && (
                   <div className={`flex items-center gap-2 ${agentState === AgentState.GENERATING_INSIGHTS ? 'text-blue-400' : 'text-blue-500'}`}>
                   <span className="opacity-50">[Gemini]</span>
                   <span>Synthesizing Strategy Narrative... {agentState === AgentState.GENERATING_INSIGHTS && <span className="animate-pulse">_</span>}</span>
                   {agentState === AgentState.COMPLETE && <span>✓</span>}
                 </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {agentState === AgentState.ERROR && errorMessage && (
             <div className="w-full max-w-2xl bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg p-4 text-sm font-mono flex items-center gap-3 animate-in fade-in">
                <div className="bg-red-500/20 p-2 rounded">
                  <Activity className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="font-bold">AGENT ERROR</div>
                  <div>{errorMessage}</div>
                </div>
             </div>
          )}
        </div>

        {/* Results Dashboard */}
        {prediction && agentState === AgentState.COMPLETE && selectedDriver && selectedTrack && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 pt-4 border-t border-slate-800/50">
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Probability Card */}
              <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-800 relative overflow-hidden flex flex-col justify-center shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <BarChart2 className="w-48 h-48" />
                </div>
                <div className="flex items-center gap-2 mb-6">
                   <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded text-xs font-bold uppercase tracking-wider">Prediction</div>
                   <div className="text-slate-500 text-xs font-mono uppercase">{selectedDriver.name} at {selectedTrack.name}</div>
                </div>
                
                <div className="flex items-baseline gap-4 mb-6">
                  <span className={`text-7xl md:text-8xl font-black tracking-tighter tabular-nums ${
                    prediction.probability > 70 ? 'text-emerald-500' : 
                    prediction.probability > 40 ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    {prediction.probability}%
                  </span>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Win Probability</span>
                    <span className="text-slate-600 text-xs">Based on {prediction.rawStats.totalRacesAtTrack} data points</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                     <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wide">Historical</div>
                     <div className="text-2xl font-mono text-white">{prediction.rawStats.historicalScore}/10</div>
                     <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                       <div className="bg-red-600 h-1 rounded-full transition-all duration-1000" style={{ width: `${prediction.rawStats.historicalScore * 10}%` }}></div>
                     </div>
                   </div>

                   <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                     <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wide">Recent Form</div>
                     <div className="text-2xl font-mono text-white">{prediction.rawStats.recentFormScore}/10</div>
                     <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                       <div className="bg-amber-500 h-1 rounded-full transition-all duration-1000" style={{ width: `${prediction.rawStats.recentFormScore * 10}%` }}></div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
                <h4 className="text-xs text-slate-500 font-bold uppercase mb-4 w-full text-left flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Metrics Analysis
                </h4>
                <AnalysisChart result={prediction} />
              </div>
            </div>

            {/* Gemini Analysis Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 rounded-2xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Agent Insight</h3>
                </div>
                <p className="text-slate-300 leading-relaxed font-light text-lg italic">
                  "{prediction.aiAnalysis}"
                </p>
              </div>
            </div>
            
            <div className="text-center pt-8 pb-4 opacity-40">
              <p className="text-[10px] font-mono uppercase tracking-widest">
                APEX F1 AGENT v2.0 | LIVE GRID DATA | POWERED BY GEMINI FLASH
              </p>
            </div>

          </section>
        )}

      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}</style>
    </div>
  );
};

export default App;