import { useState, useEffect, useRef, useCallback } from 'react';

export interface SimBall {
  ball: number; over: number; ballInOver: number;
  bowler: string; batter: string;
  outcome: string; runs: number; description: string;
  cumulativeScore: number; cumulativeWickets: number;
  winProbability: number; momentum: string;
  dramaticEvent: boolean; crowdReaction: string;
}

export interface UniverseSummary {
  finalScore: string; finalWickets: number; finalWinProbability: number;
  universeVerdict: string; keyMoment: number; captainRating: string;
}

export interface SimState {
  phase: 'idle' | 'opening' | 'generating' | 'playing' | 'verdict' | 'complete' | 'error';
  message: string;
  ballsA: SimBall[]; ballsB: SimBall[]; ballsC: SimBall[];
  summaryA: UniverseSummary | null; summaryB: UniverseSummary | null; summaryC: UniverseSummary | null;
  narrations: Array<{ ballIndex: number; commentary: any; universe: string; ballText: string }>;
  metadata: any | null;
  error: string | null;
}

const initialState: SimState = {
  phase: 'idle', message: '', ballsA: [], ballsB: [], ballsC: [],
  summaryA: null, summaryB: null, summaryC: null, narrations: [],
  metadata: null, error: null
};

export function useSimulationStream() {
  const [simState, setSimState] = useState<SimState>(initialState);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const startSimulation = useCallback(async (matchState: any, captainDecision: any) => {
    // Abort any previous stream
    if (readerRef.current) { try { await readerRef.current.cancel(); } catch {} }

    setSimState({ ...initialState, phase: 'opening', message: 'Peering into the future...' });

    try {
      const response = await fetch('http://localhost:3001/api/simulate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchState, captainDecision })
      });

      if (!response.body) throw new Error('No stream body from server');
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(part.substring(6));
            setSimState(prev => processEvent(prev, event));
          } catch { /* partial chunk */ }
        }
      }
    } catch (e: any) {
      setSimState(prev => ({ ...prev, phase: 'error', error: e.message }));
    }
  }, []);

  const reset = useCallback(() => setSimState(initialState), []);

  return { simState, startSimulation, reset };
}

function processEvent(prev: SimState, event: any): SimState {
  switch (event.type) {
    case 'SIMULATION_START':
      return { ...prev, phase: 'opening', message: event.message };
    case 'GENERATING':
      return { ...prev, phase: 'generating', message: event.message };
    case 'SIMULATION_READY':
      return { ...prev, message: event.message, metadata: event.simulationMetadata };
    case 'BALL_UPDATE':
      return {
        ...prev,
        phase: 'playing',
        ballsA: event.universeA ? [...prev.ballsA, event.universeA] : prev.ballsA,
        ballsB: event.universeB ? [...prev.ballsB, event.universeB] : prev.ballsB,
        ballsC: event.universeC ? [...prev.ballsC, event.universeC] : prev.ballsC
      };
    case 'NARRATION':
      return { ...prev, narrations: [...prev.narrations, { ballIndex: event.ballIndex, commentary: event.commentary, universe: event.universe, ballText: event.ballText }] };
    case 'UNIVERSE_COMPLETE':
      return { ...prev, phase: 'verdict', summaryA: event.summaryA, summaryB: event.summaryB, summaryC: event.summaryC, metadata: event.metadata };
    case 'SIMULATION_COMPLETE':
      return { ...prev, phase: 'complete', message: event.message };
    case 'ERROR':
      return { ...prev, phase: 'error', error: event.message };
    default:
      return prev;
  }
}
