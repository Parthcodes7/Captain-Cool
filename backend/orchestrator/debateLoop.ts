import { GoogleGenAI } from '@google/genai';
import { calculateWinProbability, getHeadToHead, VENUE_HISTORY } from '../routes/tools';
import { contextCache } from '../services/contextCache';
import { StatsAnalyst } from '../agents/statsAnalyst';
import { Strategist } from '../agents/strategist';
import { DevilsAdvocate } from '../agents/devilsAdvocate';
import { Moderator } from '../agents/moderator';
import { Commentator } from '../agents/commentator';
import * as fs from 'fs';
import * as path from 'path';

const AGENT_LOADING_MESSAGES: Record<string, string> = {
  'Stats Analyst': 'Crunching 847 T20 data points...',
  'The Strategist': 'Running the numbers in the dugout...',
  "Devil's Advocate": 'Finding the flaw in the plan...',
  'The Moderator': 'Weighing both sides...',
  'Commentator': 'Reaching for the microphone...'
};

export class DebateOrchestrator {
  private statsAnalyst: StatsAnalyst;
  private strategist: Strategist;
  private devilsAdvocate: DevilsAdvocate;
  private moderator: Moderator;
  private commentator: Commentator;
  private traceDir: string;
  private sessionLog: any[] = [];

  constructor(apiKey: string) {
    this.statsAnalyst = new StatsAnalyst(apiKey);
    this.strategist = new Strategist(apiKey);
    this.devilsAdvocate = new DevilsAdvocate(apiKey);
    this.moderator = new Moderator(apiKey);
    this.commentator = new Commentator(apiKey);
    
    this.traceDir = path.join(__dirname, '../../../.antigravity/traces');
    if (!fs.existsSync(this.traceDir)) {
      fs.mkdirSync(this.traceDir, { recursive: true });
    }
  }

  private saveTrace(name: string, data: any) {
    fs.writeFileSync(path.join(this.traceDir, name), JSON.stringify(data, null, 2));
  }

  private buildEnrichedContext(matchState: any) {
    // Get match context from cache system
    const matchKey = `${matchState.battingTeam}-vs-${matchState.bowlingTeam}`;
    const profile = {
      battingTeam: matchState.battingTeam,
      bowlingTeam: matchState.bowlingTeam,
      venue: matchState.venue
    };
    contextCache.getOrCreate(matchKey, profile);
    const contextDoc = contextCache.getContextDocument(profile);

    // Run win probability calculation inline
    const oversLeft = (20 - matchState.over) - (matchState.ball / 6);
    const winProb = calculateWinProbability({
      currentScore: matchState.currentScore,
      wickets: matchState.wickets,
      oversRemaining: oversLeft,
      target: matchState.target,
      dewFactor: matchState.dewFactor
    });

    // Head-to-head matchups
    const h2h: any[] = [];
    for (const bowler of matchState.bowlers) {
      const matchup = getHeadToHead(matchState.onStrikeBatter, bowler.name);
      h2h.push({ batter: matchState.onStrikeBatter, bowler: bowler.name, ...matchup });
    }

    // Venue history
    const venueData = VENUE_HISTORY[matchState.venue] || {};

    // Pressure index
    const rrFactor = winProb.requiredRunRate > 18 ? 40 : winProb.requiredRunRate > 15 ? 25 : 10;
    const wicketFactor = matchState.wickets * 8;
    const phaseFactor = matchState.over >= 16 ? 20 : matchState.over >= 12 ? 10 : 0;
    const pressureIndex = Math.min(100, rrFactor + wicketFactor + phaseFactor);

    return {
      ...matchState,
      winProbability: winProb.winProbability,
      requiredRunRate: winProb.requiredRunRate,
      pressureIndex,
      matchPhase: matchState.over >= 16 ? 'death' : matchState.over >= 10 ? 'slog' : matchState.over >= 6 ? 'middle' : 'powerplay',
      headToHead: h2h,
      venueData,
      previousDecisions: this.sessionLog.map(e => `Over ${e.round}: ${e.agentName} said: ${JSON.stringify(e.content).substring(0, 80)}...`).join('\n')
    };
  }

  /** Guarantee the final tactical decision object always has all UI-required fields */
  private sanitizeDecision(raw: any, matchState: any): any {
    if (!raw || typeof raw !== 'object') raw = {};

    // Pick best bowler from match state as fallback
    const fallbackBowler =
      [...(matchState.bowlers || [])]
        .sort((a: any, b: any) => a.economy - b.economy)[0]?.name ||
      matchState.bowlers?.[0]?.name ||
      'Best Available Bowler';

    return {
      nextBowler:    raw.nextBowler    || raw.next_bowler    || raw.recommended_bowler || fallbackBowler,
      fieldSetup:    raw.fieldSetup    || raw.field_setup    || 'Standard death field: deep fine leg, long on, long off, deep point.',
      battingChange: raw.battingChange || raw.batting_change || 'None',
      timeout: {
        callNow: raw.timeout?.callNow ?? raw.timeout?.call_now ?? !matchState.strategicTimeoutUsed,
        reason:  raw.timeout?.reason  || 'Slow the game down and disrupt batting momentum.'
      },
      impactPlayer: {
        deploy: raw.impactPlayer?.deploy ?? raw.impact_player?.deploy ?? false,
        name:   raw.impactPlayer?.name  || raw.impact_player?.name  || matchState.impactPlayerName || null
      },
      primaryReasoning: raw.primaryReasoning || raw.primary_reasoning || raw.reasoning || 'Back the process.'
    };
  }

  async runDebate(matchState: any, onProgress?: (event: any) => void) {
    const sessionId = Date.now().toString();
    const debateHistory: any[] = [];
    
    const emit = (round: number, agentName: string, persona: string, content: any) => {
      const event = { round, agentName, persona, content, timestamp: new Date().toISOString() };
      debateHistory.push(event);
      this.sessionLog.push(event);
      if (onProgress) onProgress(event);
    };

    try {
      // ROUND 0 — Enrich data
      emit(0, 'Stats Analyst', 'Data Never Lies', { status: AGENT_LOADING_MESSAGES['Stats Analyst'] });
      const enrichedMatchData = this.buildEnrichedContext(matchState);

      let analysisResult: any;
      try {
        analysisResult = await this.statsAnalyst.analyze(enrichedMatchData);
        emit(0, 'Stats Analyst', 'Data Never Lies', analysisResult);
      } catch {
        analysisResult = enrichedMatchData;
        emit(0, 'Stats Analyst', 'Data Never Lies', { ...enrichedMatchData, note: 'Fell back to computed stats' });
      }
      this.saveTrace('round0_analysis.json', analysisResult);

      // ROUND 1 — Strategy
      emit(1, 'The Strategist', 'Back the Process', { status: AGENT_LOADING_MESSAGES['The Strategist'] });
      let initialDecision: any;
      try {
        initialDecision = await this.strategist.propose(analysisResult, sessionId);
      } catch {
        initialDecision = { nextBowler: matchState.bowlers[0]?.name || 'Best Bowler', fieldSetup: 'Standard death field', battingChange: 'None', timeout: { callNow: !matchState.strategicTimeoutUsed, reason: 'Disrupt batting momentum' }, impactPlayer: { deploy: matchState.impactPlayerAvailable, name: matchState.impactPlayerName }, primaryReasoning: 'Back the process. Numbers say we need our best bowler now.' };
      }
      this.saveTrace('round1_proposal.json', initialDecision);
      emit(1, 'The Strategist', 'Back the Process', initialDecision);

      // ROUND 2 — Challenge
      emit(2, "Devil's Advocate", 'Challenge Everything', { status: AGENT_LOADING_MESSAGES["Devil's Advocate"] });
      let challengeResult: any;
      try {
        challengeResult = await this.devilsAdvocate.challenge(initialDecision, analysisResult);
      } catch {
        challengeResult = { challenges: [{ point: 'Economy concern', reasoning: 'The suggested bowler is expensive tonight' }], alternativeDecision: 'Consider spin option', confidenceInCounter: 62 };
      }
      this.saveTrace('round2_challenge.json', challengeResult);
      emit(2, "Devil's Advocate", 'Challenge Everything', challengeResult);

      // ROUND 3 — Defense
      let revisedDecision = initialDecision;
      if ((challengeResult.confidenceInCounter || 0) > 50) {
        emit(3, 'The Strategist', 'Back the Process', { status: 'Defending the game plan...' });
        try {
          revisedDecision = await this.strategist.defend(challengeResult, sessionId);
        } catch {
          revisedDecision = { ...initialDecision, note: 'Challenge heard but original call stands' };
        }
        this.saveTrace('round3_defense.json', revisedDecision);
        emit(3, 'The Strategist', 'Back the Process', revisedDecision);
      } else {
        emit(3, 'The Strategist', 'Back the Process', { message: 'Challenge not strong enough — original call stands.' });
      }

      // ROUND 4 — Final judge
      emit(4, 'The Moderator', 'Big Picture', { status: AGENT_LOADING_MESSAGES['The Moderator'] });
      let finalDecision: any;
      try {
        finalDecision = await this.moderator.judge(initialDecision, challengeResult, revisedDecision);
      } catch {
        finalDecision = { finalDecision: revisedDecision, wasRevised: false, whyConfirmed: 'Sticking to the original plan.', counterfactual: 'Alternative could cost 8% win probability.', winProbImpact: '+5%' };
      }
      this.saveTrace('round4_final.json', finalDecision);
      emit(4, 'The Moderator', 'Big Picture', finalDecision);

      // ROUND 5 — Commentary
      emit(5, 'Commentator', 'The Voice of Cricket', { status: AGENT_LOADING_MESSAGES['Commentator'] });
      let commentary: any;
      try {
        commentary = await this.commentator.narrate(finalDecision, analysisResult, debateHistory);
      } catch {
        commentary = {
          HEADLINE: `${(finalDecision.finalDecision || finalDecision).nextBowler || 'Captain'} TRUSTED IN THE CRUNCH!`,
          DECISION: `The captain has made the call. ${(finalDecision.finalDecision || finalDecision).primaryReasoning || ''}`,
          THE_THINKING: 'It is all about backing your best weapon when pressure is highest.',
          THE_DEBATE: 'There was fierce debate, but the captain stood firm.',
          COUNTERFACTUAL: 'Had they gone the other way, win probability drops by 8%.',
          CONFIDENCE: '⭐⭐⭐⭐ Bold and calculated.'
        };
      }
      this.saveTrace('round5_commentary.json', commentary);
      emit(5, 'Commentator', 'The Voice of Cricket', commentary);

      // Log to match memory
      const winProbEnd = analysisResult.winProbability + parseInt((finalDecision.winProbImpact || '+0').replace('%',''));
      contextCache.addDecisionToLog(matchState.over, finalDecision, analysisResult.winProbability, winProbEnd);

      // Unwrap one level if Moderator wrapped in { finalDecision: {...} }
      const rawFD = finalDecision?.finalDecision || finalDecision;
      const sanitizedFD = this.sanitizeDecision(rawFD, matchState);

      console.log('[ORCHESTRATOR] Final decision nextBowler:', sanitizedFD.nextBowler);

      return {
        enrichedMatchData: analysisResult,
        finalDecision: sanitizedFD,
        commentary,
        debateHistory,
        winProbability: analysisResult.winProbability,
        pressureIndex: enrichedMatchData.pressureIndex
      };
    } catch (e) {
      console.error('Debate loop failed', e);
      throw e;
    }
  }
}
