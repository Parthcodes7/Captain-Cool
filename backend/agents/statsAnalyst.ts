import { GoogleGenAI } from '@google/genai';
import { 
  fetchLiveMatchDataTool, 
  calculateWinProbabilityTool, 
  getWeatherAndDewTool, 
  getBowlerStatsTool,
  availableToolsMap
} from '../tools';

export class StatsAnalyst {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyze(matchState: any) {
    const t0 = Date.now();
    console.log(`[AGENT: Stats Analyst] [ROUND: 0] Starting analysis...`);
    
    const systemInstruction = `You are a hybrid of Cricviz analytics and an ESPN research desk. You have access to 15 years of T20 data. Your analysis must include:
- pressureIndex: composite score combining run rate pressure, wicket pressure, and phase pressure (0=none, 100=maximum)
- momentumScore: based on last 3 overs run rate vs match average
- matchTempoTag: one of 'controlled chase', 'panic mode', 'comfortable cruise', 'dead rubber', 'last-over thriller', 'powerplay blitz'
- bowlerFatigueIndex: per bowler — overs remaining vs overs used
- batterDangerScore: who is more dangerous and why
- currentRunRate, requiredRunRate, projectedScore
- winProbability: 0-100 for batting team
- matchPhase: one of powerplay/middle/slog/death
Output ONLY strictly valid JSON. Never hallucinate stats. Use the provided match state.`;
    
    const prompt = `Analyze this match state and return complete analytics JSON: ${JSON.stringify(matchState)}`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          tools: [{
            functionDeclarations: [
              fetchLiveMatchDataTool, 
              calculateWinProbabilityTool, 
              getWeatherAndDewTool, 
              getBowlerStatsTool
            ]
          }]
        }
      });
      
      let finalContent = response.text || "{}";
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          const toolFn = call.name ? availableToolsMap[call.name] : undefined;
          if (toolFn) {
            console.log(`[TOOL] ${call.name} | called by Stats Analyst`);
            await toolFn(call.args);
          }
        }
      }
      
      const elapsed = Date.now() - t0;
      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[AGENT: Stats Analyst] [ROUND: 0] [TOKENS: ${tokens}] [TIME: ${(elapsed/1000).toFixed(1)}s]`);
      return JSON.parse(finalContent);
    } catch (e: any) {
      console.error("[Stats Analyst Error]", e.message);
      return {
        currentRunRate: matchState.currentScore / Math.max(matchState.over, 1),
        requiredRunRate: matchState.target ? ((matchState.target - matchState.currentScore) / Math.max((20 - matchState.over), 0.1)) : 0,
        projectedScore: matchState.currentScore + 35,
        pressureIndex: Math.min(100, matchState.wickets * 8 + (matchState.over >= 16 ? 30 : 10)),
        pitchBehaviorScore: 7,
        dewImpactScore: matchState.dewFactor === 'heavy' ? 9 : 4,
        bowlers: matchState.bowlers,
        matchPhase: matchState.over >= 16 ? 'death' : matchState.over >= 10 ? 'slog' : 'middle',
        matchTempoTag: matchState.wickets >= 5 ? 'panic mode' : 'controlled chase',
        winProbability: Math.max(5, 50 - matchState.wickets * 5)
      };
    }
  }
}
