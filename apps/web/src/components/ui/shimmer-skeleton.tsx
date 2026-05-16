interface ShimmerSkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function ShimmerSkeleton({ className = '', rounded = 'md' }: ShimmerSkeletonProps) {
  const radii = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }
  return <div className={`shimmer ${radii[rounded]} ${className}`} />
}
