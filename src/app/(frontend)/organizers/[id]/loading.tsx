export default function OrganizerProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
          <div className="h-8 w-28 animate-pulse rounded-md bg-zinc-100" />
          <div className="hidden h-10 flex-1 max-w-[560px] animate-pulse rounded-lg bg-zinc-100 lg:block" />
          <div className="ml-auto flex items-center gap-3">
            <div className="h-8 w-20 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100" />
          </div>
        </div>
      </div>

      {/* Cover skeleton */}
      <div className="relative h-48 animate-pulse bg-zinc-200 md:h-64" />

      {/* Profile Header skeleton */}
      <div className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <div className="relative -mt-12 rounded-2xl border border-zinc-200 bg-white px-6 py-5 sm:-mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar */}
            <div className="shrink-0 -mt-14 sm:-mt-16">
              <div className="size-24 animate-pulse rounded-2xl bg-zinc-200 ring-4 ring-white md:size-28" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-7 w-48 animate-pulse rounded-lg bg-zinc-100" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100" />
              </div>
              <div className="h-4 w-80 animate-pulse rounded bg-zinc-100" />
              <div className="flex items-center gap-4">
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-32 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>

            {/* Follow button */}
            <div className="shrink-0">
              <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-7 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="h-5 w-16 animate-pulse rounded bg-zinc-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>

            {/* Events grid */}
            <div>
              <div className="mb-4 h-5 w-36 animate-pulse rounded bg-zinc-100" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-100 bg-white"
                  >
                    <div className="aspect-video animate-pulse bg-zinc-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
                        <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
                ))}
              </div>
            </div>

            {/* Cities */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-zinc-100" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-16" />
      </div>
    </div>
  )
}
