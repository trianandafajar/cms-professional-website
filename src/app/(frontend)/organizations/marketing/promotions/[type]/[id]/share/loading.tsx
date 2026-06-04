export default function PromotionShareLoading() {
  return (
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-[28rem] max-w-full animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-5 space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
            <div className="h-11 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
          </div>

          <div className="rounded-2xl border border-zinc-200 p-5 space-y-4">
            <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
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
