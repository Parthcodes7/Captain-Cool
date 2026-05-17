import { useRef, useCallback } from "react";
import { TEAM_COLORS } from "../assets/team-colors";

export interface ShareCardData {
  // Match info
  battingTeam: string;
  bowlingTeam: string;
  currentScore: number;
  wickets: number;
  over: string;
  target?: number;
  venue: string;

  // Decision
  headline: string;          // From Harsha agent — the punchy headline
  nextBowler: string;        // From Strategist decision
  winProbBefore: number;     // From Stats Analyst
  winProbAfter: number;      // From Moderator final
  confidenceStars: number;   // 1-5
  micDropQuote: string;      // Harsha's one-liner kicker

  // Debate summary
  agentsAgreed: number;      // How many of 5 agents agreed
  wasRevised: boolean;       // Did Devil's Advocate force a revision
}

export function useShareCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(
    async (data: ShareCardData): Promise<string> => {
      // Create offscreen canvas at 1080x1080
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;

      const battingTheme = TEAM_COLORS[data.battingTeam] || {
        primary: "#1A1A2E",
        secondary: "#FFFFFF",
        accent: "#FFD700",
        emoji: "🏏"
      };

      // ─── LAYER 1: BACKGROUND ─────────────────────────────

      // Deep dark base
      ctx.fillStyle = "#050A14";
      ctx.fillRect(0, 0, 1080, 1080);

      // Team color gradient — top left to center
      const bgGradient = ctx.createRadialGradient(
        200, 200, 0,
        200, 200, 700
      );
      bgGradient.addColorStop(0, battingTheme.primary + "55"); // 33% opacity
      bgGradient.addColorStop(0.6, battingTheme.primary + "15");
      bgGradient.addColorStop(1, "transparent");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Bottom right accent glow
      const accentGlow = ctx.createRadialGradient(
        900, 900, 0,
        900, 900, 400
      );
      accentGlow.addColorStop(0, battingTheme.accent + "22");
      accentGlow.addColorStop(1, "transparent");
      ctx.fillStyle = accentGlow;
      ctx.fillRect(0, 0, 1080, 1080);

      // ─── LAYER 2: CRICKET PITCH SILHOUETTE ───────────────

      // Faint oval pitch shape center-background
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.ellipse(540, 540, 280, 420, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Pitch rectangle
      ctx.fillStyle = "#8B7355";
      ctx.fillRect(490, 270, 100, 540);
      ctx.restore();

      // ─── LAYER 3: TOP SECTION — BRANDING ─────────────────

      // Captain's Call logo text
      ctx.font = "bold 32px 'Arial', sans-serif";
      ctx.fillStyle = battingTheme.accent;
      ctx.letterSpacing = "4px";
      ctx.fillText("CAPTAIN'S CALL", 60, 70);

      // Gemini badge (top right)
      ctx.font = "18px 'Arial', sans-serif";
      ctx.fillStyle = "#4285F4";
      ctx.fillText("⚡ Powered by Gemini", 780, 70);

      // Thin separator line
      ctx.strokeStyle = battingTheme.accent + "66";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 90);
      ctx.lineTo(1020, 90);
      ctx.stroke();

      // ─── LAYER 4: SCOREBOARD SECTION ─────────────────────

      // Team names row
      ctx.font = "bold 48px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(data.battingTeam.toUpperCase(), 60, 160);

      ctx.font = "28px 'Arial', sans-serif";
      ctx.fillStyle = "#AAAAAA";
      ctx.fillText(`vs ${data.bowlingTeam}`, 60, 200);

      // Big score display
      ctx.font = "bold 110px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(
        `${data.currentScore}/${data.wickets}`,
        60, 330
      );

      // Over number
      ctx.font = "bold 42px 'Arial', sans-serif";
      ctx.fillStyle = battingTheme.accent;
      ctx.fillText(`Over ${data.over}`, 60, 385);

      // Target (if 2nd innings)
      if (data.target) {
        ctx.font = "30px 'Arial', sans-serif";
        ctx.fillStyle = "#CCCCCC";
        const needed = data.target - data.currentScore;
        ctx.fillText(
          `Need ${needed} more to win`,
          60, 430
        );
      }

      // Venue
      ctx.font = "24px 'Arial', sans-serif";
      ctx.fillStyle = "#888888";
      ctx.fillText(`📍 ${data.venue}`, 60, 470);

      // ─── LAYER 5: DIVIDER ─────────────────────────────────

      const dividerY = 490;
      const dividerGrad = ctx.createLinearGradient(60, dividerY, 1020, dividerY);
      dividerGrad.addColorStop(0, battingTheme.accent);
      dividerGrad.addColorStop(0.5, "#FFFFFF");
      dividerGrad.addColorStop(1, battingTheme.primary);
      ctx.strokeStyle = dividerGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, dividerY);
      ctx.lineTo(1020, dividerY);
      ctx.stroke();

      // "THE CAPTAIN'S CALL" label
      let currentY = dividerY + 45;
      ctx.font = "bold 20px 'Arial', sans-serif";
      ctx.fillStyle = battingTheme.accent;
      ctx.letterSpacing = "6px";
      ctx.fillText("THE CAPTAIN'S CALL", 60, currentY);
      ctx.letterSpacing = "0px"; // Reset letter spacing

      // ─── LAYER 6: HEADLINE ────────────────────────────────
      currentY += 50;
      ctx.font = "bold 44px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      currentY = wrapText(ctx, data.headline, 60, currentY, 960, 56);

      // ─── LAYER 7: DECISION PILL ───────────────────────────
      currentY += 20; // Padding below headline
      const pillX = 60;
      const pillY = currentY;
      const pillW = 480;
      const pillH = 72;
      const pillR = 36;

      // Pill background
      ctx.fillStyle = battingTheme.primary + "CC";
      roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
      ctx.fill();

      // Pill border
      ctx.strokeStyle = battingTheme.accent;
      ctx.lineWidth = 2;
      roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
      ctx.stroke();

      // Pill text
      ctx.font = "bold 26px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      let bowlerText = `🎳 ${data.nextBowler} bowls next`;
      if(ctx.measureText(bowlerText).width > 420) {
        bowlerText = `🎳 ${data.nextBowler.substring(0, 18)}... next`;
      }
      ctx.fillText(bowlerText, 90, pillY + 46);

      // ─── LAYER 8: WIN PROBABILITY ─────────────────────────
      const probX = 620;
      const probY = currentY;

      ctx.font = "20px 'Arial', sans-serif";
      ctx.fillStyle = "#AAAAAA";
      ctx.fillText("WIN PROBABILITY", probX, probY + 10);

      // Before arrow After
      ctx.font = "bold 48px 'Arial', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`${data.winProbBefore}%`, probX, probY + 60);

      ctx.font = "bold 32px 'Arial', sans-serif";
      ctx.fillStyle = battingTheme.accent;
      ctx.fillText("→", probX + 110, probY + 56);

      const delta = data.winProbAfter - data.winProbBefore;
      ctx.font = "bold 48px 'Arial', sans-serif";
      ctx.fillStyle = delta >= 0 ? "#00FF88" : "#FF3B3B";
      ctx.fillText(`${data.winProbAfter}%`, probX + 160, probY + 60);

      // Delta badge
      ctx.font = "bold 22px 'Arial', sans-serif";
      ctx.fillStyle = delta >= 0 ? "#00FF88" : "#FF3B3B";
      ctx.fillText(
        `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}%`,
        probX + 160,
        probY + 92
      );

      // ─── LAYER 9: CONFIDENCE STARS ───────────────────────
      currentY += 140; // Push down past Pill and WinProb

      const starsY = currentY;
      ctx.font = "20px 'Arial', sans-serif";
      ctx.fillStyle = "#AAAAAA";
      ctx.fillText("AI CONFIDENCE", 60, starsY);

      for (let i = 0; i < 5; i++) {
        ctx.font = "34px 'Arial', sans-serif";
        ctx.fillStyle = i < data.confidenceStars
          ? battingTheme.accent
          : "#333333";
        ctx.fillText("★", 60 + i * 44, starsY + 40);
      }

      // ─── LAYER 10: AGENT CONSENSUS ────────────────────────
      ctx.font = "20px 'Arial', sans-serif";
      ctx.fillStyle = "#AAAAAA";
      ctx.fillText("AGENT CONSENSUS", 360, starsY);

      const agentEmojis = ["📊", "🧊", "🔥", "⚖️", "🎙️"];
      agentEmojis.forEach((emoji, i) => {
        const dotX = 360 + i * 50;
        const dotY = starsY + 16;

        // Circle background
        ctx.beginPath();
        ctx.arc(dotX + 16, dotY + 12, 18, 0, Math.PI * 2);
        ctx.fillStyle = i < data.agentsAgreed
          ? "#00FF88" + "44"
          : "#333333";
        ctx.fill();
        ctx.strokeStyle = i < data.agentsAgreed ? "#00FF88" : "#555555";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Emoji
        ctx.font = "18px 'Arial', sans-serif";
        ctx.fillText(emoji, dotX + 6, dotY + 20);
      });

      // Revised badge
      if (data.wasRevised) {
        ctx.font = "bold 18px 'Arial', sans-serif";
        ctx.fillStyle = "#FF6B00";
        ctx.fillText("⚔️ Decision was revised after debate", 360, starsY + 64);
      }

      // ─── LAYER 11: MIC DROP QUOTE ─────────────────────────
      currentY += 100;
      
      // Ensure we don't bleed too far into footer
      if (currentY > 930) currentY = 930;

      ctx.font = "italic 26px 'Georgia', serif";
      ctx.fillStyle = battingTheme.accent + "CC";
      wrapText(ctx, `"${data.micDropQuote}"`, 60, currentY, 960, 36);

      // ─── LAYER 12: FOOTER ─────────────────────────────────

      // Footer separator
      ctx.strokeStyle = "#FFFFFF22";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 1010);
      ctx.lineTo(1020, 1010);
      ctx.stroke();

      // Left: app name
      ctx.font = "bold 20px 'Arial', sans-serif";
      ctx.fillStyle = "#666666";
      ctx.fillText("captainscall.app", 60, 1050);

      // Center: hashtag
      ctx.font = "bold 20px 'Arial', sans-serif";
      ctx.fillStyle = battingTheme.accent;
      ctx.fillText("#CaptainsCall #IPL #GeminiAI", 370, 1050);

      // Right: GDG
      ctx.font = "20px 'Arial', sans-serif";
      ctx.fillStyle = "#4285F4";
      ctx.fillText("Built at GDG Hackathon", 800, 1050);

      return canvas.toDataURL("image/png", 1.0);
    },
    []
  );

  return { generateCard, canvasRef };
}

// ─── CANVAS HELPERS ──────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
