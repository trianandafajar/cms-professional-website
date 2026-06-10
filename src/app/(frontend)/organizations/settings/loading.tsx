import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-xl" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <Skeleton className="h-6 w-36 rounded-xl" />
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Skeleton className="size-24 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded-xl" />
                  <Skeleton className="h-3 w-52 rounded-xl" />
                  <Skeleton className="h-3 w-44 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <Skeleton className="h-6 w-44 rounded-xl" />
              <div className="mt-4 space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <Skeleton className="h-6 w-36 rounded-xl" />
              <div className="mt-4 space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 space-y-6 lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <Skeleton className="h-4 w-24 rounded-xl" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-5 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-2/3 rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <Skeleton className="h-4 w-24 rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
