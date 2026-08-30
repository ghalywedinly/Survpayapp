import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dde1e8",
          300: "#c3c9d4",
          400: "#9aa3b2",
          500: "#717c8f",
          600: "#525c70",
          700: "#3b4356",
          800: "#242a38",
          900: "#12151e",
          950: "#0a0c12",
        },
        brand: {
          50: "#f1f0ff",
          100: "#e4e1ff",
          200: "#ccc6ff",
          300: "#a89dff",
          400: "#8a7bff",
          500: "#6f57ff",
          600: "#5b3df0",
          700: "#4c2fd6",
          800: "#3f28ac",
          900: "#352589",
          950: "#211653",
        },
        mint: {
          50: "#eefdf5",
          100: "#d6fae6",
          200: "#b0f2cf",
          300: "#78e5b0",
          400: "#3ecf8e",
          500: "#1cb473",
          600: "#12925c",
          700: "#12744c",
          800: "#135c3f",
          900: "#124c36",
        },
        amber: {
          50: "#fffbeb",
          400: "#fbbf35",
          500: "#f2a70d",
          600: "#d6870a",
        },
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(18 21 30 / 0.04), 0 1px 6px -2px rgb(18 21 30 / 0.06)",
        card: "0 1px 3px 0 rgb(18 21 30 / 0.06), 0 8px 24px -8px rgb(18 21 30 / 0.10)",
        pop: "0 12px 40px -12px rgb(18 21 30 / 0.22)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-in": "fade-in .4s ease-out",
        "slide-up": "slide-up .5s cubic-bezier(.16,1,.3,1)",
        shimmer: "shimmer 1.8s linear infinite",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(18 21 30 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(18 21 30 / 0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
