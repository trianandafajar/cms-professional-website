function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 ${className}`} />
}

export function EventsHeaderSkeleton() {
  return (
    <>
      <div className="mb-6">
        <Line className="h-10 w-40" />
        <Line className="mt-2 h-4 w-64" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Line className="h-9 w-64 rounded-lg" />
          <Line className="h-10 w-52 rounded-lg" />
          <Line className="h-9 w-24 rounded-lg" />
        </div>

        <Line className="h-9 w-36 rounded-lg" />
      </div>
    </>
  )
}

function EventsListRowSkeleton() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b border-zinc-50 px-5 py-4 last:border-b-0">
      <div className="col-span-5 flex items-center gap-3">
        <Line className="h-11 w-11 rounded-lg" />
        <Line className="h-11 w-11 rounded-lg" />
        <div className="space-y-2">
          <Line className="h-4 w-40" />
          <Line className="h-3 w-24" />
        </div>
      </div>
      <div className="col-span-2">
        <Line className="h-3 w-28" />
      </div>
      <div className="col-span-2">
        <Line className="h-6 w-20 rounded-full" />
      </div>
      <div className="col-span-2">
        <Line className="h-3 w-24" />
      </div>
      <div className="col-span-1 flex justify-end">
        <Line className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}

export function EventsListSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {withHeader ? <EventsHeaderSkeleton /> : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <div className="col-span-5">Event</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Capacity</div>
          <div className="col-span-1" />
        </div>

        <EventsListRowSkeleton />
        <EventsListRowSkeleton />
        <EventsListRowSkeleton />
        <EventsListRowSkeleton />
      </div>
    </div>
  )
}

export function EventsCalendarSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  return (
    <div className="space-y-6">
      {withHeader ? <EventsHeaderSkeleton /> : null}

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <Line className="h-9 w-20 rounded-xl" />
            <Line className="h-9 w-9 rounded-xl" />
            <Line className="h-9 w-9 rounded-xl" />
            <Line className="ml-3 h-8 w-48" />
          </div>
          <Line className="h-11 w-36 rounded-xl" />
        </div>

        <div className="h-[34rem] p-6">
          <div className="grid h-full grid-cols-7 gap-3 rounded-3xl border border-zinc-100 bg-zinc-50/40 p-4">
            {Array.from({ length: 35 }).map((_, index) => (
              <Line key={index} className="h-20 rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EventEditorShellSkeleton() {
  return (
    <div className="-mt-16 flex min-h-[calc(100vh-93px)] bg-[#fafafa] pt-10">
      <aside className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[320px] flex-col border-r border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <Line className="h-5 w-28" />
        </div>

        <div className="border-b border-zinc-100 px-4 py-5">
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
            <Line className="h-24 w-full rounded-none" />
            <div className="space-y-3 bg-white p-4">
              <Line className="h-5 w-40" />
              <Line className="h-4 w-28" />
              <Line className="h-3 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <Line className="h-3 w-16" />
          <Line className="h-16 w-full rounded-lg" />
          <Line className="h-16 w-full rounded-lg" />
          <Line className="h-16 w-full rounded-lg" />
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl space-y-4 px-8 py-8 pb-24">
          <EventEditorFormSkeleton />
        </div>
      </main>
    </div>
  )
}

export function EventEditorFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <Line className="h-5 w-40" />
        <Line className="mt-3 h-48 w-full rounded-xl" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <Line className="h-5 w-36" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg sm:col-span-2" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <Line className="h-5 w-32" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <Line className="h-5 w-28" />
        <Line className="mt-4 h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}
