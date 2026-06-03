'use client'

import { useState, useRef } from 'react'
import { useEventEditorStore, type EventTicketType } from '@/stores/eventEditorStore'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TicketPreviewCard from '@/components/organizations/ticket-preview'
import {
  type TicketConfig,
  defaultConfig,
  presets,
  initialDesigns,
  getTicketBackground,
} from '@/lib/ticket-designs'
import { DEFAULT_CURRENCY, formatMoneyAmount } from '@/lib/finance'

function toDatetimeLocalValue(date = new Date()) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function clampDatetime(value: string, minValue: string) {
  if (!value) return value
  return value < minValue ? minValue : value
}

export default function EventTicketsPage() {
  const {
    tickets,

    addTicket,
    removeTicket,
    updateTicket,

    addPerk,
    updatePerk,
    removePerk,

    saveEventSettings,
    isSavingTickets,
  } = useEventEditorStore()

  const [expandedId, setExpandedId] = useState<string | null>(tickets[0]?.id || null)

  const [saved, setSaved] = useState(false)

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  function getDesignConfig(ticket: EventTicketType): TicketConfig | null {
    if (!ticket.designId) return null
    if (ticket.designSource === 'designer') {
      const design = initialDesigns.find((d) => d.id === ticket.designId)
      return design?.config || null
    } else {
      const preset = presets.find((p) => p.id === ticket.designId)
      if (preset) return { ...defaultConfig, ...preset.config }
      return null
    }
  }

  function getDesignName(ticket: EventTicketType): string {
    if (!ticket.designId) return ''
    if (ticket.designSource === 'designer') {
      return initialDesigns.find((d) => d.id === ticket.designId)?.name || ''
    }
    return presets.find((p) => p.id === ticket.designId)?.name || ''
  }

  // ─── Drag and Drop handlers ───
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDragEnter(e: React.DragEvent, id: string) {
    e.preventDefault()
    dragCounter.current++
    if (id !== draggedId) {
      setDragOverId(id)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverId(null)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    dragCounter.current = 0
    setDragOverId(null)

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const fromIdx = tickets.findIndex((t) => t.id === draggedId)
    const toIdx = tickets.findIndex((t) => t.id === targetId)

    if (fromIdx === -1 || toIdx === -1) {
      setDraggedId(null)
      return
    }

    const newTickets = [...tickets]
    const [moved] = newTickets.splice(fromIdx, 1)
    newTickets.splice(toIdx, 0, moved)
    useEventEditorStore.setState({
      tickets: newTickets,
    })
    setDraggedId(null)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }

  async function handleSave() {
    setSaved(false)

    await saveEventSettings()

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  return (
    <div className="mx-auto max-w-4xl pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Ticket Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure ticket types, pricing, and assign designs from Ticket Designer
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check size={14} />
              Saved
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSavingTickets}
            className="rounded-xl bg-[#5151eb] px-5 text-sm font-semibold text-white hover:bg-[#3d3dcc] disabled:opacity-60"
          >
            {isSavingTickets ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {tickets.map((ticket) => {
          const isExpanded = expandedId === ticket.id
          const designConfig = getDesignConfig(ticket)
          const isDragging = draggedId === ticket.id
          const isDragOver = dragOverId === ticket.id

          return (
            <div
              key={ticket.id}
              draggable
              onDragStart={(e) => handleDragStart(e, ticket.id)}
              onDragEnter={(e) => handleDragEnter(e, ticket.id)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, ticket.id)}
              onDragEnd={handleDragEnd}
              className={`overflow-hidden rounded-xl border bg-white transition-all ${
                isDragging
                  ? 'opacity-50 border-zinc-300'
                  : isDragOver
                    ? 'border-[#5151eb] ring-2 ring-[#5151eb]/20'
                    : 'border-zinc-200'
              }`}
            >
              {/* Collapsed Header */}
              <div className="flex w-full items-center gap-3 px-5 py-4">
                {/* Drag handle */}
                <div className="shrink-0 cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className="text-zinc-300 hover:text-zinc-500" />
                </div>

                {/* Mini preview */}
                {designConfig && (
                  <div className="shrink-0 w-16 h-8 rounded overflow-hidden">
                    <div className="w-full h-full" style={getTicketBackground(designConfig)} />
                  </div>
                )}

                {/* Info - clickable to expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {ticket.name || 'Untitled Ticket'}
                    </p>
                    {ticket.isHidden && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-4 text-xs text-zinc-400">
                    <span>
                      {formatMoneyAmount(ticket.price ?? 0, DEFAULT_CURRENCY)}
                    </span>
                    <span>{ticket.quantity} available</span>
                    {ticket.designId && (
                      <span>
                        {ticket.designSource === 'designer' ? 'Design' : 'Preset'}:{' '}
                        {getDesignName(ticket)}
                      </span>
                    )}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTicket(ticket.id)}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 py-5 space-y-5">
                  {/* Basic Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Ticket Name
                      </label>
                      <input
                        value={ticket.name}
                        onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                        placeholder="e.g., General Admission"
                        className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Price (USD)
                      </label>
                      <div className="mt-1.5 flex gap-2">
                        <div className="flex h-10 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700">
                          USD
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={ticket.price ?? ''}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              price:
                                e.target.value === ''
                                  ? null
                                  : Math.max(0, Number(e.target.value)),
                            })
                          }
                          placeholder="0"
                          className="h-10 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Description
                    </label>
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                      placeholder="Brief description shown to attendees..."
                      rows={2}
                      className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none resize-none focus:border-[#5151eb]"
                    />
                  </div>

                  {/* Quantity & Limits */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Total Quantity
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          updateTicket(ticket.id, { quantity: Number(e.target.value) })
                        }
                        className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Max Per Order
                      </label>
                      <input
                        type="number"
                        value={ticket.maxPerOrder}
                        onChange={(e) =>
                          updateTicket(ticket.id, { maxPerOrder: Number(e.target.value) })
                        }
                        className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ticket.isHidden}
                          onChange={(e) => updateTicket(ticket.id, { isHidden: e.target.checked })}
                          className="size-4 rounded border-zinc-300 text-[#5151eb] focus:ring-[#5151eb]"
                        />
                        <span className="text-sm text-zinc-700">Hidden from public</span>
                      </label>
                    </div>
                  </div>

                  {/* Sales Period */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Sales Start
                      </label>
                      <input
                        type="datetime-local"
                        min={toDatetimeLocalValue()}
                        value={ticket.salesStart ?? ''}
                        onChange={(e) =>
                          updateTicket(ticket.id, {
                            salesStart: e.target.value
                              ? clampDatetime(e.target.value, toDatetimeLocalValue())
                              : null,
                          })
                        }
                        className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Sales End
                        </label>
                        <select
                          value={ticket.salesEndMode}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              salesEndMode: e.target.value as 'limited' | 'unlimited',
                              salesEnd: e.target.value === 'unlimited' ? null : ticket.salesEnd,
                            })
                          }
                          className="h-8 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-[#5151eb]"
                        >
                          <option value="limited">Limited date</option>
                          <option value="unlimited">Until sold out</option>
                        </select>
                      </div>
                      {ticket.salesEndMode === 'limited' ? (
                        <input
                          type="datetime-local"
                          min={ticket.salesStart ?? toDatetimeLocalValue()}
                          value={ticket.salesEnd ?? ''}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              salesEnd: e.target.value
                                ? clampDatetime(
                                    e.target.value,
                                    ticket.salesStart ?? toDatetimeLocalValue(),
                                  )
                                : null,
                            })
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                        />
                      ) : (
                        <div className="mt-1.5 rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-500">
                          Ticket sale stays open until the quantity is sold out.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Perks */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Perks / Benefits
                      </label>
                      <button
                        type="button"
                        onClick={() => addPerk(ticket.id)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#5151eb] transition hover:bg-indigo-50"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                    {ticket.perks.length > 0 ? (
                      <div className="space-y-2">
                        {ticket.perks.map((perk) => (
                          <div key={perk.id} className="flex items-center gap-2">
                            <input
                              value={perk.perk}
                              onChange={(e) => updatePerk(ticket.id, perk.id, e.target.value)}
                              placeholder="e.g., Access to VIP lounge"
                              className="h-9 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-[#5151eb]"
                            />
                            <button
                              type="button"
                              onClick={() => removePerk(ticket.id, perk.id)}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">No perks added yet</p>
                    )}
                  </div>

                  {/* ─── Design Selection ─── */}
                  <div className="border-t border-zinc-100 pt-5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Ticket Design
                    </label>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Select a design from Ticket Designer or use a preset theme
                    </p>

                    {/* Source toggle */}
                    <div className="mt-3 flex items-center rounded-lg border border-zinc-200 p-0.5 w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, { designSource: 'designer', designId: null })
                        }
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          ticket.designSource === 'designer'
                            ? 'bg-[#5151eb] text-white'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        My Designs
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateTicket(ticket.id, { designSource: 'preset', designId: null })
                        }
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          ticket.designSource === 'preset'
                            ? 'bg-[#5151eb] text-white'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        Presets
                      </button>
                    </div>

                    {/* Design grid */}
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {ticket.designSource === 'designer'
                        ? initialDesigns.map((design) => {
                            const isSelected = ticket.designId === design.id
                            return (
                              <button
                                key={design.id}
                                type="button"
                                onClick={() => updateTicket(ticket.id, { designId: design.id })}
                                className={`relative overflow-hidden rounded-xl border p-2 transition text-left ${
                                  isSelected
                                    ? 'border-[#5151eb] ring-1 ring-[#5151eb]/30'
                                    : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                <div
                                  className="h-16 w-full rounded-lg"
                                  style={getTicketBackground(design.config)}
                                />
                                <p
                                  className={`mt-2 text-[11px] font-medium ${isSelected ? 'text-[#5151eb]' : 'text-zinc-600'}`}
                                >
                                  {design.name}
                                </p>
                                {isSelected && (
                                  <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[#5151eb]">
                                    <Check size={10} className="text-white" />
                                  </div>
                                )}
                              </button>
                            )
                          })
                        : presets.map((preset) => {
                            const isSelected = ticket.designId === preset.id
                            const fullConfig: TicketConfig = { ...defaultConfig, ...preset.config }
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => updateTicket(ticket.id, { designId: preset.id })}
                                className={`relative overflow-hidden rounded-xl border p-2 transition text-left ${
                                  isSelected
                                    ? 'border-[#5151eb] ring-1 ring-[#5151eb]/30'
                                    : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                <div
                                  className="h-16 w-full rounded-lg"
                                  style={getTicketBackground(fullConfig)}
                                />
                                <p
                                  className={`mt-2 text-[11px] font-medium ${isSelected ? 'text-[#5151eb]' : 'text-zinc-600'}`}
                                >
                                  {preset.name}
                                </p>
                                {isSelected && (
                                  <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[#5151eb]">
                                    <Check size={10} className="text-white" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                    </div>

                    {!ticket.designId && (
                      <p className="mt-2 text-xs text-amber-600">
                        No design selected. A default design will be used.
                      </p>
                    )}
                  </div>

                  {/* ─── Full Ticket Preview (same as Ticket Designer) ─── */}
                  {designConfig && (
                    <div className="border-t border-zinc-100 pt-5">
                      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Ticket Preview
                      </label>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        Exactly how this ticket will look when purchased by an attendee
                      </p>
                      <div className="mt-4 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100/50 p-6 overflow-x-auto">
                        <TicketPreviewCard
                          config={designConfig}
                          designName={ticket.name || getDesignName(ticket)}
                          scale={0.65}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Ticket Button */}
      <button
        type="button"
        onClick={addTicket}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-4 text-sm font-medium text-zinc-500 transition hover:border-[#5151eb] hover:text-[#5151eb]"
      >
        <Plus size={16} />
        Add Ticket Type
      </button>
    </div>
  )
}
