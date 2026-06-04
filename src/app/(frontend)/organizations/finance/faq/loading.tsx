import { Skeleton } from '@/components/ui/skeleton'

export default function FinanceFaqLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-80" />
      <div className="rounded-xl border border-zinc-200 bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border-b border-zinc-100 px-5 py-4 last:border-b-0">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
