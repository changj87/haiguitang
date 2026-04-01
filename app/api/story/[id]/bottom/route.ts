import { NextRequest, NextResponse } from 'next/server'
import { getStoryFull } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await getStoryFull(params.id)
    if (!story) {
      return NextResponse.json({ error: '故事不存在' }, { status: 404 })
    }
    return NextResponse.json({ bottom: story.bottom })
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取汤底失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
