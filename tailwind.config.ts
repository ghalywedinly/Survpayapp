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
        // ink, and the -50/-100 tint of brand/mint/amber, are CSS-variable
        // backed (see globals.css :root / .dark) so every existing
        // text-ink-*/border-ink-*/bg-ink-{50,100,200}/bg-brand-50 etc. call
        // site automatically flips for dark mode with no per-component
        // changes. Mid/high saturation shades (brand-500+, mint-500+, ...)
        // stay literal — they're saturated enough to read on both themes.
        // A handful of call sites intentionally use *fixed*, non-reactive
        // dark surfaces (buttons, code blocks, scrims, decorative dark
        // panels) — those use literal hex (e.g. bg-[#12151e]) instead of
        // this token, on purpose, so they don't invert.
        ink: {
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          950: "rgb(var(--ink-950) / <alpha-value>)",
        },
        surface: "rgb(var(--surface) / <alpha-value>)",
        page: "rgb(var(--page) / <alpha-value>)",
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
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
          50: "rgb(var(--mint-50) / <alpha-value>)",
          100: "rgb(var(--mint-100) / <alpha-value>)",
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
          50: "rgb(var(--amber-50) / <alpha-value>)",
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
