function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 ${className}`} />
}

export function EventsHeaderSkeleton() {
  return (
    <>
      <div className="mb-6">
        <Line className="h-8 w-36 sm:h-10 sm:w-40" />
        <Line className="mt-2 h-4 w-64" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Line className="h-10 w-full rounded-lg sm:h-9 sm:w-64" />
          <Line className="h-10 w-full rounded-lg sm:w-52" />
          <Line className="h-10 w-full rounded-lg sm:h-9 sm:w-24" />
        </div>

        <Line className="h-10 w-full rounded-lg sm:w-36 lg:h-9" />
      </div>
    </>
  )
}

function EventsListRowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-zinc-100 px-4 py-4 pr-12 last:border-b-0 md:grid-cols-12 md:items-center md:gap-4 md:border-zinc-50 md:px-5">
      <div className="flex items-center gap-3 md:col-span-5">
        <Line className="h-12 w-12 rounded-lg md:h-11 md:w-11" />
        <Line className="h-12 w-12 rounded-lg md:h-11 md:w-11" />
        <div className="space-y-2">
          <Line className="h-4 w-40" />
          <Line className="h-3 w-24" />
        </div>
      </div>
      <div className="md:col-span-2">
        <Line className="h-3 w-28" />
      </div>
      <div className="md:col-span-2">
        <Line className="h-6 w-20 rounded-full" />
      </div>
      <div className="md:col-span-2">
        <Line className="h-3 w-24" />
      </div>
      <div className="hidden justify-end md:col-span-1 md:flex">
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
        <div className="hidden grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid">
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
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Line className="h-9 w-20 rounded-xl" />
            <Line className="h-9 w-9 rounded-xl" />
            <Line className="h-9 w-9 rounded-xl" />
            <Line className="h-7 w-full sm:ml-3 sm:h-8 sm:w-48" />
          </div>
          <Line className="h-11 w-full rounded-xl sm:w-36" />
        </div>

        <div className="h-[34rem] overflow-x-auto p-3 sm:p-6">
          <div className="grid h-full min-w-[720px] grid-cols-7 gap-3 rounded-3xl border border-zinc-100 bg-zinc-50/40 p-4">
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
    <div className="min-h-[calc(100vh-73px)] bg-[#fafafa] md:-mt-16 md:max-h-[calc(100vh-93px)] md:pt-10">
      <div className="sticky -top-2 z-40 -mx-4 -mt-4 flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 sm:-mx-6 sm:-mt-6 md:hidden">
        <Line className="h-10 w-24 rounded-lg" />
        <Line className="h-5 w-36" />
      </div>

      <div className="flex md:h-[calc(100vh-93px)]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-[320px] shrink-0 flex-col border-r border-zinc-100 bg-white md:flex">
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

        <main className="min-w-0 flex-1 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 pb-32 sm:px-6 md:px-8 md:py-8">
            <EventEditorFormSkeleton />
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:left-[320px] md:px-8">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Line className="hidden h-10 w-20 rounded-lg sm:block" />
          <Line className="h-11 w-full rounded-lg sm:w-40" />
        </div>
      </div>
    </div>
  )
}

export function EventEditorFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <Line className="h-5 w-40" />
        <Line className="mt-3 h-36 w-full rounded-xl sm:h-48" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <Line className="h-5 w-36" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg sm:col-span-2" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <Line className="h-5 w-32" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Line className="h-11 w-full rounded-lg" />
          <Line className="h-11 w-full rounded-lg" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <Line className="h-5 w-28" />
        <Line className="mt-4 h-32 w-full rounded-xl sm:h-40" />
      </div>
    </div>
  )
}
