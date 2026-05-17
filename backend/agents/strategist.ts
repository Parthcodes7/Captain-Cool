import { GoogleGenAI } from '@google/genai';
import { getFieldPlacementSuggestionTool, getBowlerStatsTool } from '../tools';

export class Strategist {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, any> = new Map();
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async propose(enrichedMatchData: any, sessionId: string = "default") {
    const t0 = Date.now();
    console.log(`[AGENT: Strategist] [ROUND: 1] Formulating strategy...`);
    
    const systemInstruction = `You are MS Dhoni in the dugout at over ${enrichedMatchData.over || 16}, walkie-talkie in hand. You do not panic. You have seen every situation before. Your decisions are always backed by process, not panic.

Mandatory decision structure — think through each step:
1. FIRST: What does the data say? Cite the pressure index (${enrichedMatchData.pressureIndex || 'high'}) and win probability (${enrichedMatchData.winProbability || 'low'}%).
2. SECOND: What do your instincts say? (the feel you cannot quantify)
3. THIRD: What will the OPPOSITION CAPTAIN expect you to do? Do the opposite if it gives an edge.
4. FOURTH: The actual call. One sentence. No hedging.
5. FIFTH: The backup plan if it goes wrong in the first 2 balls.

Speech pattern: terse, uses 'process', 'back him', 'numbers say', 'back him to hit the hard length'.

Return ONLY valid JSON with keys: nextBowler (string), fieldSetup (string), battingChange (string), timeout: {callNow: boolean, reason: string}, impactPlayer: {deploy: boolean, name: string|null}, primaryReasoning (cricket paragraph).`;
    
    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: [{ functionDeclarations: [getFieldPlacementSuggestionTool, getBowlerStatsTool] }]
      }
    });
    
    this.chatSessions.set(sessionId, chat);
    
    try {
      const response = await chat.sendMessage({
        message: `Current match data: ${JSON.stringify(enrichedMatchData)}\n\nMake the call. What is your next move?`
      });
      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[AGENT: Strategist] [ROUND: 1] [TOKENS: ${tokens}] [TIME: ${((Date.now()-t0)/1000).toFixed(1)}s]`);
      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("[Strategist Error]", e.message);
      const bowlers = enrichedMatchData.bowlers || [];
      const bestBowler = bowlers.sort((a: any, b: any) => a.economy - b.economy)[0];
      return {
        nextBowler: bestBowler?.name || "Best Death Bowler",
        fieldSetup: "Deep point, long on, long off covering the boundary. Fine leg up for the yorker.",
        battingChange: "None. Keep the same order.",
        timeout: { callNow: !enrichedMatchData.strategicTimeoutUsed, reason: "Slow the game. Force a rethink. Back the process." },
        impactPlayer: { deploy: enrichedMatchData.impactPlayerAvailable && enrichedMatchData.over >= 17, name: enrichedMatchData.impactPlayerName || null },
        primaryReasoning: "The numbers say we need our best death bowler. We back the process. The pressure index is at crisis level — this is exactly when experience matters. Call the timeout, reset, then execute."
      };
    }
  }

  async defend(challengeResult: any, sessionId: string = "default") {
    const t0 = Date.now();
    console.log(`[AGENT: Strategist] [ROUND: 3] Defending/revising strategy...`);
    const chat = this.chatSessions.get(sessionId);
    if (!chat) throw new Error("Chat session not found — cannot defend");

    try {
      const response = await chat.sendMessage({
        message: `Virat Kohli's challenge (confidence: ${challengeResult.confidenceInCounter}/100): ${JSON.stringify(challengeResult)}\n\nDefend your position or revise if he makes a valid point. Output JSON with the same structure as your original proposal.`
      });
      console.log(`[AGENT: Strategist] [ROUND: 3] [TIME: ${((Date.now()-t0)/1000).toFixed(1)}s]`);
      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("[Strategist Defense Error]", e.message);
      return { message: "Challenge heard. We've considered it. Original call stands. Back the process." };
    }
  }
}
