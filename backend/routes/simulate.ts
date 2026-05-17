import express from 'express';
import { generateSimulation } from '../agents/simulationEngine';
import { generateBallNarration } from '../agents/narratorAgent';
import * as fs from 'fs';
import * as path from 'path';

const router = express.Router();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const BALL_DELAY_MS = parseInt(process.env.SIMULATION_BALL_DELAY_MS || '1200');
const DRAMATIC_DELAY_MS = parseInt(process.env.DRAMATIC_BALL_DELAY_MS || '2200');

// POST /api/simulate — generate and stream simulation via SSE
router.post('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.flushHeaders();

  const sendEvent = (eventType: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type: eventType, ...data })}\n\n`);
  };

  const { matchState, captainDecision } = req.body;

  if (!matchState || !captainDecision) {
    sendEvent('ERROR', { message: 'matchState and captainDecision are required' });
    res.end();
    return;
  }

  try {
    // Phase 1: Opening
    sendEvent('SIMULATION_START', { message: 'Peering into the future...', phase: 'opening' });
    await sleep(1200);

    // Phase 2: Generate all 3 universes
    sendEvent('GENERATING', { message: 'Gemini 2.5 is simulating 3 parallel timelines...', phase: 'generating' });

    const simulation = await generateSimulation(matchState, captainDecision);

    sendEvent('SIMULATION_READY', {
      phase: 'ready',
      message: 'All 3 universes computed — playback starting...',
      simulationMetadata: simulation.simulationMetadata
    });
    await sleep(800);

    // Phase 3: Stream each ball one by one
    for (let i = 0; i < 12; i++) {
      const ballA = simulation.universeA.balls[i];
      const ballB = simulation.universeB.balls[i];
      const ballC = simulation.universeC.balls[i];

      const isDramatic = ballA.dramaticEvent || ballB.dramaticEvent || ballC.dramaticEvent;

      // Send all 3 universe balls simultaneously
      sendEvent('BALL_UPDATE', {
        ballIndex: i,
        universeA: ballA,
        universeB: ballB,
        universeC: ballC,
        phase: 'playing'
      });

      // Generate narration for the most dramatic ball
      if (isDramatic) {
        const dramaticBall = ballA.dramaticEvent ? ballA : ballB.dramaticEvent ? ballB : ballC;
        const whichUniverse = ballA.dramaticEvent ? 'A' : ballB.dramaticEvent ? 'B' : 'C';

        const narration = await generateBallNarration(dramaticBall, matchState);
        if (narration) {
          sendEvent('NARRATION', {
            ballIndex: i,
            commentary: narration,
            universe: whichUniverse,
            ballText: dramaticBall.description
          });
        }
      }

      const delay = isDramatic ? DRAMATIC_DELAY_MS : BALL_DELAY_MS;
      await sleep(delay);
    }

    // Phase 4: Universe summaries
    sendEvent('UNIVERSE_COMPLETE', {
      summaryA: simulation.universeA.summary,
      summaryB: simulation.universeB.summary,
      summaryC: simulation.universeC.summary,
      metadata: simulation.simulationMetadata,
      phase: 'verdict'
    });

    // Save trace for demo / judges
    try {
      const traceDir = path.join(__dirname, '../../../.antigravity/traces');
      fs.mkdirSync(traceDir, { recursive: true });
      fs.writeFileSync(
        path.join(traceDir, 'war-room-latest.json'),
        JSON.stringify({ matchState, captainDecision, simulation, generatedAt: new Date().toISOString() }, null, 2)
      );
    } catch {}

    await sleep(1500);

    // Phase 5: Final verdict
    sendEvent('SIMULATION_COMPLETE', {
      winner: simulation.simulationMetadata.bestUniverse,
      winProbComparison: simulation.simulationMetadata.winProbComparison,
      recommendationValidated: simulation.simulationMetadata.recommendationValidated,
      confidenceScore: simulation.simulationMetadata.confidenceScore,
      message: 'The AI has spoken. The call is made.',
      phase: 'complete'
    });

    res.end();

  } catch (e: any) {
    console.error('[SIMULATE ROUTE]', e.message);
    sendEvent('ERROR', { message: e.message || 'Simulation failed', phase: 'error' });
    res.end();
  }
});

export default router;
