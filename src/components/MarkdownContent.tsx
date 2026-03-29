'use client'

import { Markdown } from 'react-markdown'

export function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="markdown-content space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mt-5 mb-2 uppercase tracking-wide text-blue-400">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-4 mb-1.5" style={{ color: 'var(--text-primary)' }}>{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-3 mb-1" style={{ color: '#a78bfa' }}>{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-3 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 mb-3 pl-4 list-decimal" style={{ color: 'var(--text-secondary)' }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(96,165,250,0.5)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic" style={{ color: '#c4b5fd' }}>{children}</em>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code
                  className="block p-3 rounded-xl text-xs font-mono overflow-x-auto mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: '#86efac' }}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: 'rgba(96,165,250,0.12)', color: '#93c5fd' }}
              >
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote
              className="pl-4 py-2 my-3 rounded-r-xl"
              style={{ borderLeft: '3px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.06)', color: '#c4b5fd' }}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className="px-3 py-2 text-left font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-3 py-2"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
