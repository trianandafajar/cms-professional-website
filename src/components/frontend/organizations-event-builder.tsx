'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type TicketType = 'free' | 'paid'
type Step = 1 | 2 | 3
type BuildSection = 'images' | 'title' | 'datetime' | 'overview' | 'goodToKnow'

type TicketItem = {
  id: string
  type: TicketType
  name: string
  quantity: number
  price: number
  salesStart: string
  salesEnd: string
  contactEmail?: string
}

export function OrganizationsEventBuilder() {
  const [step, setStep] = useState<Step>(1)
  const [activeEdit, setActiveEdit] = useState<BuildSection | null>(null)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [goodToKnow, setGoodToKnow] = useState<string[]>([])

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  ])
  const [imageInput, setImageInput] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [openTicketModal, setOpenTicketModal] = useState(false)
  const [ticketType, setTicketType] = useState<TicketType>('free')
  const [ticketName, setTicketName] = useState('')
  const [ticketQty, setTicketQty] = useState('100')
  const [ticketPrice, setTicketPrice] = useState('0')
  const [ticketStart, setTicketStart] = useState('')
  const [ticketEnd, setTicketEnd] = useState('')
  const [ticketEmail, setTicketEmail] = useState('')

  const totalGross = useMemo(
    () => tickets.reduce((sum, t) => sum + t.quantity * t.price, 0),
    [tickets],
  )

  const addTicket = () => {
    const qty = Number(ticketQty || 0)
    const price = ticketType === 'paid' ? Number(ticketPrice || 0) : 0

    if (!ticketName || qty <= 0 || !ticketStart || !ticketEnd) return
    if (ticketType === 'paid' && !ticketEmail) return

    setTickets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: ticketType,
        name: ticketName,
        quantity: qty,
        price,
        salesStart: ticketStart,
        salesEnd: ticketEnd,
        contactEmail: ticketEmail || undefined,
      },
    ])

    setTicketName('')
    setTicketQty('100')
    setTicketPrice('0')
    setTicketStart('')
    setTicketEnd('')
    setTicketEmail('')
    setTicketType('free')
    setOpenTicketModal(false)
  }

  const addImageUrl = () => {
    const url = imageInput.trim()
    if (!url) return
    setImageUrls((prev) => [...prev, url])
    setImageInput('')
  }

  const nextImage = () => {
    if (imageUrls.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
  }

  const prevImage = () => {
    if (imageUrls.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  const toggleHighlight = (value: string) => {
    setGoodToKnow((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-zinc-200 bg-white">
        <div className="p-5">
          <p className="text-3xl font-bold text-[#1e1248]">Draft Event</p>
          <p className="mt-2 text-sm text-zinc-500">Steps</p>
        </div>
        <div className="border-t border-zinc-200">
          {[
            { id: 1 as Step, label: 'Build event page' },
            { id: 2 as Step, label: 'Add tickets' },
            { id: 3 as Step, label: 'Publish' },
          ].map((s) => (
            <button
              className={
                step === s.id
                  ? 'flex w-full items-center gap-3 bg-zinc-100 px-5 py-4 text-left'
                  : 'flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50'
              }
              key={s.id}
              onClick={() => setStep(s.id)}
              type="button"
            >
              {step >= s.id ? (
                <CheckCircle2 className="size-5 text-[#3f5fe6]" />
              ) : (
                <Circle className="size-5 text-zinc-400" />
              )}
              <span className="font-semibold text-zinc-800">{s.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#1e1248]">Build event page</h2>

            <div className="rounded-xl border border-zinc-200 p-3">
              <div className="relative">
                <img
                  alt="Event cover"
                  className="h-56 w-full rounded-lg object-cover"
                  src={
                    imageUrls[currentImageIndex] ||
                    'https://via.placeholder.com/1200x600?text=Add+Image'
                  }
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button className="rounded-full bg-white p-1.5" onClick={prevImage} type="button">
                    <ChevronLeft className="size-4" />
                  </button>
                  <button className="rounded-full bg-white p-1.5" onClick={nextImage} type="button">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              <button
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#3f5fe6]"
                onClick={() => setActiveEdit(activeEdit === 'images' ? null : 'images')}
                type="button"
              >
                <Plus className="size-4" />
                Add / edit images
              </button>
              {activeEdit === 'images' && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Paste image URL"
                      value={imageInput}
                    />
                    <Button onClick={addImageUrl} type="button">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {imageUrls.map((url, index) => (
                      <button
                        className="rounded-md border border-zinc-200 px-2 py-1 text-xs"
                        key={url + index}
                        onClick={() => setCurrentImageIndex(index)}
                        type="button"
                      >
                        Image {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#1e1248]">Event Title</p>
                <button
                  className="text-[#3f5fe6]"
                  onClick={() => setActiveEdit(activeEdit === 'title' ? null : 'title')}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {activeEdit === 'title' || !title ? (
                <Input
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A short and sweet sentence about your event."
                  value={title}
                />
              ) : (
                <p className="text-zinc-800">{title}</p>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-base font-semibold text-[#1e1248]">Date and time / Location</p>
                <button
                  className="text-[#3f5fe6]"
                  onClick={() => setActiveEdit(activeEdit === 'datetime' ? null : 'datetime')}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {activeEdit === 'datetime' || !date || !location ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input onChange={(e) => setDate(e.target.value)} type="date" value={date} />
                  <Input
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter a location"
                    value={location}
                  />
                </div>
              ) : (
                <p className="text-sm text-zinc-700">
                  {date} • {location}
                </p>
              )}
              <div className="mt-3 h-36 rounded-lg bg-zinc-100" />
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-semibold text-[#1e1248]">Overview</p>
                <button
                  className="text-[#3f5fe6]"
                  onClick={() => setActiveEdit(activeEdit === 'overview' ? null : 'overview')}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {activeEdit === 'overview' || !summary ? (
                <Input
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe your event..."
                  value={summary}
                />
              ) : (
                <p className="text-zinc-700">{summary}</p>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-semibold text-[#1e1248]">Good to know</p>
                <button
                  className="text-[#3f5fe6]"
                  onClick={() => setActiveEdit(activeEdit === 'goodToKnow' ? null : 'goodToKnow')}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {activeEdit === 'goodToKnow' ? (
                <div className="flex flex-wrap gap-2">
                  {['Age 18+', 'Door opens 09:00', 'Free parking', 'No smoking', 'Bring ID'].map(
                    (item) => (
                      <button
                        className={
                          goodToKnow.includes(item)
                            ? 'rounded-full border border-[#3f5fe6] bg-indigo-50 px-2 py-1 text-xs text-[#3f5fe6]'
                            : 'rounded-full border border-zinc-300 px-2 py-1 text-xs'
                        }
                        key={item}
                        onClick={() => toggleHighlight(item)}
                        type="button"
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {goodToKnow.length === 0 ? (
                    <p className="text-sm text-zinc-500">Add highlights for attendees.</p>
                  ) : (
                    goodToKnow.map((item) => (
                      <span
                        className="rounded-full border border-zinc-300 px-2 py-1 text-xs"
                        key={item}
                      >
                        {item}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-zinc-300 p-4">
              <p className="font-semibold text-[#1e1248]">Add more sections to your event page</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-600">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
                  <span>Lineup</span>
                  <button className="text-[#3f5fe6]">Add</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
                  <span>Agenda</span>
                  <button className="text-[#3f5fe6]">Add</button>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={() => setStep(2)}>Continue to Add tickets</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold text-[#1e1248]">Add tickets</h2>
              <Button
                className="bg-[#3f5fe6] hover:bg-[#324fcb]"
                onClick={() => setOpenTicketModal(true)}
              >
                <Plus className="mr-1 size-4" />
                Add ticket
              </Button>
            </div>

            <div className="space-y-3">
              {tickets.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
                  No tickets yet. Click Add ticket.
                </div>
              )}
              {tickets.map((ticket) => (
                <div
                  className="grid items-center gap-3 rounded-xl border border-zinc-200 p-4 md:grid-cols-[1fr_auto_auto_auto]"
                  key={ticket.id}
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{ticket.name}</p>
                    <p className="text-sm text-zinc-500">
                      {ticket.type.toUpperCase()} • {ticket.salesStart} - {ticket.salesEnd}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700">Qty {ticket.quantity}</p>
                  <p className="text-sm text-zinc-700">Rp {ticket.price.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-zinc-500">{ticket.contactEmail || '-'}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button onClick={() => setStep(1)} variant="outline">
                Back
              </Button>
              <Button disabled={tickets.length === 0} onClick={() => setStep(3)}>
                Continue to Publish
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#1e1248]">Publish</h2>
            <div className="rounded-xl border border-zinc-200 p-5">
              <p className="text-lg font-semibold text-zinc-900">{title || 'Untitled event'}</p>
              <p className="mt-1 text-sm text-zinc-600">{summary || '-'}</p>
              <p className="mt-2 text-sm text-zinc-500">
                {date || '-'} • {location || '-'}
              </p>
              <p className="mt-4 text-sm text-zinc-700">Total tickets: {tickets.length}</p>
              <p className="text-sm text-zinc-700">
                Potential gross: Rp {totalGross.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex justify-between pt-2">
              <Button onClick={() => setStep(2)} variant="outline">
                Back
              </Button>
              <Button className="bg-[#3f5fe6] hover:bg-[#324fcb]">Publish event</Button>
            </div>
          </div>
        )}
      </section>

      <Dialog onOpenChange={setOpenTicketModal} open={openTicketModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add ticket</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={
                  ticketType === 'paid'
                    ? 'rounded-lg border border-[#3f5fe6] bg-indigo-50 px-3 py-2 font-semibold text-[#3f5fe6]'
                    : 'rounded-lg border border-zinc-200 px-3 py-2'
                }
                onClick={() => setTicketType('paid')}
                type="button"
              >
                Paid
              </button>
              <button
                className={
                  ticketType === 'free'
                    ? 'rounded-lg border border-[#3f5fe6] bg-indigo-50 px-3 py-2 font-semibold text-[#3f5fe6]'
                    : 'rounded-lg border border-zinc-200 px-3 py-2'
                }
                onClick={() => setTicketType('free')}
                type="button"
              >
                Free
              </button>
            </div>

            <Input
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="Ticket name"
              value={ticketName}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                onChange={(e) => setTicketQty(e.target.value)}
                placeholder="Quantity"
                type="number"
                value={ticketQty}
              />
              <Input
                disabled={ticketType === 'free'}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="Price"
                type="number"
                value={ticketPrice}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                onChange={(e) => setTicketStart(e.target.value)}
                type="datetime-local"
                value={ticketStart}
              />
              <Input
                onChange={(e) => setTicketEnd(e.target.value)}
                type="datetime-local"
                value={ticketEnd}
              />
            </div>
            {ticketType === 'paid' && (
              <Input
                onChange={(e) => setTicketEmail(e.target.value)}
                placeholder="Payout / contact email"
                type="email"
                value={ticketEmail}
              />
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenTicketModal(false)} variant="outline">
              Cancel
            </Button>
            <Button className="bg-[#3f5fe6] hover:bg-[#324fcb]" onClick={addTicket}>
              Save ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
