import { NextRequest, NextResponse } from 'next/server'
import { getStoryFull, updateGameResult } from '@/lib/supabase'
import { buildJudgePrompt } from '@/lib/prompts'
import type { JudgeRequest, JudgeResponse } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { storyId, playerAnswer, sessionId, timeSpent, questionCount }: JudgeRequest = await req.json()

    if (!storyId || !playerAnswer || !sessionId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 1. 获取完整故事信息
    const story = await getStoryFull(storyId)
    if (!story) {
      return NextResponse.json({ error: '故事不存在' }, { status: 404 })
    }

    // 2. 调用 AI 进行判断
    const judgePrompt = buildJudgePrompt(story.bottom, story.key_points, playerAnswer)
    
    const response = await fetch(`${process.env.DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: judgePrompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error('AI 服务响应错误')
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const judgeResult: JudgeResponse = JSON.parse(content)

    // 3. 根据结果计算星级
    let stars: 1 | 2 | 3 | null = null
    if (judgeResult.correct) {
      if (timeSpent < 120 && questionCount < 10) {
        stars = 3
      } else if (timeSpent < 300 && questionCount < 20) {
        stars = 2
      } else {
        stars = 1
      }
    }

    // 4. 更新数据库中的游戏会话状态
    await updateGameResult(sessionId, judgeResult.correct ? 'completed' : 'gave_up', timeSpent, stars)

    return NextResponse.json({ ...judgeResult, stars })

  } catch (error) {
    console.error('Judge API Error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
