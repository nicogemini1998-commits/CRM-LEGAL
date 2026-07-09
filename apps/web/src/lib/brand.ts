// Cliender official brand tokens — single source of truth for IURALEX
// Do NOT use other purples (violet-600, indigo, purple-*). Only CLIENDER.purple for primary actions.

export const CLIENDER = {
  purple: '#8F7EE9',          // Primary CTA / Cliender Purple (CSS)
  purpleSvg: '#927EEC',       // Reserved for SVG (matches logo asset)
  purpleHover: '#7C6BD6',
  purplePressed: '#6A5BC1',
  purpleSoft: '#F1EEFB',      // soft background tint
  navy: '#1E2839',            // Dark Navy
  black: '#14181E',           // Almost Black
  cream: '#EBEAE4',
  white: '#FFFFFF',
} as const

export type ClienderColor = keyof typeof CLIENDER
