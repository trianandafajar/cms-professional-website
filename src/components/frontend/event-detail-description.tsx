'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ElementType } from 'react'

type RichTextContent = {
  root: {
    type: string
    children: {
      type: string
      version: number
      [k: string]: unknown
    }[]
    direction: ('ltr' | 'rtl') | null
    format: string
    indent: number
    version: number
  }
  [k: string]: unknown
}

type Props = {
  content: RichTextContent
}

/**
 * Minimal Lexical rich-text renderer.
 * Handles paragraphs, headings, lists, and inline bold/italic/underline.
 * For a full renderer, use @payloadcms/richtext-lexical/react.
 */
function renderNode(node: Record<string, unknown>, idx: number): React.ReactNode {
  const type = node.type as string
  const children = (node.children as Record<string, unknown>[] | undefined) ?? []

  if (type === 'text') {
    let text = (node.text as string) ?? ''
    const format = (node.format as number) ?? 0
    if (format & 1) text = `<strong>${text}</strong>`
    if (format & 2) text = `<em>${text}</em>`
    if (format & 8) text = `<u>${text}</u>`
    return <span key={idx} dangerouslySetInnerHTML={{ __html: text }} />
  }

  if (type === 'paragraph') {
    return (
      <p key={idx} className="mb-3 leading-relaxed text-zinc-700">
        {children.map((c, i) => renderNode(c, i))}
      </p>
    )
  }

  if (type === 'heading') {
    const tag = (node.tag as string) ?? 'h3'
    const Tag = tag as ElementType
    return (
      <Tag key={idx} className="mt-5 mb-2 font-bold text-[#12192f]">
        {children.map((c, i) => renderNode(c, i))}
      </Tag>
    )
  }

  if (type === 'list') {
    const listType = (node.listType as string) ?? 'bullet'
    const Tag = listType === 'number' ? 'ol' : 'ul'
    return (
      <Tag
        key={idx}
        className={`mb-3 pl-5 ${listType === 'number' ? 'list-decimal' : 'list-disc'} text-zinc-700`}
      >
        {children.map((c, i) => renderNode(c, i))}
      </Tag>
    )
  }

  if (type === 'listitem') {
    return (
      <li key={idx} className="mb-1">
        {children.map((c, i) => renderNode(c, i))}
      </li>
    )
  }

  if (type === 'linebreak') {
    return <br key={idx} />
  }

  return <span key={idx}>{children.map((c, i) => renderNode(c, i))}</span>
}

export function EventDetailDescription({ content }: Props) {
  const [expanded, setExpanded] = useState(false)
  const nodes = content.root.children

  const PREVIEW_COUNT = 4
  const hasMore = nodes.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? nodes : nodes.slice(0, PREVIEW_COUNT)

  return (
    <div>
      <div className="prose prose-sm max-w-none">
        {visible.map((node, i) => renderNode(node as Record<string, unknown>, i))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#5151eb] hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-4" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-4" /> Read more
            </>
          )}
        </button>
      )}
    </div>
  )
}
