import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export const ASSISTANT_MODEL = 'gpt-4o-mini' // change here to upgrade model

export function buildSystemPrompt(context?: {
  topicTitle?: string
  chapterTitle?: string
  summary?: string
  keyTerms?: Array<{ term: string; definition: string }>
  learningGoals?: string[]
}): string {
  let systemPrompt = `Du bist ein geduldiger, freundlicher Lerncoach für Schüler, die sich auf die Wirtschaft-und-Recht-Abschlussprüfung (HMS/Handelsmittelschule Schweiz) vorbereiten.

Deine Aufgaben:
- Erkläre Konzepte einfach und verständlich, mit konkreten Beispielen
- Beantworte Fragen zum aktuellen Kapitel und Thema
- Motiviere und unterstütze den Schüler
- Bleibe beim relevanten Unterrichtsstoff
- Wenn du allgemeines Fachwissen ergänzt, das nicht im Material steht, kennzeichne das klar
- Antworte auf Deutsch (Schweizer Hochdeutsch)
- Halte Antworten klar strukturiert, nicht zu lang

Format:
- Verwende Aufzählungspunkte für Auflistungen
- Hebe wichtige Begriffe hervor
- Gib bei Bedarf Beispiele aus dem Alltag`

  if (context) {
    systemPrompt += '\n\n--- AKTUELLER LERNKONTEXT ---'
    if (context.topicTitle) systemPrompt += `\nThema: ${context.topicTitle}`
    if (context.chapterTitle) systemPrompt += `\nKapitel: ${context.chapterTitle}`
    if (context.summary) systemPrompt += `\n\nZusammenfassung:\n${context.summary}`
    if (context.learningGoals?.length) {
      systemPrompt += `\n\nLernziele:\n${context.learningGoals.map(g => `- ${g}`).join('\n')}`
    }
    if (context.keyTerms?.length) {
      systemPrompt += `\n\nWichtige Begriffe:\n${context.keyTerms.map(t => `- ${t.term}: ${t.definition}`).join('\n')}`
    }
  }

  return systemPrompt
}
