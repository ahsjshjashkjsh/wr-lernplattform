'use client'
import {
  TrendingUp, DollarSign, BarChart2, Shield, FileText, Briefcase,
  Building2, Heart, RefreshCw, Tag, Coins, Activity, Landmark,
  GitBranch, Users, BookOpen, Scale, PieChart, Calculator,
  GraduationCap, Banknote, Globe, Handshake, type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  TrendingUp, DollarSign, BarChart2, Shield, FileText, Briefcase,
  Building2, Heart, RefreshCw, Tag, Coins, Activity, Landmark,
  GitBranch, Users, BookOpen, Scale, PieChart, Calculator,
  GraduationCap, Banknote, Globe, Handshake,
}

export function TopicIcon({
  name,
  size = 20,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const Icon = ICON_MAP[name]
  if (!Icon) return <span className={className}>📚</span>
  return <Icon size={size} className={className} />
}
