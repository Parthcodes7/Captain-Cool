import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

interface MatchProfile {
  battingTeam: string;
  bowlingTeam: string;
  venue: string;
}

interface CachedSession {
  cacheName: string;
  createdAt: number;
  matchProfile: MatchProfile;
}

// In-memory cache registry
const activeCaches: Map<string, CachedSession> = new Map();

const MATCH_CONTEXT_TEMPLATE = (profile: MatchProfile) => `
You are an AI cricket strategy engine with deep knowledge of IPL 2024-25.

=== MATCH PROFILE ===
Batting Team: ${profile.battingTeam}
Bowling Team: ${profile.bowlingTeam}
Venue: ${profile.venue}

=== TEAM SQUADS & PLAYER PROFILES ===

MUMBAI INDIANS KEY PLAYERS:
- Rohit Sharma: Aggressive opener. SR: 132. Loves straight hits early.
- Ishan Kishan: Left-hand power. Strong on leg side. SR: 136 in PP.
- Suryakumar Yadav: 360-degree batter. SR: 166. Elite in middle overs.
- Hardik Pandya: Power hitter. SR: 147. Targets mid-on and square leg.
- Tim David: Finisher. SR: 158 in death. Hits over extra cover and long-on.
- Jasprit Bumrah: Best death bowler in IPL. Economy 6.8. yorker specialist.
- Suryakumar Yadav: Boundary % 62% in power. Target for spin.

CHENNAI SUPER KINGS KEY PLAYERS:
- Ruturaj Gaikwad: Elegant opener. SR: 127. Technically sound. 
- Devon Conway: Consistent. Left-hand. SR: 131.
- Ajinkya Rahane: Middle order anchor.
- MS Dhoni: Finisher. SR: 174 in last 2 overs.
- Ravindra Jadeja: All-rounder. Economy 8.1. Dangerous with bat.
- Deepak Chahar: Swing specialist. Economy 7.2. PP master.
- Matheesha Pathirana: Slingy action. Economy 9.4. Death specialist. 
- Tushar Deshpande: Expensive (11.2 econ) but takes wickets.

=== VENUE HISTORY: ${profile.venue} ===
Average First Innings: 182 runs
Average Second Innings: 174 runs
Chase Win %: 47%
Pitch Notes: Good batting surface. Heavy dew post over 14 favours chasing team.

=== IPL 2024-25 KEY STATS ===
Best death bowler economy (overs 17-20): Bumrah 6.4, Pathirana 9.1, Chahar 9.8
Highest pressure index achieved: Hardik Pandya (92/100 against pace)
Best 3rd innings RRR achieved: 18.6 (LSG vs RCB, 2024)

=== TACTICAL PRINCIPLES ===
- In death overs (17-20): pace > spin on flat pitches
- Dew factor > 0.7: spinners become ineffective, batters advantage
- Pressure index > 85: batters tend to go for broke, more wicket chances
- Momentum: last 3 overs RR vs match avg determines batting momentum

You will receive real-time match state updates. Reference this context for all decisions.
`;

export class ContextCacheService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  getOrCreate(matchKey: string, profile: MatchProfile): string {
    const existing = activeCaches.get(matchKey);
    if (existing && Date.now() - existing.createdAt < 3600 * 1000) {
      console.log(`[CACHE] Reusing cache for ${matchKey}`);
      return existing.cacheName;
    }
    // Register new "virtual" cache (Context Caching API requires specific model versions)
    const cacheName = `captains-call-${matchKey}-${Date.now()}`;
    activeCaches.set(matchKey, { cacheName, createdAt: Date.now(), matchProfile: profile });
    console.log(`[CACHE] Created new session for ${matchKey}`);
    return cacheName;
  }

  getContextDocument(profile: MatchProfile): string {
    return MATCH_CONTEXT_TEMPLATE(profile);
  }

  // Match log for the "Coach's Notebook"
  private matchLog: any[] = [];

  addDecisionToLog(over: number, decision: any, winProbBefore: number, winProbAfter: number) {
    this.matchLog.push({
      over,
      decision,
      winProbBefore,
      winProbAfter,
      delta: winProbAfter - winProbBefore,
      timestamp: new Date().toISOString()
    });
    this.saveLog();
  }

  getMatchLog() { return this.matchLog; }

  private saveLog() {
    const traceDir = path.join(__dirname, '../../.antigravity/traces');
    if (!fs.existsSync(traceDir)) fs.mkdirSync(traceDir, { recursive: true });
    fs.writeFileSync(path.join(traceDir, 'match_log.json'), JSON.stringify(this.matchLog, null, 2));
  }
}

export const contextCache = new ContextCacheService(process.env.GOOGLE_AI_API_KEY || '');
