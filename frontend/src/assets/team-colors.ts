export const TEAM_COLORS: Record<string, TeamTheme> = {
  "Mumbai Indians": {
    primary: "#004BA0",
    secondary: "#FFFFFF",
    accent: "#D4AF37",
    emoji: "🔵"
  },
  "Chennai Super Kings": {
    primary: "#F5A623",
    secondary: "#1A1A2E",
    accent: "#FFFFFF",
    emoji: "🟡"
  },
  "Royal Challengers Bengaluru": {
    primary: "#CC0000",
    secondary: "#000000",
    accent: "#D4AF37",
    emoji: "🔴"
  },
  "Kolkata Knight Riders": {
    primary: "#3A225D",
    secondary: "#B3A123",
    accent: "#FFFFFF",
    emoji: "🟣"
  },
  "Sunrisers Hyderabad": {
    primary: "#FF6B00",
    secondary: "#000000",
    accent: "#FFFFFF",
    emoji: "🟠"
  },
  "Delhi Capitals": {
    primary: "#0066CC",
    secondary: "#EF1B23",
    accent: "#FFFFFF",
    emoji: "🔵"
  },
  "Rajasthan Royals": {
    primary: "#E91E8C",
    secondary: "#003B8E",
    accent: "#FFFFFF",
    emoji: "🩷"
  },
  "Punjab Kings": {
    primary: "#ED1B24",
    secondary: "#A7A9AC",
    accent: "#FFFFFF",
    emoji: "🔴"
  },
  "Gujarat Titans": {
    primary: "#1C4B82",
    secondary: "#D4AF37",
    accent: "#FFFFFF",
    emoji: "🔷"
  },
  "Lucknow Super Giants": {
    primary: "#A0E6FF",
    secondary: "#1A1A2E",
    accent: "#FF6B00",
    emoji: "🩵"
  }
};

export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  emoji: string;
}
