import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kementan: {
          forest: {
            950: "#022c22",
            900: "#064e3b",
            800: "#065f46",
            700: "#047857",
            600: "#059669",
            500: "#10b981",
            400: "#34d399",
            100: "#d1fae5",
            50: "#ecfdf5",
          },
          gold: {
            900: "#78350f",
            800: "#92400e",
            700: "#b45309",
            600: "#d97706",
            500: "#f59e0b",
            400: "#fbbf24",
            100: "#fef3c7",
            50: "#fffbeb",
          },
          earth: {
            800: "#451a03",
            700: "#78350f",
            600: "#92400e",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
