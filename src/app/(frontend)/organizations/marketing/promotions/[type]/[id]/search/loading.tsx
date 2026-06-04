export default function PromotionSearchLoading() {
  return (
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-60 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-[30rem] max-w-full animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5">
          <div className="mb-5 h-11 w-full animate-pulse rounded-xl bg-zinc-100" />

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-44 animate-pulse rounded bg-zinc-200" />
                  <div className="h-3 w-60 animate-pulse rounded bg-zinc-100" />
                </div>
                <div className="h-5 w-5 animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <div className="h-11 w-28 animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-11 w-36 animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}
