import { NextRequest, NextResponse } from 'next/server'
import { getStoryFull, updateSessionMessages } from '@/lib/supabase'
import { buildGameSystemPrompt } from '@/lib/prompts'
import type { ChatRequest, Message } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { storyId, question, messages, sessionId }: ChatRequest = await req.json()

    if (!storyId || !question) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 1. 获取完整故事信息（包含汤底）
    const story = await getStoryFull(storyId)
    if (!story) {
      return NextResponse.json({ error: '故事不存在' }, { status: 404 })
    }

    // 2. 调用 DeepSeek API (通过 OpenAI 兼容接口)
    const systemPrompt = buildGameSystemPrompt(story.bottom, story.key_points)
    
    // 构造发送给 AI 的消息历史
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ]

    const response = await fetch(`${process.env.DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: aiMessages,
        temperature: 0.3,
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek API Error:', errorData)
      throw new Error('AI 服务响应错误')
    }

    const data = await response.json()
    const answer = data.choices[0].message.content.trim()

    // 3. 构造返回的消息对象
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: Date.now()
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: answer,
      timestamp: Date.now()
    }

    // 4. 如果有 sessionId，更新数据库中的对话记录
    if (sessionId) {
      const updatedMessages = [...messages, userMessage, assistantMessage]
      // 这里不等待数据库更新，直接返回结果以提高响应速度
      // 实际上 updateSessionMessages 在 lib/supabase.ts 中已定义
      updateSessionMessages(sessionId, updatedMessages, Math.floor(updatedMessages.length / 2))
        .catch(err => console.error('Update session messages error:', err))
    }

    return NextResponse.json({
      answer,
      message: assistantMessage
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
