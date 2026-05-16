export function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-0 ${className}`} aria-label="LEXIA está escribiendo">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}
