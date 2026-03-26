'use client'
import { useRouter } from 'next/navigation'
import { BookOpen, BookMarked, GraduationCap, Lightbulb } from 'lucide-react'

interface Props {
  chapterId: string
  activeTab: string
  hasBookingEntries: boolean
  hasQuiz: boolean
}

export function ChapterTabNav({ chapterId, activeTab, hasBookingEntries, hasQuiz }: Props) {
  const router = useRouter()

  const tabs = [
    { id: 'verstehen', label: 'Verstehen', icon: Lightbulb },
    ...(hasBookingEntries ? [{ id: 'buchungssaetze', label: 'Buchungssätze', icon: BookMarked }] : []),
    ...(hasBookingEntries ? [{ id: 'ueben', label: 'Üben', icon: GraduationCap }] : []),
    ...(hasQuiz ? [{ id: 'quiz', label: 'Quiz', icon: BookOpen }] : []),
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/chapters/${chapterId}?tab=${tab.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center"
            style={active
              ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.1))', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
              : { color: '#64748b', border: '1px solid transparent' }
            }
          >
            <tab.icon size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
