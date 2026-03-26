export type ExamType = 'querschnitt' | 'abschluss' | 'both'
export type Category = 'bwl' | 'vwl' | 'recht' | 'frw'
export type ContentStatus = 'complete' | 'partial' | 'draft' | 'missing'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type QuestionType = 'multiple_choice' | 'true_false'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type MessageRole = 'user' | 'assistant'

export interface Topic {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  examType: ExamType
  category: Category
  order: number
  chapters?: Chapter[]
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  topicId: string
  topic?: Topic
  order: number
  contentStatus: ContentStatus
  summary?: string | null
  keyTerms?: KeyTerm[]
  corePoints?: CorePoint[]
  examples?: Example[]
  learningGoals?: LearningGoal[]
  quizQuestions?: QuizQuestion[]
  bookingEntries?: BookingEntry[]
  formulas?: Formula[]
  progress?: ChapterProgress | null
  createdAt: string
  updatedAt: string
}

export interface BookingEntry {
  id: string
  situation: string
  sollKonto: string
  habenKonto: string
  betragHint?: string | null
  erklaerung: string
  chapterId: string
  order: number
}

export interface Formula {
  id: string
  name: string
  formel: string
  erklaerung: string
  chapterId: string
  order: number
}

export interface LearningGoal {
  id: string
  text: string
  chapterId: string
  order: number
}

export interface KeyTerm {
  id: string
  term: string
  definition: string
  chapterId: string
  order: number
}

export interface CorePoint {
  id: string
  text: string
  chapterId: string
  order: number
}

export interface Example {
  id: string
  text: string
  chapterId: string
  order: number
}

export interface QuizOption {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  order: number
}

export interface QuizQuestion {
  id: string
  chapterId: string
  questionText: string
  questionType: QuestionType
  options: QuizOption[]
  explanation: string
  difficulty: Difficulty
  order: number
}

export interface QuizAttempt {
  id: string
  chapterId: string
  totalQ: number
  correctQ: number
  scorePercent: number
  completedAt: string
}

export interface ChapterProgress {
  id: string
  chapterId: string
  status: ProgressStatus
  bestScore?: number | null
  lastVisited: string
  updatedAt: string
}

export interface AssistantMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  chapterId?: string | null
  createdAt: string
}

export interface DashboardStats {
  totalChapters: number
  completedChapters: number
  inProgressChapters: number
  averageScore: number
  totalQuizAttempts: number
  topicsProgress: TopicProgress[]
}

export interface TopicProgress {
  topicId: string
  topicTitle: string
  topicSlug: string
  totalChapters: number
  completedChapters: number
  percentComplete: number
  bestScore: number | null
}
