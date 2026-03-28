'use client'

import { useEffect } from 'react'

export function VisitTracker({ chapterId }: { chapterId: string }) {
  useEffect(() => {
    fetch('/api/frw/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId }),
    }).catch(() => {/* fire-and-forget, silently ignore errors */})
  }, [chapterId])

  return null
}
