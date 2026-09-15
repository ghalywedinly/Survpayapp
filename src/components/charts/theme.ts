// Shared chart palette — brand-derived, consistent across marketing and app.
// Recharts takes raw colors via props/inline styles, not Tailwind classes, so
// it can't pick up the CSS-variable dark-mode tokens automatically the way
// the rest of the UI does — getChartColors()/getTooltipStyle() below are the
// explicit light/dark switch for chart-only color values. Accent hues
// (brand/mint/amber/sky) stay identical in both themes; only what needs
// contrast against the page (grid lines, axis labels, tooltip chrome)
// changes.
export const chartColors = {
  brand: "#5b3df0",
  brandSoft: "#a89dff",
  mint: "#1cb473",
  amber: "#f2a70d",
  sky: "#0ea5e9",
  ink: "#525c70",
  grid: "#e4e6ec",
};

export const categoricalPalette = ["#5b3df0", "#22d3ee", "#1cb473", "#f2a70d", "#f472b6", "#94a3b8"];

export function getChartColors(isDark: boolean) {
  if (!isDark) return chartColors;
  return {
    ...chartColors,
    ink: "#9aa3b2", // axis/tick label color, readable against a dark page
    grid: "#262b38", // faint gridlines against a dark page
  };
}

export function getCategoricalPalette(isDark: boolean) {
  if (!isDark) return categoricalPalette;
  // Slightly brightened so the same hues keep enough contrast on a dark bg.
  return ["#8a7bff", "#22d3ee", "#3ecf8e", "#fbbf35", "#f472b6", "#9aa3b2"];
}

// Reserved status hues (response quality, NPS segments) — kept separate from
// the categorical palette above and pinned to the exact same RGB values as
// Badge's success/warning/danger tones (see globals.css --mint-content /
// --amber-content / --danger-content) so a chart segment and its matching
// badge elsewhere on the page always read as the same color.
export function getStatusColors(isDark: boolean) {
  if (!isDark) return { good: "#12744c", warning: "#d6870a", critical: "#dc2626", neutral: "#94a3b8" };
  return { good: "#78e5b0", warning: "#fbbf35", critical: "#f87171", neutral: "#8a93a6" };
}

export function getTooltipStyle(isDark: boolean) {
  return {
    borderRadius: 12,
    border: `1px solid ${isDark ? "#262b38" : "#e4e6ec"}`,
    fontSize: 12,
    background: isDark ? "#12151e" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#12151e",
  };
}
