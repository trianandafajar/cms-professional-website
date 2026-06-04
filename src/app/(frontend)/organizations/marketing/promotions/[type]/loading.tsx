function PromotionFormLoadingShell() {
  return (
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="grid gap-6">
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="h-11 animate-pulse rounded-xl bg-zinc-100" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="h-28 animate-pulse rounded-xl bg-zinc-100" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`row-${index}`} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
                <div className="h-11 animate-pulse rounded-xl bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <div className="h-11 w-28 animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-11 w-36 animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}

export default function PromotionTypeLoading() {
  return <PromotionFormLoadingShell />
}
