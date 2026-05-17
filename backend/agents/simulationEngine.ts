import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

export interface SimulatedBall {
  ball: number;
  over: number;
  ballInOver: number;
  bowler: string;
  batter: string;
  outcome: 'dot' | '1' | '2' | '3' | '4' | '6' | 'W' | 'Wd' | 'Nb';
  runs: number;
  description: string;
  cumulativeScore: number;
  cumulativeWickets: number;
  winProbability: number;
  momentum: 'batting' | 'bowling' | 'neutral';
  dramaticEvent: boolean;
  crowdReaction: 'roar' | 'groan' | 'gasp' | 'silent' | 'electric';
}

export interface UniverseSummary {
  finalScore: string;
  finalWickets: number;
  finalWinProbability: number;
  universeVerdict: string;
  keyMoment: number;
  captainRating: 'Masterstroke' | 'Good Call' | 'Risky But Ok' | 'Costly Error' | 'Catastrophic';
}

export interface Universe {
  balls: SimulatedBall[];
  summary: UniverseSummary;
}

export interface ThreeUniverseSimulation {
  universeA: Universe;
  universeB: Universe;
  universeC: Universe;
  simulationMetadata: {
    bestUniverse: 'A' | 'B' | 'C';
    winProbComparison: { A: number; B: number; C: number };
    recommendationValidated: boolean;
    confidenceScore: number;
  };
}

function buildSimulationPrompt(matchState: any, captainDecision: any): string {
  const dewNote = matchState.dewFactor === 'heavy'
    ? 'HEAVY DEW: Bowling gets significantly harder from ball 8 onwards. Batting team gains 5-8% win probability per over in death.' 
    : matchState.dewFactor === 'light' ? 'Light dew — minimal impact on bowling.' : 'No dew.';

  const currentWinProb = matchState.winProbability || 45;
  const runsNeeded = matchState.target ? matchState.target - matchState.currentScore : null;
  const ballsLeft = (20 - matchState.over) * 6 - matchState.ball;
  const rrr = runsNeeded ? ((runsNeeded / ballsLeft) * 6).toFixed(1) : 'N/A';
  
  const gambleOption = (() => {
    if (matchState.impactPlayerAvailable) return `Deploy impact player ${matchState.impactPlayerName || 'pinch-hitter'} immediately to bat at 3`;
    if (!matchState.strategicTimeoutUsed) return `Use strategic timeout mid-over to completely reset field and batting approach`;
    const nonMainBowler = matchState.bowlers?.find((b: any) => b.oversUsed < 2 && b.name !== captainDecision.nextBowler);
    return nonMainBowler ? `Bowl unorthodox option ${nonMainBowler.name} who has bowled barely 2 overs` : `Radical: bring on a part-timer to break rhythm`;
  })();

  return `You are an advanced cricket simulation engine with access to 20 years of IPL match data and Duckworth-Lewis probability models.

CURRENT MATCH STATE:
${JSON.stringify(matchState, null, 2)}

ADDITIONAL CONTEXT:
- Runs needed: ${runsNeeded || 'N/A'} off ${ballsLeft} balls
- Required run rate: ${rrr}
- Current win probability (batting team): ${currentWinProb}%
- ${dewNote}

CAPTAIN'S DECISION (Universe A follows this exactly):
${JSON.stringify(captainDecision, null, 2)}

UNIVERSE DEFINITIONS:
- UNIVERSE A "THE CALL": Captain bowls ${captainDecision.nextBowler} with field: ${captainDecision.fieldSetup}. Simulate realistically.
- UNIVERSE B "THE MISTAKE": Captain bowls the WRONG bowler — specifically the one with the WORST economy rate from the team who hasn't completed overs. The batter exploits the mismatch, momentum shifts.
- UNIVERSE C "THE GAMBLE": ${gambleOption}. Unpredictable — could go either way dramatically.

REALISM RULES (strictly enforced):
- Death overs (16-20): boundaries ~32%, dots ~33%, singles/twos ~28%, wickets ~7%
- Middle overs (10-15): boundaries ~20%, dots ~42%, singles/twos ~32%, wickets ~6%
- After a wicket: next batter MUST dot ball 1, then slowly build
- After a six: batter is in rhythm — next ball 60% chance of boundary/big shot
- Good bowler on a good day: reduces boundary% by 8-12%
- Heavy dew from ball 8+: bowling team loses 6-10% win probability
- If chasing impossible rate (>24): batting collapses likely
- Crowd pressure: after 2 dots in death, batter takes risk — 40% chance of big shot OR wicket

For EACH ball in EACH universe, generate:
{
  "ball": [1-12 sequential across 2 overs],
  "over": [16 or 17 based on current],
  "ballInOver": [1-6],
  "bowler": "string — name",
  "batter": "string — who is facing",
  "outcome": "dot"|"1"|"2"|"3"|"4"|"6"|"W"|"Wd"|"Nb",
  "runs": [number 0-6],
  "description": "ONE vivid sentence, Harsha Bhogle style, specific to this ball's moment",
  "cumulativeScore": [total score so far],
  "cumulativeWickets": [wickets so far],
  "winProbability": [0-100 batting team],
  "momentum": "batting"|"bowling"|"neutral",
  "dramaticEvent": [true if W, 6, or pivotal pressure ball],
  "crowdReaction": "roar"|"groan"|"gasp"|"silent"|"electric"
}

After 12 balls, for each universe:
{
  "finalScore": "TEAM X/Y",
  "finalWickets": number,
  "finalWinProbability": number,
  "universeVerdict": "2 sentences — what this outcome means for the match",
  "keyMoment": [ball number 1-12 that decided this universe's fate],
  "captainRating": "Masterstroke"|"Good Call"|"Risky But Ok"|"Costly Error"|"Catastrophic"
}

Return ONLY this JSON — no markdown, no explanation, no fences:
{
  "universeA": { "balls": [...], "summary": {...} },
  "universeB": { "balls": [...], "summary": {...} },
  "universeC": { "balls": [...], "summary": {...} },
  "simulationMetadata": {
    "bestUniverse": "A"|"B"|"C",
    "winProbComparison": { "A": number, "B": number, "C": number },
    "recommendationValidated": boolean,
    "confidenceScore": number
  }
}`;
}

function buildFallbackSimulation(matchState: any, captainDecision: any): ThreeUniverseSimulation {
  const baseScore = matchState.currentScore;
  const baseWickets = matchState.wickets;
  const bowlerA = captainDecision.nextBowler || 'Best Bowler';
  const bowlerB = matchState.bowlers?.find((b: any) => b.name !== bowlerA && b.economy > 8)?.name || 'Expensive Option';
  const bowlerC = matchState.impactPlayerName || matchState.bowlers?.[0]?.name || 'Wildcard';
  const batter = matchState.onStrikeBatter;

  const generateUniverse = (bias: 'good' | 'bad' | 'wild', bowler: string): Universe => {
    const balls: SimulatedBall[] = [];
    let score = baseScore;
    let wickets = baseWickets;
    let winProb = matchState.winProbability || 45;

    const outcomes: SimulatedBall['outcome'][] = bias === 'good'
      ? ['dot', 'dot', '1', '4', 'dot', '1', 'dot', '1', '2', '6', 'dot', 'W']
      : bias === 'bad'
      ? ['4', '6', 'W', 'dot', '4', '6', '1', 'W', '4', 'dot', '6', '4']
      : ['6', 'W', '4', 'dot', '6', '1', '4', '6', 'W', 'dot', '6', '4'];

    const descs: Record<string, string> = {
      dot: `${bowler} nails the hard length — beaten outside off! Dot ball under pressure.`,
      '1': `Worked off the pads for a single — smart cricket, keeping the strike.`,
      '2': `Driven through mid-off and they've sprinted back for two!`,
      '4': `FOUR! Latched onto a full ball and punched it through the covers!`,
      '6': `SIX! Over long-on, into the second tier — the crowd erupts!`,
      W: `WICKET! ${batter} goes! Attempted big shot, found the man at long-on. Huge!`,
      Wd: `Wide outside off — that's going to hurt the required rate.`,
      Nb: `No ball! Free hit coming up — the fielders push back.`
    };

    for (let i = 0; i < 12; i++) {
      const outcome = outcomes[i];
      const runs = outcome === 'dot' ? 0 : outcome === 'W' ? 0 : parseInt(outcome) || 0;
      score += runs;
      if (outcome === 'W') { wickets++; winProb = Math.max(5, winProb - 15); }
      else if (outcome === '6') winProb = Math.min(95, winProb + 8);
      else if (outcome === '4') winProb = Math.min(95, winProb + 4);
      else if (outcome === 'dot') winProb = Math.max(5, winProb - 2);
      const overNum = matchState.over + Math.floor(i / 6);
      balls.push({
        ball: i + 1, over: overNum, ballInOver: (i % 6) + 1,
        bowler, batter, outcome, runs,
        description: descs[outcome] || 'Ball played out.',
        cumulativeScore: score, cumulativeWickets: wickets,
        winProbability: winProb,
        momentum: winProb > 55 ? 'batting' : winProb < 40 ? 'bowling' : 'neutral',
        dramaticEvent: outcome === 'W' || outcome === '6',
        crowdReaction: outcome === '6' ? 'roar' : outcome === 'W' ? 'gasp' : outcome === '4' ? 'electric' : 'silent'
      });
    }
    const finalWP = balls[11].winProbability;
    return {
      balls,
      summary: {
        finalScore: `${matchState.battingTeam} ${score}/${wickets}`,
        finalWickets: wickets,
        finalWinProbability: finalWP,
        universeVerdict: bias === 'good' ? `${bowler} kept it tight and gave the team a fighting chance.` : bias === 'bad' ? `The wrong call cost 24 runs in 2 overs — effectively ending the contest.` : `The wildcard play created chaos — high variance, but the team stayed alive.`,
        keyMoment: bias === 'good' ? 7 : 3,
        captainRating: bias === 'good' ? 'Good Call' : bias === 'bad' ? 'Costly Error' : 'Risky But Ok'
      }
    };
  };

  const uA = generateUniverse('good', bowlerA);
  const uB = generateUniverse('bad', bowlerB);
  const uC = generateUniverse('wild', bowlerC);

  return {
    universeA: uA, universeB: uB, universeC: uC,
    simulationMetadata: {
      bestUniverse: 'A',
      winProbComparison: { A: uA.summary.finalWinProbability, B: uB.summary.finalWinProbability, C: uC.summary.finalWinProbability },
      recommendationValidated: true,
      confidenceScore: 78
    }
  };
}

export async function generateSimulation(matchState: any, captainDecision: any, retries = 2): Promise<ThreeUniverseSimulation> {
  const prompt = buildSimulationPrompt(matchState, captainDecision);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[SIM ENGINE] Attempt ${attempt + 1} — generating 3 universes via Gemini 2.5 Flash...`);
      const t0 = Date.now();
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
          topP: 0.95
        }
      });

      const raw = response.text || '{}';
      const parsed = JSON.parse(raw) as ThreeUniverseSimulation;
      
      // Validate structure
      if (!parsed.universeA?.balls || parsed.universeA.balls.length < 12) throw new Error('Invalid simulation: Universe A missing balls');
      if (!parsed.universeB?.balls || parsed.universeB.balls.length < 12) throw new Error('Invalid simulation: Universe B missing balls');
      if (!parsed.universeC?.balls || parsed.universeC.balls.length < 12) throw new Error('Invalid simulation: Universe C missing balls');

      const tokens = response.usageMetadata?.totalTokenCount || 0;
      console.log(`[SIM ENGINE] Success | ${tokens} tokens | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      return parsed;

    } catch (e: any) {
      console.error(`[SIM ENGINE] Attempt ${attempt + 1} failed:`, e.message);
      if (attempt === retries) {
        console.warn('[SIM ENGINE] All attempts failed — using deterministic fallback simulation');
        return buildFallbackSimulation(matchState, captainDecision);
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return buildFallbackSimulation(matchState, captainDecision);
}
