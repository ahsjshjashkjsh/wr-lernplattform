'use client'

import { Markdown } from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="frw-markdown space-y-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className="text-base font-bold mt-8 mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <div className="flex items-center gap-2 mt-7 mb-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#60a5fa' }}>
                {children}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.12)' }} />
            </div>
          ),
          h3: ({ children }) => (
            <h3
              className="text-sm font-semibold mt-5 mb-2 pl-2"
              style={{ color: 'var(--text-primary)', borderLeft: '2px solid rgba(96,165,250,0.4)' }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold mt-4 mb-1.5 uppercase tracking-wide" style={{ color: '#a78bfa' }}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic" style={{ color: '#c4b5fd' }}>
              {children}
            </em>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code
                  className="block p-3 rounded-xl text-xs font-mono overflow-x-auto mb-3 mt-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#86efac' }}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: 'rgba(96,165,250,0.1)', color: '#93c5fd' }}
              >
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote
              className="pl-4 py-2 my-3 rounded-r-xl text-sm"
              style={{ borderLeft: '3px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.06)', color: '#c4b5fd' }}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 mt-2 rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: 'rgba(96,165,250,0.07)' }}>{children}</thead>
          ),
          th: ({ children }) => (
            <th
              className="px-3 py-2 text-left font-semibold"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-3 py-2"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
