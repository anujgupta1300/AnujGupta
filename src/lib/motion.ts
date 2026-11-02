// Shared motion + brand tokens for the cinematic portfolio rebuild.
// All values trace back to the Anuj Gupta brand token spec.

import type { CSSProperties } from "react";
import type { Variants, Transition } from "motion/react";

// ---- Brand colors (tinted neutrals, single yellow accent) ----
export const COLORS = {
  black: "#0a0a0a",
  white: "#fafafa",
  surface: "#F3F4F6",
  border: "#E5E7EB",
  yellow: "#EAB308",
  gold: "#FFBA49",
  indigo: "#818CF8",
  cyan: "#00B3DC",
  red: "#C92A2A",
  textPrimary: "#0a0a0a",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  cardGray: "#4B5563",
  surfaceDark: "#363636",
} as const;

// ---- Radius scale: only 0, 6, 10, 24 ----
export const RADIUS = { sm: 6, md: 10, lg: 24 } as const;

// Body font; headings use Space Grotesk via the --font-heading CSS var.
export const FONT_STACK =
  "'DM Sans', system-ui, -apple-system, sans-serif";
export const HEADING_FONT = "'Space Grotesk', system-ui, sans-serif";

// ---- Spring presets ----
export const spring: Transition = { type: "spring", stiffness: 120, damping: 16 };
export const snappySpring: Transition = { type: "spring", stiffness: 260, damping: 20 };
export const cinematicSpring: Transition = { type: "spring", stiffness: 70, damping: 18 };
// About-section entrance: a touch firmer than cinematic, no overshoot.
export const aboutSpring: Transition = { type: "spring", stiffness: 80, damping: 18 };

// ---- Reusable entrance variants ----
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring, delay: i * 0.1 },
  }),
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// Easing used for the loading-screen slide-off
export const exitEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

// Cyan-led gradient accent used on premium borders / highlights.
export const ACCENT_GRADIENT = "linear-gradient(135deg, #00B3DC 0%, #6AA8FF 50%, #818CF8 100%)";

// Premium glass surface presets (dark glassmorphism that floats over any section).
export const glassDark: CSSProperties = {
  background: "rgba(15,15,20,0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)",
};

export const glassLight: CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.7)",
  boxShadow: "0 20px 50px -24px rgba(10,10,10,0.18)",
};
