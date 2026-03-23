import { prisma } from '@/lib/prisma'
import { getOpenAIClient, ASSISTANT_MODEL, buildSystemPrompt } from '@/lib/openai'

export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, chapterId } = body as {
      messages: ChatMessage[]
      chapterId?: string | null
    }

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error: 'NO_API_KEY',
          message:
            'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.',
        },
        { status: 200 }
      )
    }

    // Build context from chapter if provided
    let chapterContext: Parameters<typeof buildSystemPrompt>[0] = undefined

    if (chapterId) {
      try {
        const chapter = await prisma.chapter.findUnique({
          where: { id: chapterId },
          include: {
            topic: { select: { title: true } },
            learningGoals: { select: { text: true }, orderBy: { order: 'asc' } },
            keyTerms: { select: { term: true, definition: true }, orderBy: { order: 'asc' } },
          },
        })

        if (chapter) {
          chapterContext = {
            topicTitle: chapter.topic.title,
            chapterTitle: chapter.title,
            summary: chapter.summary ?? undefined,
            learningGoals: chapter.learningGoals.map(g => g.text),
            keyTerms: chapter.keyTerms,
          }
        }
      } catch {
        // proceed without context
      }
    }

    const systemPrompt = buildSystemPrompt(chapterContext)

    const openai = getOpenAIClient()
    const resp = await openai.chat.completions.create({
      model: ASSISTANT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = resp.choices[0]?.message?.content ?? ''

    return Response.json({ content })
  } catch (error: unknown) {
    console.error('POST /api/assistant/chat error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('API key')) {
      return Response.json(
        { error: 'NO_API_KEY', message: 'Invalid or missing OpenAI API key.' },
        { status: 200 }
      )
    }

    return Response.json({ error: 'Failed to get response from AI', message }, { status: 500 })
  }
}
