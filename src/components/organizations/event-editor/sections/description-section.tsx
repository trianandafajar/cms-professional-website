'use client'

import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Plus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Eye,
  Pencil,
  Columns3,
  Rows3,
  Table as TableIcon,
  Trash2,
} from 'lucide-react'

import { useEffect, useMemo, useRef, useState } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Heading from '@tiptap/extension-heading'
import { Table as TiptapTable } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { useEventEditorStore } from '@/stores/eventEditorStore'

const descriptionContentClass =
  'max-w-none text-start outline-none text-zinc-700 ' +
  '[&_h1]:mb-3 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:text-zinc-950 ' +
  '[&_h2]:mb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-zinc-950 ' +
  '[&_h3]:mb-2 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-zinc-950 ' +
  '[&_p]:mb-3 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-zinc-700 ' +
  '[&_strong]:font-bold [&_strong]:text-zinc-950 [&_em]:italic ' +
  '[&_a]:text-[#5151eb] [&_a]:underline ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 sm:[&_ul]:pl-6 ' +
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 sm:[&_ol]:pl-6 ' +
  '[&_li]:pl-1 [&_li]:text-sm sm:[&_li]:text-base [&_li]:leading-relaxed [&_li]:text-zinc-700 ' +
  '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#5151eb] [&_blockquote]:bg-indigo-50/60 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:italic [&_blockquote]:text-zinc-700 ' +
  '[&_code]:rounded [&_code]:bg-indigo-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-[#5151eb] ' +
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-900 [&_pre]:px-4 [&_pre]:py-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100 ' +
  '[&_table]:my-4 [&_table]:w-full [&_table]:min-w-[560px] [&_table]:border-collapse [&_table]:border [&_table]:border-zinc-200 ' +
  '[&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-zinc-900 ' +
  '[&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-zinc-700 ' +
  '[&_hr]:my-5 [&_hr]:border-zinc-200'

export default function DescriptionSection() {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false)
  const [htmlInput, setHtmlInput] = useState('')

  const sectionRef = useRef<HTMLDivElement>(null)

  const { eventDescription, setEventDescription } = useEventEditorStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#5151eb] underline cursor-pointer',
        },
      }),
      TiptapTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: eventDescription,
    editorProps: {
      attributes: {
        class: `min-h-[260px] px-4 py-4 sm:min-h-[280px] sm:px-5 ${descriptionContentClass}`,
      },
    },
    onUpdate({ editor }) {
      setEventDescription(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const currentHtml = editor.getHTML()
    const nextHtml = eventDescription || '<p></p>'

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml)
    }
  }, [editor, eventDescription])

  const completed = useMemo(() => {
    return eventDescription.replace(/<[^>]*>/g, '').trim().length > 0
  }, [eventDescription])

  function handleSetLink() {
    const previousUrl = editor?.getAttributes('link').href || ''
    const url = window.prompt('Enter URL', previousUrl)

    if (url === null) return

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function handleInsertHtml() {
    const html = htmlInput.trim()
    if (!html) return

    const current = eventDescription || ''
    const separator = current && !current.endsWith('</p>') ? '\n' : ''
    const nextHtml = `${current}${separator}${html}`

    setEventDescription(nextHtml)
    editor?.commands.setContent(nextHtml)
    setHtmlInput('')
    setHtmlDialogOpen(false)
    setActiveTab('preview')
  }

  function handleInsertTable() {
    const rowInput = window.prompt('Rows', '3')
    if (rowInput === null) return

    const columnInput = window.prompt('Columns', '3')
    if (columnInput === null) return

    const rows = Math.max(1, Math.min(20, Number(rowInput) || 3))
    const cols = Math.max(1, Math.min(10, Number(columnInput) || 3))

    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full cursor-pointer text-left"
        >
          <div className="relative p-4 pr-14 sm:p-5 sm:pr-16">
            <h2 className="text-base font-bold text-zinc-900 sm:text-lg">Description</h2>

            <div className="relative mt-3">
              {completed ? (
                <>
                  <div
                    className={`line-clamp-4 overflow-x-auto [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_p]:text-sm [&_li]:text-sm ${descriptionContentClass}`}
                    dangerouslySetInnerHTML={{ __html: eventDescription }}
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white via-white/90 to-transparent" />
                </>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-500">
                  Add more details about your event and include what people can expect if they
                  attend.
                </p>
              )}
            </div>

            <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
              {completed ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={16} className="text-white" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                  <Plus size={16} className="text-zinc-500" />
                </div>
              )}
            </div>
          </div>
        </button>
      )}

      {expanded && (
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Description</h2>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                Add more details about your event and include what people can expect if they attend.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="shrink-0 cursor-pointer rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <ChevronDown size={18} className="rotate-180 text-zinc-400" />
            </button>
          </div>

          <div className="mt-5 flex overflow-x-auto border-b border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
                activeTab === 'editor'
                  ? 'border-[#5151eb] text-[#5151eb]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Pencil size={14} />
              Editor
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
                activeTab === 'preview'
                  ? 'border-[#5151eb] text-[#5151eb]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
              <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-100 bg-zinc-50/80 px-2 py-1.5 sm:flex-wrap">
                <ToolbarButton
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                  isActive={editor?.isActive('paragraph') && !editor?.isActive('heading')}
                  title="Normal text"
                >
                  <Pilcrow size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor?.isActive('heading', { level: 1 })}
                  title="Heading 1"
                >
                  <Heading1 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor?.isActive('heading', { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor?.isActive('heading', { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  isActive={editor?.isActive('bold')}
                  title="Bold"
                >
                  <Bold size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  isActive={editor?.isActive('italic')}
                  title="Italic"
                >
                  <Italic size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  isActive={editor?.isActive('strike')}
                  title="Strikethrough"
                >
                  <Strikethrough size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  isActive={editor?.isActive('codeBlock')}
                  title="Code block"
                >
                  <Code size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  isActive={editor?.isActive('bulletList')}
                  title="Bullet list"
                >
                  <List size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  isActive={editor?.isActive('orderedList')}
                  title="Ordered list"
                >
                  <ListOrdered size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  isActive={editor?.isActive('blockquote')}
                  title="Blockquote"
                >
                  <Quote size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={handleInsertTable}
                  isActive={editor?.isActive('table')}
                  title="Insert table"
                >
                  <TableIcon size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                  disabled={!editor?.isActive('table')}
                  title="Add row"
                >
                  <Rows3 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  disabled={!editor?.isActive('table')}
                  title="Add column"
                >
                  <Columns3 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  disabled={!editor?.isActive('table')}
                  title="Delete row"
                >
                  <span className="text-[10px] font-bold leading-none">-R</span>
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  disabled={!editor?.isActive('table')}
                  title="Delete column"
                >
                  <span className="text-[10px] font-bold leading-none">-C</span>
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().deleteTable().run()}
                  disabled={!editor?.isActive('table')}
                  title="Delete table"
                >
                  <Trash2 size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={() => setHtmlDialogOpen(true)}
                  isActive={htmlDialogOpen}
                  title="Insert HTML"
                >
                  <span className="text-[10px] font-bold leading-none">HTML</span>
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={handleSetLink}
                  isActive={editor?.isActive('link')}
                  title="Insert link"
                >
                  <Link2 size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                <ToolbarButton
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  title="Undo"
                >
                  <Undo2 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  title="Redo"
                >
                  <Redo2 size={14} />
                </ToolbarButton>
              </div>

              <div className="overflow-x-auto">
                <EditorContent editor={editor} />
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
              <div className="min-h-[260px] overflow-x-auto px-4 py-4 sm:min-h-[280px] sm:px-5">
                {completed ? (
                  <div
                    className={descriptionContentClass}
                    dangerouslySetInnerHTML={{ __html: eventDescription }}
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-center sm:h-[240px]">
                    <p className="text-sm text-zinc-400">
                      Nothing to preview yet. Start writing in the editor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {htmlDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-950 sm:text-lg">Insert HTML</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      Paste raw HTML here. It will render in preview and the public event page.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHtmlDialogOpen(false)}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    ×
                  </button>
                </div>

                <textarea
                  value={htmlInput}
                  onChange={(event) => setHtmlInput(event.target.value)}
                  placeholder="<table><thead>...</thead></table>"
                  className="mt-4 h-56 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800 outline-none transition focus:border-[#5151eb] focus:bg-white focus:ring-4 focus:ring-indigo-100 sm:h-64"
                />

                <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setHtmlDialogOpen(false)}
                    className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertHtml}
                    className="cursor-pointer rounded-xl bg-[#5151eb] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4040d0]"
                  >
                    Insert HTML
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
        isActive
          ? 'bg-[#5151eb] text-white'
          : disabled
            ? 'cursor-not-allowed text-zinc-300'
            : 'cursor-pointer text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-zinc-200" />
}