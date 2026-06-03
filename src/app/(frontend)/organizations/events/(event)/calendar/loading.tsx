export default function Loading() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 rounded-xl bg-zinc-100" />
          <div className="h-9 w-9 rounded-xl bg-zinc-100" />
          <div className="h-9 w-9 rounded-xl bg-zinc-100" />
          <div className="ml-3 h-8 w-48 rounded bg-zinc-100" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-36 rounded-xl bg-zinc-100" />
        </div>
      </div>

      <div className="h-[34rem] p-6">
        <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-zinc-100" />
            <div className="h-4 w-36 rounded bg-zinc-100" />
            <div className="h-3 w-48 rounded bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
