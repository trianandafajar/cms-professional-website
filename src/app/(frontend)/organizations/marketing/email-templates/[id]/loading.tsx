export default function EmailTemplateDetailLoading() {
  return (
    <div className="space-y-5 px-1 py-2">
      <div className="h-5 w-36 animate-pulse rounded bg-zinc-100" />

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-200" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex gap-2 border-b border-zinc-200 pb-3">
            <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-4 w-40 animate-pulse rounded bg-zinc-200" />
              <div className="mt-2 h-3 w-56 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-[880px] animate-pulse bg-zinc-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
