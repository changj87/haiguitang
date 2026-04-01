import { NextResponse } from 'next/server'
import { getStories } from '@/lib/supabase'

export async function GET() {
  try {
    const stories = await getStories()
    return NextResponse.json({ stories })
  } catch (error) {
    console.error('获取题目列表错误:', error)
    return NextResponse.json({ stories: [] }, { status: 500 })
  }
}
