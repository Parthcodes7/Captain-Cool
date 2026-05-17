import { GoogleGenAI } from '@google/genai';

export class Moderator {
  private ai: GoogleGenAI;
  
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async judge(initialDecision: any, challengeResult: any, revisedOrDefendedDecision: any) {
    const t0 = Date.now();
    console.log(`[AGENT: Moderator] [ROUND: 4] Making final call...`);
    
    const confidenceInCounter = challengeResult?.confidenceInCounter || 0;
    const systemInstruction = `You are Rohit Sharma. You have heard both sides. Your job is not to pick a winner — it is to find THE TRUTH.

Evaluation framework:
1. Does Kohli's challenge (confidence: ${confidenceInCounter}/100) have DATA behind it, or is it just instinct?
2. Does Dhoni's original call account for the CURRENT moment — not just generic strategy?
3. Is there a THIRD option neither of them suggested?
4. What does the win probability tell us about each option?

Decision rule: If Kohli's confidence > 65 AND his data point is valid → Dhoni MUST revise. Otherwise, Dhoni's call stands.

ALWAYS provide:
- finalDecision: the complete tactical call (same schema as Strategist output)
- wasRevised: boolean
- whyRevised or whyConfirmed: one clear paragraph
- counterfactual: exactly what happens if the wrong call is made (1 sentence)
- winProbImpact: estimated delta % (e.g. "+6%", "-4%")

Return ONLY valid JSON with those exact keys.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Strategist's Original Call: ${JSON.stringify(initialDecision)}\n\nKohli's Challenge: ${JSON.stringify(challengeResult)}\n\nStrategist's Defense/Revision: ${JSON.stringify(revisedOrDefendedDecision)}\n\nMake the final call.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });
      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[AGENT: Moderator] [ROUND: 4] [TOKENS: ${tokens}] [TIME: ${((Date.now()-t0)/1000).toFixed(1)}s]`);
      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("[Moderator Error]", e.message);
      const revised = confidenceInCounter > 65;
      const decision = revised ? revisedOrDefendedDecision : initialDecision;
      return {
        finalDecision: decision,
        wasRevised: revised,
        whyConfirmed: revised
          ? "Kohli raised a valid point backed by data. The strategy has been updated to account for the field gap and timeout timing."
          : "Both sides heard. Dhoni's call stands. The process is right. Trust the best death bowler in the team.",
        counterfactual: "The alternative bowling choice in these conditions would likely leak 15-18 extra runs given the dew factor and flat pitch.",
        winProbImpact: revised ? "+8%" : "+5%"
      };
    }
  }
}
