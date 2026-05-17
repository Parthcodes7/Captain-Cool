import { GoogleGenAI } from '@google/genai';

export class Commentator {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async narrate(finalDecision: any, enrichedMatchData: any, debateHistory: any) {
    const t0 = Date.now();
    console.log(`[AGENT: Commentator] [ROUND: 5] Generating narrative...`);
    
    const fd = finalDecision?.finalDecision || finalDecision;
    const systemInstruction = `You are Harsha Bhogle. This is YOUR moment. The entire tactical debate has played out. The captain has made the call.

Your job: write the most beautiful, dramatic, precise cricket commentary for this exact situation.

STRUCTURE — return JSON with EXACTLY these keys:
- HEADLINE: one punchy newspaper-back-page line (ALL CAPS, max 12 words, use the player names and situation)
- DECISION: what the captain just decided in plain English (2-3 sentences a new fan can understand)
- THE_THINKING: the chess-move reasoning in cricket language (3-4 sentences, use phrases like "read the room", "calculated risk", "bowling map")
- THE_DEBATE: what the dissenting voice argued and why it was overruled or accepted (2-3 sentences, dramatic)
- COUNTERFACTUAL: ONE sentence starting with "Had they gone with X instead..." mentioning exact win probability impact
- CONFIDENCE: a star rating out of 5 (e.g. "⭐⭐⭐⭐") followed by a one-line justification

NEVER use: 'win probability', 'logistic', 'model', 'AI', 'agent', 'algorithm', 'machine learning'
ALWAYS use: player names, specific ground positions, cricket terms explained in context, dramatic stakes`;
    
    const debateSummary = debateHistory
      .filter((e: any) => !e.content?.status && e.round >= 1)
      .map((e: any) => `[${e.agentName} R${e.round}]: ${JSON.stringify(e.content).substring(0, 150)}`)
      .join('\n');

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Final Decision: ${JSON.stringify(fd)}\n\nMatch State: ${JSON.stringify(enrichedMatchData)}\n\nDebate Summary:\n${debateSummary}\n\nNarrate this as Harsha Bhogle would.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });
      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[AGENT: Commentator] [ROUND: 5] [TOKENS: ${tokens}] [TIME: ${((Date.now()-t0)/1000).toFixed(1)}s]`);
      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("[Commentator Error]", e.message);
      const bowler = fd?.nextBowler || 'the captain\'s chosen bowler';
      return {
        HEADLINE: `${bowler.toUpperCase()} — THE CAPTAIN'S GAMBLE IN THE HEAT OF BATTLE!`,
        DECISION: `The captain has made the call, and it is a bold one — ${bowler} gets the ball for this crucial over. The field has been set with long-on and long-off protecting the boundary, and the Strategic Timeout has ${fd?.timeout?.callNow ? 'been called' : 'been held back'}.`,
        THE_THINKING: `This is a captain reading the game like a chess grandmaster. The bowling map here is clear — ${bowler}'s ability to hit the hard length and swing it late makes him the perfect weapon against power-hitters in the death. The captain has backed his man when it matters most.`,
        THE_DEBATE: `There was a fierce counter-argument in the dugout — bring in the spinner to break the rhythm. But the captain stood firm. On a flat pitch with heavy dew, pace over spin is the correct read, and that experience and conviction is what separates good captains from great ones.`,
        COUNTERFACTUAL: `Had they brought in the spinner instead, with the dew making the ball skid through at pace, they could have leaked an extra 15-18 runs in this one over alone.`,
        CONFIDENCE: `⭐⭐⭐⭐ A bold, data-backed call made under maximum pressure — the mark of genuine captaincy.`
      };
    }
  }
}
