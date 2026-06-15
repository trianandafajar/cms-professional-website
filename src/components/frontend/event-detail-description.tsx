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
  content: RichTextContent | string | null | undefined
}

const eventDescriptionClass =
  'max-w-none text-start text-zinc-700 ' +
  '[&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:text-[#12192f] ' +
  '[&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-[#12192f] ' +
  '[&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-[#12192f] ' +
  '[&_p]:mb-3 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-zinc-700 ' +
  '[&_strong]:font-bold [&_strong]:text-zinc-950 [&_em]:italic ' +
  '[&_a]:text-[#5151eb] [&_a]:underline ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 ' +
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 ' +
  '[&_li]:pl-1 [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-zinc-700 ' +
  '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#5151eb] [&_blockquote]:bg-indigo-50/60 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:italic [&_blockquote]:text-zinc-700 ' +
  '[&_code]:rounded [&_code]:bg-indigo-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-[#5151eb] ' +
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-900 [&_pre]:px-4 [&_pre]:py-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100 ' +
  '[&_.table-scroll]:my-4 [&_.table-scroll]:w-full [&_.table-scroll]:overflow-x-auto [&_.table-scroll]:rounded-lg [&_.table-scroll]:border [&_.table-scroll]:border-zinc-200 ' +
  '[&_.table-scroll::-webkit-scrollbar]:h-2 [&_.table-scroll::-webkit-scrollbar-track]:bg-zinc-100 [&_.table-scroll::-webkit-scrollbar-thumb]:rounded-full [&_.table-scroll::-webkit-scrollbar-thumb]:bg-zinc-300 ' +
  '[&_table]:w-full [&_table]:min-w-[640px] [&_table]:border-collapse ' +
  '[&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-zinc-900 ' +
  '[&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-zinc-700 ' +
  '[&_hr]:my-5 [&_hr]:border-zinc-200'

function normalizeHtmlContent(content: string): string {
  let normalized = content.trim()

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    try {
      const parsed = JSON.parse(normalized)
      if (typeof parsed === 'string') normalized = parsed
    } catch {
      normalized = normalized.slice(1, -1)
    }
  }

  const shouldDecodeEscapedHtml =
    /&lt;\s*\/?\s*(h[1-6]|p|div|span|ul|ol|li|table|thead|tbody|tr|td|th|strong|em|a|br|blockquote)\b/i.test(
      normalized,
    )

  if (shouldDecodeEscapedHtml) {
    const decodeEntityMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    }

    normalized = normalized.replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g,
      (entity) => decodeEntityMap[entity] ?? entity,
    )
  }

  return normalized
}

function wrapTablesWithScroll(html: string): string {
  return html.replace(
    /<table(\s[^>]*)?>/gi,
    (match) => `<div class="table-scroll">${match}`,
  ).replace(/<\/table>/gi, '</table></div>')
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
  if (typeof content === 'string') {
    const html = wrapTablesWithScroll(normalizeHtmlContent(content))

    return html ? (
      <div
        className={eventDescriptionClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ) : null
  }

  if (!content?.root?.children) {
    return null
  }

  const nodes = content.root.children

  const PREVIEW_COUNT = 4
  const hasMore = nodes.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? nodes : nodes.slice(0, PREVIEW_COUNT)

  return (
    <div>
      <div className={eventDescriptionClass}>
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
