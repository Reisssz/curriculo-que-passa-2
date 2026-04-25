import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green:     "#5CBF15",
          "green-light": "#AAF277",
          "green-pale":  "#DBF2C4",
          orange:    "#F2994B",
          offwhite:  "#F2F2F2",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "spin-slow":    "spin 3s linear infinite",
        "fade-up":      "fadeUp 0.6s ease forwards",
        "fade-in":      "fadeIn 0.4s ease forwards",
        "pulse-green":  "pulseGreen 2s ease-in-out infinite",
        "score-ring":   "scoreRing 1.2s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(92,191,21,0.4)" },
          "50%":       { boxShadow: "0 0 0 12px rgba(92,191,21,0)" },
        },
        scoreRing: {
          from: { strokeDashoffset: "339" },
          to:   { strokeDashoffset: "var(--target-offset)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
