/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ipl-navy': '#0f172a',
        'ipl-orange': '#f97316',
        'ipl-gold': '#fbbf24',
        'ipl-neon': '#4ade80'
      }
    },
  },
  plugins: [],
}
