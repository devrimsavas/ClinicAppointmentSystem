// tailwind.config.ts
// A small, calm palette taken from the NovaMed logo:
// navy for text and actions, warm sand background, white cards, and two soft accents.
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f3570", // logo navy: headings, buttons, links
          hover: "#0a2754",
          soft: "#e4ebf5", // light navy tint: active nav, table headers
        },
        ink: "#1c2430", // body text
        muted: "#5d6876", // secondary text
        sand: "#f3efe9", // page background
        line: "#e3ddd3", // borders
        mint: "#d6efe4", // accent (logo green, pastel)
        sky: "#dcebf5", // accent (logo blue, pastel)
        danger: "#b42318",
        success: "#1e7a52",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
