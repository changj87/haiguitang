import { NextRequest, NextResponse } from 'next/server'
import { getStoryPublic } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: '缺少题目ID' }, { status: 400 })
    }

    const story = await getStoryPublic(id)

    if (!story) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 })
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error('获取题目错误:', error)
    // 返回详细错误信息方便调试
    const message = error instanceof Error ? error.message : '获取题目失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
