import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function DotGrid({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(0,48,48,0.12)_1px,transparent_1px)] [background-size:18px_18px]',
        className,
      )}
    />
  )
}
