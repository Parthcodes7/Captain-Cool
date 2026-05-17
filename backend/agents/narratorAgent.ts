import { GoogleGenAI } from '@google/genai';
import type { SimulatedBall } from './simulationEngine';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

export interface BallNarration {
  shortCallout: string;
  fullCommentary: string;
  emotionTag: 'ecstatic' | 'shocked' | 'tense' | 'relieved' | 'devastated';
  soundEffect: 'crowd_roar' | 'crowd_groan' | 'gasps' | 'silence' | 'applause';
}

export async function generateBallNarration(ball: SimulatedBall, matchContext: any): Promise<BallNarration | null> {
  // Only narrate truly dramatic events to conserve quota
  if (!ball.dramaticEvent && ball.outcome !== 'W' && ball.outcome !== '6') return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Harsha Bhogle commentating a SIMULATED future ball in real time.
Narrate it as if it is happening RIGHT NOW, live on air. This is a prediction — make it feel prophetic and cinematic.

Ball details:
- Outcome: ${ball.outcome}
- Bowler: ${ball.bowler}
- Batter: ${ball.batter}
- Over: ${ball.over}.${ball.ballInOver}
- Cumulative score: ${ball.cumulativeScore}/${ball.cumulativeWickets}
- Win probability at this moment: ${ball.winProbability}%
- Description: ${ball.description}

Match context: ${JSON.stringify(matchContext)}

Generate JSON with exactly these keys:
{
  "shortCallout": "string — 5 words max, ALL CAPS, punchy (SIX! INTO THE STANDS!, GONE! CLEAN BOWLED!)",
  "fullCommentary": "string — 2 vivid, specific sentences. Use cricket idioms. Mention player names. Pure Harsha style.",
  "emotionTag": "ecstatic"|"shocked"|"tense"|"relieved"|"devastated",
  "soundEffect": "crowd_roar"|"crowd_groan"|"gasps"|"silence"|"applause"
}`,
      config: { responseMimeType: 'application/json', temperature: 0.9 }
    });

    return JSON.parse(response.text || '{}') as BallNarration;
  } catch (e: any) {
    console.error('[NARRATOR] Failed to generate narration:', e.message);
    const fallbacks: Record<string, BallNarration> = {
      '6': { shortCallout: 'SIX! ENORMOUS SHOT!', fullCommentary: `${ball.batter} has absolutely LAUNCHED that into the stands! ${ball.bowler} cannot believe it — that sailed over long-on like it was hit into orbit!`, emotionTag: 'ecstatic', soundEffect: 'crowd_roar' },
      'W': { shortCallout: 'OUT! BIG WICKET!', fullCommentary: `${ball.batter} has to go! ${ball.bowler} strikes at the crucial moment — that is the wicket that could change everything in this match!`, emotionTag: 'shocked', soundEffect: 'gasps' },
      '4': { shortCallout: 'FOUR! BEAUTIFUL STROKE!', fullCommentary: `${ball.batter} strokes it beautifully through the covers — ${ball.bowler} had no answer for that timing. Four runs and the crowd is on its feet!`, emotionTag: 'ecstatic', soundEffect: 'applause' }
    };
    return fallbacks[ball.outcome] || null;
  }
}

export async function synthesizeNarration(text: string): Promise<string | null> {
  // Use Web Speech API on frontend instead — Google TTS requires billing-enabled key
  // Return null to signal frontend to use browser TTS as fallback
  // If you have a billing-enabled key, uncomment below:
  /*
  try {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.15,
            pitch: 1.0,
            effectsProfileId: ['large-home-entertainment-class-device']
          }
        })
      }
    );
    const data = await ttsResponse.json();
    if (data.audioContent) return data.audioContent; // base64 MP3
  } catch (e: any) {
    console.warn('[TTS] Cloud TTS failed, using browser fallback:', e.message);
  }
  */
  return null; // Frontend will use Web Speech API
}
