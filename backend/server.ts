import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { DebateOrchestrator } from './orchestrator/debateLoop';
import { fetchLiveMatchData } from './tools';
import analyzeScorecardRouter from './routes/analyzeScorecard';
import toolsRouter from './routes/tools';
import simulateRouter from './routes/simulate';

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '20mb' }));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GOOGLE_AI_API_KEY || '';

if (!API_KEY) console.warn("WARNING: GOOGLE_AI_API_KEY not set");

const orchestrator = new DebateOrchestrator(API_KEY);

const matchStateSchema = z.object({
  innings: z.union([z.literal(1), z.literal(2)]),
  over: z.number().min(0).max(19),
  ball: z.number().min(0).max(5),
  battingTeam: z.string(),
  bowlingTeam: z.string(),
  currentScore: z.number(),
  wickets: z.number(),
  onStrikeBatter: z.string(),
  nonStrikeBatter: z.string(),
  bowlers: z.array(z.object({ name: z.string(), oversUsed: z.number(), economy: z.number() })),
  pitchType: z.enum(["turning", "flat", "two-paced", "bouncy"]),
  dewFactor: z.enum(["none", "light", "heavy"]),
  venue: z.string(),
  target: z.number().optional(),
  impactPlayerAvailable: z.boolean(),
  impactPlayerName: z.string().optional().nullable(),
  strategicTimeoutUsed: z.boolean(),
  recentBalls: z.string(),
  cricbuzzUrl: z.string().optional()
});

// ——— Routes ———
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '2.0', google_stack: ['gemini-2.5-flash', 'google-search', 'url-context', 'function-calling'] }));

app.post('/api/scrape', async (req, res) => {
  try {
    const data = await fetchLiveMatchData({ url: req.body.url });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Enhancement 1: Gemini Vision Scorecard Reader
app.use('/api/analyze-scorecard', analyzeScorecardRouter);

// Enhancement 7: Live Tools (weather, win-probability, h2h, grounded search)
app.use('/api/tools', toolsRouter);

// WAR ROOM: 3-universe simulation streaming endpoint
app.use('/api/simulate', simulateRouter);

// Core: SSE Streaming Debate
app.post('/api/analyze', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');

  try {
    const matchState = matchStateSchema.parse(req.body);

    const result = await orchestrator.runDebate(matchState, (event) => {
      res.write(`data: ${JSON.stringify({ type: 'EVENT', event })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: 'DONE', result })}\n\n`);
    res.end();

  } catch (e: any) {
    console.error('API Error:', e);
    const errMsg = e.errors ? JSON.stringify(e.errors) : e.message;
    if (!res.headersSent) {
      res.status(400).json({ error: errMsg });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'ERROR', error: errMsg })}\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`\n🏏 Captain's Call backend running on port ${PORT}`);
  console.log(`   → Gemini Vision:   POST /api/analyze-scorecard`);
  console.log(`   → Live Tools:      GET  /api/tools/weather?venue=...`);
  console.log(`   → Debate Stream:   POST /api/analyze  (SSE)\n`);
});
