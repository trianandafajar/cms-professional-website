import { Skeleton } from '@/components/ui/skeleton'

export default function OrganizationsLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="hidden h-10 max-w-[420px] flex-1 rounded-lg lg:block" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex h-full w-16 flex-col items-center justify-between border-r border-zinc-100 bg-white py-3">
          <div className="flex flex-col items-center gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="size-12 rounded-xl" />
            ))}
          </div>
          <Skeleton className="size-12 rounded-xl" />
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#fdfdfd] p-7">
          <div className="space-y-4">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-80" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 bg-white p-5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="mt-4 h-8 w-20" />
                  <Skeleton className="mt-2 h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
