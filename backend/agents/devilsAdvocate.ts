import { GoogleGenAI } from '@google/genai';
import { getBowlerStatsTool } from '../tools';

export class DevilsAdvocate {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async challenge(initialDecision: any, enrichedMatchData: any) {
    const t0 = Date.now();
    console.log(`[AGENT: Devil's Advocate] [ROUND: 2] Challenging strategy...`);
    
    const systemInstruction = `You are Virat Kohli on the field, passionate and intense. The Strategist just made a call. You MUST find the flaw.

Your challenge framework:
- THE HUNCH: What does your gut say is wrong here?
- THE DATA POINT THEY MISSED: Find ONE specific stat or fact that undermines the Strategist's reasoning (economy rate, head-to-head record, batter weakness, field placement gap).
- THE ALTERNATIVE: What would YOU do instead? Be specific — name a bowler, a field position, a timing decision.
- THE WORST CASE: If the Strategist is wrong, quantify the damage: runs leaked, wickets not taken, win probability drop.
- CONFIDENCE IN YOUR COUNTER: 0-100. Be honest and calibrated.

Never challenge for the sake of it — only if you genuinely believe it will cost the team the match.
Make it passionate but evidence-based. This is Virat Kohli, not random noise.

Return ONLY valid JSON: { challenges: [{point: string, reasoning: string}], alternativeDecision: string, confidenceInCounter: number, worstCase: string }`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Match Data: ${JSON.stringify(enrichedMatchData)}\n\nStrategist's Proposal: ${JSON.stringify(initialDecision)}\n\nFind the flaws. Challenge hard.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          tools: [{ functionDeclarations: [getBowlerStatsTool] }]
        }
      });
      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[AGENT: Devil's Advocate] [ROUND: 2] [TOKENS: ${tokens}] [TIME: ${((Date.now()-t0)/1000).toFixed(1)}s]`);
      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("[DevilsAdvocate Error]", e.message);
      const economy = initialDecision.nextBowler ? 
        (enrichedMatchData.bowlers || []).find((b: any) => b.name === initialDecision.nextBowler)?.economy : null;
      return {
        challenges: [
          {
            point: economy && economy > 9 ? "Economy rate is a red flag tonight" : "Field placement may be wrong for this batter",
            reasoning: economy && economy > 9 ? `${initialDecision.nextBowler} is going at ${economy} — that is dangerous in the death on a flat track with dew. One bad over here and it is match over.` : `${enrichedMatchData.onStrikeBatter}'s wagon wheel shows he scores heavily through covers. The current field leaves that gap open.`
          },
          {
            point: "Timeout timing is off",
            reasoning: "Using the timeout mid-over disrupts our own bowler's rhythm. Better to call it after this over when we know how many runs were leaked."
          }
        ],
        alternativeDecision: `Try ${(enrichedMatchData.bowlers || []).find((b: any) => b.name !== initialDecision.nextBowler && b.oversUsed < 4)?.name || 'the spinner'} for variation. Save the timeout for post-17.`,
        confidenceInCounter: 68,
        worstCase: "If they leak 20+ in this over, required rate drops below 30 which is impossible. Match lost in one over."
      };
    }
  }
}
