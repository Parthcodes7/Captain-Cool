import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || '' });

// POST /api/analyze-scorecard
router.post('/', upload.single('scorecard'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    let mimeType = req.file.mimetype;
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

    console.log(`[TOOL] analyzeScorecard | ${mimeType} | ${req.file.size} bytes`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: { mimeType, data: base64Image }
            },
            {
              text: `You are a cricket scorecard OCR expert. Read every visible number and name from this scorecard image.
Extract: innings number, current over and ball, batting team name, bowling team name, total runs, wickets fallen,
batter on strike with runs and balls faced, non-striker with runs and balls,
each bowler with overs bowled and economy rate, target if 2nd innings, last 6 balls bowled as a space-separated string.

Return ONLY a valid JSON object. No explanation. No markdown fences.
Schema:
{
  "innings": 1 or 2,
  "over": number (0-19),
  "ball": number (0-5),
  "battingTeam": string,
  "bowlingTeam": string,
  "currentScore": number,
  "wickets": number,
  "onStrikeBatter": string,
  "nonStrikeBatter": string,
  "bowlers": [{"name": string, "oversUsed": number, "economy": number}],
  "target": number or null,
  "recentBalls": string (e.g. "4 1 W 6 4 1"),
  "venue": string or null,
  "pitchType": "flat",
  "dewFactor": "none",
  "impactPlayerAvailable": false,
  "impactPlayerName": null,
  "strategicTimeoutUsed": false
}`
            }
          ]
        }
      ],
      config: { responseMimeType: 'application/json' }
    });

    const elapsed = Date.now() - startTime;
    const raw = response.text || '{}';
    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    console.log(`[TOOL] analyzeScorecard | OK | ${elapsed}ms`);
    res.json({ success: true, matchState: parsed, elapsed });

  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[TOOL] analyzeScorecard | ERROR | ${elapsed}ms |`, err.message);
    res.status(500).json({ error: err.message || 'Vision analysis failed', elapsed });
  }
});

export default router;
