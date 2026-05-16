interface CommandShortcutProps {
  keys: string[]
  className?: string
  variant?: 'light' | 'dark'
}

export function CommandShortcut({ keys, className = '', variant = 'light' }: CommandShortcutProps) {
  const styles = variant === 'light'
    ? 'bg-stone-100 text-stone-500 border-stone-200'
    : 'bg-white/10 text-white/70 border-white/10'

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {keys.map((k, i) => (
        <kbd
          key={i}
          className={`min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 text-[10px] font-mono font-medium rounded-[5px] border ${styles}`}
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}
