import { Type, FunctionDeclaration, Schema } from '@google/genai';

// TOOL 1 — fetchLiveMatchData
export const fetchLiveMatchDataTool: FunctionDeclaration = {
  name: 'fetchLiveMatchData',
  description: 'Scrapes live match data from a Cricbuzz or ESPNCricinfo URL using Gemini URL context tool. Falls back to mock data if no URL provided.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING, description: 'Optional live match URL from Cricbuzz or ESPNCricinfo' },
      matchId: { type: Type.STRING, description: 'Optional match ID' }
    }
  } as Schema
};

export const fetchLiveMatchData = async (args: { url?: string; matchId?: string }) => {
  // In a real implementation using Gemini's URL context tool, the agent would fetch this itself.
  // Here we mock the behavior or simulate fetching if a URL is provided.
  console.log(`[TOOL] fetchLiveMatchData called with URL: ${args.url}`);
  return {
    currentScore: 152,
    wickets: 5,
    overs: 16.2,
    recentBalls: "4 1 W 6 4 1",
    batters: [
      { name: "Hardik Pandya", runs: 34, balls: 18 },
      { name: "Tim David", runs: 12, balls: 8 }
    ],
    bowlers: [
      { name: "Matheesha Pathirana", overs: 3, runs: 28, wickets: 2 }
    ]
  };
};

// TOOL 2 — calculateWinProbability
export const calculateWinProbabilityTool: FunctionDeclaration = {
  name: 'calculateWinProbability',
  description: 'Duckworth-Lewis inspired win probability model',
  parameters: {
    type: Type.OBJECT,
    properties: {
      target: { type: Type.NUMBER },
      currentScore: { type: Type.NUMBER },
      wickets: { type: Type.NUMBER },
      oversLeft: { type: Type.NUMBER },
      venue: { type: Type.STRING },
      pitchType: { type: Type.STRING },
      dewFactor: { type: Type.STRING },
      recentRunRate: { type: Type.NUMBER },
      requiredRunRate: { type: Type.NUMBER }
    },
    required: ["currentScore", "wickets", "oversLeft", "requiredRunRate"]
  } as Schema
};

export const calculateWinProbability = async (args: any) => {
  const { currentScore, wickets, oversLeft, requiredRunRate } = args;
  const scoreFactor = currentScore * 0.05;
  const wicketFactor = (10 - wickets) * 0.5;
  const rrFactor = (10 - requiredRunRate) * 0.8;
  const phaseFactor = oversLeft * 0.2;
  const venueFactor = 1.0;
  
  const z = scoreFactor + wicketFactor + rrFactor + phaseFactor + venueFactor;
  // logistic regression approximation
  const winProb = 1 / (1 + Math.exp(-z));
  
  return {
    winProbability: Math.round(winProb * 100),
    confidence: 85,
    keyFactors: [
      `Required run rate is ${requiredRunRate}`,
      `${wickets} wickets lost limits acceleration`,
      `Overs remaining: ${oversLeft}`
    ]
  };
};

// TOOL 3 — getBowlerStats
export const getBowlerStatsTool: FunctionDeclaration = {
  name: 'getBowlerStats',
  description: 'Returns a bowler\'s T20/IPL career stats against current batter',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bowlerName: { type: Type.STRING },
      batterName: { type: Type.STRING },
      pitchType: { type: Type.STRING },
      phase: { type: Type.STRING }
    },
    required: ["bowlerName", "batterName"]
  } as Schema
};

export const getBowlerStats = async (args: any) => {
  // Mocked database lookup
  const { bowlerName, batterName } = args;
  
  const statsDb: any = {
    "Deepak Chahar": { economy: 7.2, avg: 25.4, dotBallPct: 40, boundaryPct: 15 },
    "Ravindra Jadeja": { economy: 8.1, avg: 28.2, dotBallPct: 35, boundaryPct: 18 },
    "Matheesha Pathirana": { economy: 9.4, avg: 19.5, dotBallPct: 45, boundaryPct: 20 },
    "Tushar Deshpande": { economy: 11.2, avg: 32.1, dotBallPct: 30, boundaryPct: 25 }
  };
  
  return {
    stats: statsDb[bowlerName] || { economy: 8.5, avg: 25.0, dotBallPct: 35, boundaryPct: 15 },
    matchup: {
      runs: 45,
      balls: 30,
      dismissals: 2,
      strikeRate: 150.0
    }
  };
};

// TOOL 4 — getWeatherAndDew
export const getWeatherAndDewTool: FunctionDeclaration = {
  name: 'getWeatherAndDew',
  description: 'Returns dew factor and weather for a given venue and time',
  parameters: {
    type: Type.OBJECT,
    properties: {
      venue: { type: Type.STRING },
      matchTime: { type: Type.STRING }
    },
    required: ["venue"]
  } as Schema
};

export const getWeatherAndDew = async (args: any) => {
  try {
    // We would use open-meteo here, mocking for reliability in demo
    // e.g. Wankhede coordinates
    // const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=18.92&longitude=72.82&hourly=dewpoint_2m,relative_humidity_2m`);
    return {
      dewFactor: 0.8, // 0-1 scale
      humidity: 75,
      temperature: 28,
      condition: "heavy dew likely in 2nd innings"
    };
  } catch (error) {
    return { dewFactor: 0.5, humidity: 60, temperature: 30, condition: "unknown" };
  }
};

// TOOL 5 — getFieldPlacementSuggestion
export const getFieldPlacementSuggestionTool: FunctionDeclaration = {
  name: 'getFieldPlacementSuggestion',
  description: 'Returns optimal field placements given batter stats and game phase',
  parameters: {
    type: Type.OBJECT,
    properties: {
      batterName: { type: Type.STRING },
      bowlerType: { type: Type.STRING },
      phase: { type: Type.STRING },
      wagonWheelData: { type: Type.STRING }
    },
    required: ["batterName", "phase"]
  } as Schema
};

export const getFieldPlacementSuggestion = async (args: any) => {
  return {
    positions: [
      { role: "Wicketkeeper", name: "MS Dhoni", x: 50, y: 10 },
      { role: "Slip", name: "Daryl Mitchell", x: 45, y: 15 },
      { role: "Third Man", name: "Mustafizur", x: 30, y: 20 },
      { role: "Deep Point", name: "Ravindra Jadeja", x: 15, y: 50 },
      { role: "Cover", name: "Ruturaj Gaikwad", x: 30, y: 60 },
      { role: "Mid Off", name: "Ajinkya Rahane", x: 45, y: 70 },
      { role: "Mid On", name: "Moeen Ali", x: 55, y: 70 },
      { role: "Deep Mid Wicket", name: "Shivam Dube", x: 80, y: 50 },
      { role: "Deep Square Leg", name: "Rachin Ravindra", x: 85, y: 35 },
      { role: "Fine Leg", name: "Tushar Deshpande", x: 70, y: 20 },
      { role: "Bowler", name: "Matheesha Pathirana", x: 50, y: 60 }
    ],
    reasoning: "Protecting the boundaries on the leg side where Hardik is strong, deep point for the wide yorkers."
  };
};

export const availableToolsMap: Record<string, Function> = {
  fetchLiveMatchData,
  calculateWinProbability,
  getBowlerStats,
  getWeatherAndDew,
  getFieldPlacementSuggestion
};
