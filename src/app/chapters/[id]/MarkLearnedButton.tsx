'use client'

import { useState } from 'react'
import type { ProgressStatus } from '@/types'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface Props {
  chapterId: string
  currentStatus: string
}

const STATUS_LABEL: Record<ProgressStatus, string> = {
  not_started: 'Nicht begonnen',
  in_progress:  'In Bearbeitung',
  completed:    'Abgeschlossen',
}

export function MarkLearnedButton({ chapterId, currentStatus }: Props) {
  const [status, setStatus] = useState<ProgressStatus>(currentStatus as ProgressStatus)
  const [loading, setLoading] = useState(false)

  const isCompleted = status === 'completed'

  async function handleClick() {
    const newStatus: ProgressStatus = isCompleted ? 'in_progress' : 'completed'
    setLoading(true)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, status: newStatus }),
      })
      setStatus(newStatus)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <span className="text-[11px] font-medium text-slate-500">{STATUS_LABEL[status]}</span>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${
          isCompleted
            ? 'text-emerald-400'
            : 'text-slate-300 hover:text-emerald-400'
        }`}
        style={
          isCompleted
            ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }
            : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
        }
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 size={15} />
        ) : (
          <Circle size={15} />
        )}
        {isCompleted ? 'Gelernt' : 'Als gelernt markieren'}
      </button>
    </div>
  )
}
