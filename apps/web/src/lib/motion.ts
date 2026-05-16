import type { Variants, Transition } from 'framer-motion'

/* ── Easing presets (Linear's signatures) ─────────────────────────── */
export const ease = {
  outQuart: [0.32, 0.72, 0, 1] as [number, number, number, number],
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOutQuart: [0.76, 0, 0.24, 1] as [number, number, number, number],
}

/* ── Spring presets ───────────────────────────────────────────────── */
export const spring = {
  soft: { type: 'spring' as const, stiffness: 240, damping: 24 },
  snappy: { type: 'spring' as const, stiffness: 380, damping: 30 },
  magnetic: { type: 'spring' as const, stiffness: 200, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 500, damping: 18 },
}

/* ── Page transition (subtle fade + lift) ─────────────────────────── */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: ease.outQuart } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: ease.outQuart } },
}

/* ── Stagger container ────────────────────────────────────────────── */
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
}

/* ── Stagger item ─────────────────────────────────────────────────── */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: ease.outExpo } },
}

/* ── Fade up ──────────────────────────────────────────────────────── */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.outExpo } },
}

/* ── Card hover ───────────────────────────────────────────────────── */
export const cardHover = {
  rest: { y: 0, transition: { duration: 0.2, ease: ease.outQuart } },
  hover: { y: -2, transition: { duration: 0.2, ease: ease.outQuart } },
}

/* ── Button press ─────────────────────────────────────────────────── */
export const buttonPress: Transition = {
  duration: 0.12,
  ease: ease.outQuart,
}

/* ── Token streaming entry ─────────────────────────────────────────── */
export const tokenFadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.08 } },
}
