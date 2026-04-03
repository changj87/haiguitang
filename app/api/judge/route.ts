import { NextRequest, NextResponse } from 'next/server'
import { getStoryFull, completeSession } from '@/lib/supabase'
import { buildJudgePrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storyId, playerAnswer, sessionId, timeSpent } = body

    if (!storyId || !playerAnswer?.trim()) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }
    if (playerAnswer.trim().length > 500) {
      return NextResponse.json({ error: '答案不能超过500字' }, { status: 400 })
    }

    const story = await getStoryFull(storyId)
    const judgePrompt = buildJudgePrompt(story.bottom, story.key_points, playerAnswer.trim())

    const aiRes = await fetch(`${process.env.DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: judgePrompt }],
        max_tokens: 200,
        temperature: 0.1,
      }),
    })

    if (!aiRes.ok) {
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 502 })
    }

    const aiData = await aiRes.json()
    const rawText = aiData.choices?.[0]?.message?.content?.trim() ?? '{}'

    let judgeResult: { correct: boolean; coverage: number; missing: string[] }
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      judgeResult = JSON.parse(cleaned)
    } catch {
      judgeResult = { correct: false, coverage: 0, missing: story.key_points }
    }

    let stars: 1 | 2 | 3 | null = null
    if (judgeResult.correct && sessionId) {
      stars = judgeResult.coverage >= 95 ? 3 : judgeResult.coverage >= 80 ? 2 : 1
      const t = typeof timeSpent === 'number' ? timeSpent : 0
      await completeSession(sessionId, t, stars)
    }

    return NextResponse.json({
      correct: judgeResult.correct,
      coverage: judgeResult.coverage,
      missing: judgeResult.missing ?? [],
      stars,
    })
  } catch (error) {
    console.error('Judge API 错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
