import { NextRequest, NextResponse } from 'next/server'
import { createGameSession } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { storyId, userId } = await req.json()

    if (!storyId) {
      return NextResponse.json({ error: '缺少故事ID' }, { status: 400 })
    }

    const session = await createGameSession(storyId, userId || null)

    return NextResponse.json({ 
      sessionId: session.id,
      session 
    })
  } catch (error) {
    console.error('创建会话错误:', error)
    const message = error instanceof Error ? error.message : '创建会话失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
