import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        display: ["var(--font-silkscreen)", "sans-serif"],
        mono: ["monospace"],
      },
      colors: {
        primary: {
          50: "#EBEAFC",
          100: "#D6D5F8",
          200: "#ADAAF2",
          300: "#8580EB",
          400: "#5C55E5",
          500: "#3730A3", // Base
          600: "#2D2782",
          700: "#221E62",
          800: "#161441",
          900: "#0B0A21",
          950: "#050510",
        },
        secondary: {
          50: "#DFFBF9",
          100: "#BEF7F3",
          200: "#7DEFE8",
          300: "#3DE7DC",
          400: "#14B8AD",
          500: "#0F766E", // Base
          600: "#0C5E58",
          700: "#094742",
          800: "#062F2C",
          900: "#031816",
          950: "#010C0B",
        },
        accent: {
          50: "#FBECFD",
          100: "#F7D9FB",
          200: "#F0B3F8",
          300: "#E88DF4",
          400: "#DB4AEE",
          500: "#C026D3", // Base
          600: "#9C13AD",
          700: "#750F82",
          800: "#4E0A56",
          900: "#27052B",
          950: "#140315",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "text-reveal":
          "text-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards",
      },
      keyframes: {
        "text-reveal": {
          "0%": {
            transform: "translate(0, 100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
