function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b border-zinc-50 px-5 py-4 last:border-b-0">
      <div className="col-span-5 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-zinc-100" />
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-zinc-100" />
          <div className="h-3 w-24 rounded bg-zinc-100" />
        </div>
      </div>
      <div className="col-span-2">
        <div className="h-3 w-28 rounded bg-zinc-100" />
      </div>
      <div className="col-span-2">
        <div className="h-6 w-20 rounded-full bg-zinc-100" />
      </div>
      <div className="col-span-2">
        <div className="h-3 w-24 rounded bg-zinc-100" />
      </div>
      <div className="col-span-1 flex justify-end">
        <div className="h-8 w-8 rounded-lg bg-zinc-100" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="grid grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <div className="col-span-5">Event</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Capacity</div>
        <div className="col-span-1" />
      </div>

      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  )
}
