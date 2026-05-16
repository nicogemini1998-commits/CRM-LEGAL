export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-800/60 ${className}`}
    />
  )
}

export function DocumentCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function CaseCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-64" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function AnalysisSkeletonPanel() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-5 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-4 w-32 mt-4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-4 w-36 mt-4" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}
