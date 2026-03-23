import type { ContentStatus, ExamType, ProgressStatus } from '@/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium' }).format(new Date(date))
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`
}

export function getGrade(scorePercent: number): { grade: string; label: string; color: string } {
  if (scorePercent >= 90) return { grade: '6', label: 'Ausgezeichnet', color: 'text-emerald-600' }
  if (scorePercent >= 75) return { grade: '5', label: 'Gut', color: 'text-green-600' }
  if (scorePercent >= 60) return { grade: '4.5', label: 'Befriedigend', color: 'text-yellow-600' }
  if (scorePercent >= 50) return { grade: '4', label: 'Genügend', color: 'text-orange-500' }
  return { grade: '3', label: 'Ungenügend', color: 'text-red-600' }
}

export const STATUS_LABELS: Record<ContentStatus, string> = {
  complete: 'Vollständig',
  partial: 'Teilweise',
  draft: 'Entwurf',
  missing: 'Fehlend',
}

export const STATUS_COLORS: Record<ContentStatus, string> = {
  complete: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-blue-100 text-blue-800',
  missing: 'bg-gray-100 text-gray-600',
}

export const PROGRESS_LABELS: Record<ProgressStatus, string> = {
  not_started: 'Nicht begonnen',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
}

export const PROGRESS_COLORS: Record<ProgressStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export const EXAM_LABELS: Record<ExamType, string> = {
  querschnitt: 'QSP',
  abschluss: 'AP',
  both: 'AP / QSP',
}

export const EXAM_LABELS_LONG: Record<ExamType, string> = {
  querschnitt: 'Querschnittsprüfung',
  abschluss: 'Abschlussprüfung (Diplom)',
  both: 'Abschluss- & Querschnittsprüfung',
}

export const EXAM_COLORS: Record<ExamType, string> = {
  querschnitt: 'bg-emerald-100 text-emerald-800',
  abschluss: 'bg-amber-100 text-amber-800',
  both: 'bg-indigo-100 text-indigo-800',
}

export const EXAM_ICON_COLORS: Record<ExamType, string> = {
  querschnitt: 'bg-emerald-500 text-white shadow-emerald-200',
  abschluss: 'bg-amber-400 text-white shadow-amber-200',
  both: 'bg-indigo-500 text-white shadow-indigo-200',
}

export const CATEGORY_LABELS: Record<string, string> = {
  bwl: 'Betriebswirtschaft',
  vwl: 'Volkswirtschaft',
  recht: 'Recht',
}

export const CATEGORY_COLORS: Record<string, string> = {
  bwl: 'from-blue-500 to-blue-700',
  vwl: 'from-emerald-500 to-emerald-700',
  recht: 'from-violet-500 to-violet-700',
}

export const TOPIC_ICON_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  violet: 'bg-violet-50 text-violet-600 ring-violet-200',
  amber: 'bg-amber-50 text-amber-600 ring-amber-200',
  rose: 'bg-rose-50 text-rose-600 ring-rose-200',
  cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-200',
  orange: 'bg-orange-50 text-orange-600 ring-orange-200',
  indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-200',
}
