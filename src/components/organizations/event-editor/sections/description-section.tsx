// src/components/organizations/editor/sections/description-section.tsx

'use client'

import { Check, ChevronDown, Plus } from 'lucide-react'

import { useEffect, useMemo, useRef, useState } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'

import Link from '@tiptap/extension-link'

import Heading from '@tiptap/extension-heading'

export default function DescriptionSection() {
  const [expanded, setExpanded] = useState(false)

  const [html, setHtml] = useState('')

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
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],

    content: '',

    editorProps: {
      attributes: {
        class:
          'min-h-[320px] outline-none px-6 py-5 prose prose-lg max-w-none prose-headings:text-[#1E0A3C] prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-black prose-a:text-blue-600',
      },
    },

    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
  })

  const completed = useMemo(() => {
    return html.replace(/<[^>]*>/g, '').trim().length > 0
  }, [html])

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition"
    >
      {/* COLLAPSED */}
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="w-full">
          <div className="relative p-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1E0A3C] text-start">Overview</h2>

              {/* CONTENT */}
              <div className="relative mt-5">
                {completed ? (
                  <>
                    <div
                      className="prose prose-gray line-clamp-4 max-w-none text-lg text-start"
                      dangerouslySetInnerHTML={{
                        __html: html,
                      }}
                    />

                    {/* GRADIENT */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />
                  </>
                ) : (
                  <p className="text-lg text-gray-500 text-start">
                    Add more details about your event and include what people can expect if they
                    attend.
                  </p>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="absolute right-6 top-6">
              {completed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400">
                  <Check size={22} className="text-white" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Plus size={20} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </button>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#1E0A3C] text-start">Overview</h2>

              <p className="mt-3 text-lg text-gray-600">
                Add more details about your event and include what people can expect if they attend.
              </p>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="rounded-xl p-2 transition hover:bg-gray-100"
            >
              <ChevronDown size={24} className="rotate-180 text-gray-500" />
            </button>
          </div>

          {/* INFO */}
          <div className="mt-10 rounded-2xl bg-blue-50 px-5 py-4 text-base text-blue-700">
            Use arrow keys to navigate between modules. Use the up and down buttons to reorder
            modules.
          </div>

          {/* EDITOR */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-gray-300">
            {/* TOOLBAR */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
              {/* PARAGRAPH */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().setParagraph().run()}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  editor?.isActive('paragraph') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                Normal
              </button>

              {/* H1 */}
              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: 1,
                    })
                    .run()
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  editor?.isActive('heading', {
                    level: 1,
                  })
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                H1
              </button>

              {/* H2 */}
              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: 2,
                    })
                    .run()
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  editor?.isActive('heading', {
                    level: 2,
                  })
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                H2
              </button>

              {/* H3 */}
              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: 3,
                    })
                    .run()
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  editor?.isActive('heading', {
                    level: 3,
                  })
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                H3
              </button>

              <div className="mx-1 h-6 w-px bg-gray-300" />

              {/* BOLD */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  editor?.isActive('bold') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                B
              </button>

              {/* ITALIC */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`rounded-lg px-3 py-2 text-sm italic transition ${
                  editor?.isActive('italic') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                I
              </button>

              {/* BLOCKQUOTE */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  editor?.isActive('blockquote') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                "
              </button>

              <div className="mx-1 h-6 w-px bg-gray-300" />

              {/* BULLET */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  editor?.isActive('bulletList') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                • List
              </button>

              {/* ORDERED */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  editor?.isActive('orderedList') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                1. List
              </button>

              <div className="mx-1 h-6 w-px bg-gray-300" />

              {/* LINK */}
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('Enter URL')

                  if (!url) return

                  editor
                    ?.chain()
                    .focus()
                    .setLink({
                      href: url,
                    })
                    .run()
                }}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  editor?.isActive('link') ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                Link
              </button>

              <div className="mx-1 h-6 w-px bg-gray-300" />

              {/* UNDO */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                className="rounded-lg px-3 py-2 text-sm transition hover:bg-gray-200"
              >
                Undo
              </button>

              {/* REDO */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                className="rounded-lg px-3 py-2 text-sm transition hover:bg-gray-200"
              >
                Redo
              </button>
            </div>

            {/* CONTENT */}
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
    </div>
  )
}
