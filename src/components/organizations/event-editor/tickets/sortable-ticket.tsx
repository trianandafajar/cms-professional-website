import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Copy, Menu, MoreVertical } from "lucide-react"

export default function SortableTicket({ ticket, onEdit }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: ticket.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 bg-white last:border-b-0"
    >
      {/* TOP */}
      <div className="flex items-center gap-6 px-8 py-7">
        {/* DRAG */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 transition hover:text-gray-600 active:cursor-grabbing"
        >
          <Menu size={24} />
        </button>

        {/* INFO */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-[#1E0A3C]">{ticket.name}</h2>

            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-3 flex items-center gap-3 text-gray-500">
            <span className="text-base font-medium">On Sale</span>

            <span>•</span>

            <span className="text-base">{ticket.saleEnd}</span>
          </div>
        </div>

        {/* SOLD */}
        <div className="min-w-[140px]">
          <p className="text-lg text-gray-500">Sold:</p>

          <p className="mt-1 text-2xl font-bold text-[#1E0A3C]">
            {ticket.sold}/{ticket.capacity}
          </p>
        </div>

        {/* TYPE */}
        <div className="min-w-[120px]">
          <p className="text-2xl font-semibold capitalize text-[#1E0A3C]">{ticket.type}</p>
        </div>

        {/* ACTION */}
        <div className="flex items-center gap-2">
          {/* COPY */}
          <button
            onClick={() => onEdit(ticket)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50"
          >
            <Copy size={18} />
          </button>

          {/* MENU */}
          <button
            onClick={() => onEdit(ticket)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
