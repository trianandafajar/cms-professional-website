// src/components/organizations/editor/sections/description-section.tsx

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
} from 'lucide-react'

import { useEffect, useMemo, useRef, useState } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'

import LinkExtension from '@tiptap/extension-link'

import Heading from '@tiptap/extension-heading'

export default function DescriptionSection() {
  const [expanded, setExpanded] = useState(false)
  const [html, setHtml] = useState('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const sectionRef = useRef<HTMLDivElement>(null)

  // close outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    ],

    content: '',

    editorProps: {
      attributes: {
        class:
          'min-h-[280px] outline-none px-5 py-4 prose prose-sm max-w-none prose-headings:text-zinc-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-700 prose-p:leading-relaxed prose-li:text-zinc-700 prose-strong:text-zinc-900 prose-a:text-[#5151eb] prose-a:underline prose-blockquote:border-l-[#5151eb] prose-blockquote:text-zinc-600 prose-code:text-[#5151eb] prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
      },
    },

    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
  })

  const completed = useMemo(() => {
    return html.replace(/<[^>]*>/g, '').trim().length > 0
  }, [html])

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

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="w-full">
          <div className="relative p-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 text-start">Description</h2>

              {/* CONTENT PREVIEW */}
              <div className="relative mt-3">
                {completed ? (
                  <>
                    <div
                      className="prose prose-sm line-clamp-4 max-w-none text-start [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-zinc-900 [&_p]:text-sm [&_p]:text-zinc-600 [&_p]:leading-relaxed [&_strong]:text-zinc-900 [&_em]:italic [&_a]:text-[#5151eb] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-sm [&_li]:text-zinc-600 [&_blockquote]:border-l-2 [&_blockquote]:border-[#5151eb] [&_blockquote]:pl-3 [&_blockquote]:text-zinc-500 [&_blockquote]:italic [&_code]:text-[#5151eb] [&_code]:bg-indigo-50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                    {/* GRADIENT */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white via-white/90 to-transparent" />
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 text-start">
                    Add more details about your event and include what people can expect if they
                    attend.
                  </p>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="absolute right-5 top-5">
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

      {/* EXPANDED */}
      {expanded && (
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 text-start">Description</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Add more details about your event and include what people can expect if they attend.
              </p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 transition hover:bg-zinc-100"
            >
              <ChevronDown size={18} className="rotate-180 text-zinc-400" />
            </button>
          </div>

          {/* TABS: Editor / Preview */}
          <div className="mt-5 flex items-center gap-1 border-b border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
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
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
                activeTab === 'preview'
                  ? 'border-[#5151eb] text-[#5151eb]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {/* EDITOR TAB */}
          {activeTab === 'editor' && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-zinc-50/80 px-2 py-1.5">
                {/* Text Type Group */}
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

                {/* Inline Format Group */}
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
                  onClick={() => editor?.chain().focus().toggleCode().run()}
                  isActive={editor?.isActive('code')}
                  title="Inline code"
                >
                  <Code size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Block Group */}
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
                  title="Numbered list"
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

                {/* Link */}
                <ToolbarButton
                  onClick={handleSetLink}
                  isActive={editor?.isActive('link')}
                  title="Insert link"
                >
                  <Link2 size={14} />
                </ToolbarButton>

                <ToolbarDivider />

                {/* History */}
                <ToolbarButton
                  onClick={() => editor?.chain().focus().undo().run()}
                  isActive={false}
                  disabled={!editor?.can().undo()}
                  title="Undo"
                >
                  <Undo2 size={14} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor?.chain().focus().redo().run()}
                  isActive={false}
                  disabled={!editor?.can().redo()}
                  title="Redo"
                >
                  <Redo2 size={14} />
                </ToolbarButton>
              </div>

              {/* EDITOR CONTENT */}
              <EditorContent editor={editor} />
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
              <div className="min-h-[280px] px-5 py-4">
                {completed ? (
                  <div
                    className="prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-zinc-900 [&_h3]:mb-2 [&_p]:text-sm [&_p]:text-zinc-700 [&_p]:leading-relaxed [&_p]:mb-3 [&_strong]:text-zinc-900 [&_em]:italic [&_s]:line-through [&_a]:text-[#5151eb] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-sm [&_li]:text-zinc-700 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[#5151eb] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:text-zinc-500 [&_blockquote]:italic [&_blockquote]:my-3 [&_code]:text-[#5151eb] [&_code]:bg-indigo-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <div className="flex h-[240px] items-center justify-center">
                    <p className="text-sm text-zinc-400">
                      Nothing to preview yet. Start writing in the editor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Toolbar Button Component
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
      className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
        isActive
          ? 'bg-[#5151eb] text-white'
          : disabled
            ? 'text-zinc-300 cursor-not-allowed'
            : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  )
}

// Toolbar Divider Component
function ToolbarDivider() {
  return <div className="mx-1 h-4 w-px bg-zinc-200" />
}
