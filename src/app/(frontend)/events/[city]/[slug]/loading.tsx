// Loading skeleton for the event detail page.
// Next.js automatically shows this while the page is streaming.

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-200 ${className ?? ''}`} aria-hidden="true" />
  )
}

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white p-6 shadow-sm">{children}</div>
}

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 h-[57px] border-b border-zinc-100 bg-white" />

      {/* Hero image skeleton */}
      <div className="relative w-full bg-zinc-200" style={{ height: 380 }}>
        <div className="absolute inset-0 animate-pulse bg-zinc-200" />
        {/* Badge placeholders */}
        <div className="absolute left-4 top-4">
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="absolute right-4 top-4">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-[1200px] px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Title card */}
            <CardShell>
              {/* Tags row */}
              <div className="mb-3 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              {/* Title */}
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2" />
              {/* Organizer row */}
              <div className="mt-5 flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </CardShell>

            {/* Event details card */}
            <CardShell>
              <Skeleton className="h-4 w-28 mb-5" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4 mb-5 last:mb-0">
                  <Skeleton className="size-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </CardShell>

            {/* Highlights card */}
            <CardShell>
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl bg-zinc-50 p-3"
                  >
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </CardShell>

            {/* Description card */}
            <CardShell>
              <Skeleton className="h-4 w-36 mb-4" />
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="mt-4 h-4 w-24" />
            </CardShell>

            {/* Map card */}
            <CardShell>
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-52 w-full rounded-xl" />
              <div className="mt-3 flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                ))}
              </div>
            </CardShell>

            {/* Organizer card */}
            <CardShell>
              <Skeleton className="h-4 w-28 mb-4" />
              <div className="flex items-start gap-4">
                <Skeleton className="size-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="size-4 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-18" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton className="h-7 w-16 rounded-lg" />
                    <Skeleton className="h-7 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            </CardShell>

            {/* Refund policy */}
            <CardShell>
              <Skeleton className="h-4 w-28 mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full shrink-0" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardShell>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
          <div className="w-full shrink-0 space-y-4 lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-4">
              {/* Ticket CTA card skeleton */}
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {/* Price */}
                <div className="border-b border-zinc-100 px-5 py-4">
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                {/* Date/venue */}
                <div className="px-5 py-4 space-y-3 border-b border-zinc-100">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Skeleton className="size-4 rounded shrink-0" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ))}
                </div>
                {/* Buttons */}
                <div className="px-5 py-4 space-y-3">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-14 rounded-xl" />
                  </div>
                </div>
                <div className="border-t border-zinc-100 px-5 py-3">
                  <Skeleton className="h-3 w-40 mx-auto" />
                </div>
              </div>

              {/* Organizer suggestions skeleton */}
              <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="divide-y divide-zinc-50">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <Skeleton className="size-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
                <Skeleton className="mt-3 h-3 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
