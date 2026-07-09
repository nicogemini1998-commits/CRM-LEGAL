import { CLIENDER } from '@/lib/brand'

type Variant = 'full' | 'symbol' | 'wordmark'
type ColorKey = 'purple' | 'white' | 'dark'

type Props = {
  variant?: Variant
  color?: ColorKey
  size?: number
  className?: string
  title?: string
}

const COLOR_MAP: Record<ColorKey, string> = {
  purple: CLIENDER.purple,
  white: CLIENDER.white,
  dark: CLIENDER.navy,
}

const SYMBOL_PATH =
  'M257.17,600c-15.14,0-30.1-5.09-42.55-15.02L25.76,434.35C9.39,421.29,0,401.79,0,380.85s9.39-40.44,25.77-53.5l34.29-27.35-34.29-27.35C9.39,259.59,0,240.09,0,219.15s9.39-40.44,25.76-53.5L214.63,15.02c20.73-16.54,48.46-19.67,72.36-8.16,23.89,11.51,38.74,35.13,38.74,61.66v48.46c0,20.94-9.39,40.44-25.76,53.5l-162.4,129.52,162.4,129.52c16.37,13.06,25.77,32.56,25.77,53.5v48.46c0,26.52-14.85,50.15-38.75,61.66-9.56,4.6-19.72,6.86-29.81,6.86ZM55.9,396.57l188.86,150.63c8.92,7.11,17.83,4.04,21.26,2.4,3.42-1.65,11.38-6.71,11.38-18.11v-48.46c0-6.15-2.75-11.88-7.56-15.71L98.81,330.91l-42.91,34.22c-4.81,3.84-7.57,9.56-7.57,15.71s2.76,11.88,7.57,15.72h0ZM257.03,48.32c-3.68,0-7.97,1.06-12.27,4.49L55.9,203.43c-4.81,3.84-7.57,9.56-7.57,15.72s2.76,11.88,7.57,15.71l42.91,34.22,171.02-136.39c4.81-3.84,7.56-9.56,7.56-15.72v-48.46c0-11.4-7.96-16.46-11.38-18.11-1.77-.85-5.03-2.09-8.99-2.09Z'

function Symbol({ size, color, title }: { size: number; color: string; title?: string }) {
  const width = (size * 326) / 600
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 326 600"
      role={title ? 'img' : undefined}
      aria-label={title}
      style={{ display: 'inline-block', color }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={SYMBOL_PATH} fill="currentColor" />
    </svg>
  )
}

function Wordmark({ size, color }: { size: number; color: string }) {
  return (
    <span
      style={{
        color,
        fontSize: size * 0.62,
        letterSpacing: '0.16em',
        fontWeight: 700,
        lineHeight: 1,
        textTransform: 'uppercase',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      CLIENDER
    </span>
  )
}

export function ClienderLogo({
  variant = 'full',
  color = 'purple',
  size = 32,
  className,
  title = 'Cliender',
}: Props) {
  const resolved = COLOR_MAP[color]

  if (variant === 'symbol') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Symbol size={size} color={resolved} title={title} />
      </span>
    )
  }

  if (variant === 'wordmark') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Wordmark size={size} color={resolved} />
      </span>
    )
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}
    >
      <Symbol size={size} color={resolved} title={title} />
      <Wordmark size={size} color={resolved} />
    </span>
  )
}

export default ClienderLogo
