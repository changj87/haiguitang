import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - 获取所有题目（含汤底，仅管理后台用）
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ stories: data ?? [] })
  } catch (error) {
    console.error('获取题目错误:', error)
    return NextResponse.json({ stories: [] }, { status: 500 })
  }
}

// POST - 新增题目
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, difficulty, category, surface, bottom, key_points } = body

    if (!title || !surface || !bottom || !key_points?.length) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('stories')
      .insert({ title, difficulty, category, surface, bottom, key_points })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ story: data })
  } catch (error) {
    console.error('新增题目错误:', error)
    return NextResponse.json({ error: '新增失败' }, { status: 500 })
  }
}
