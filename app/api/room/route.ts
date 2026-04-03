import { NextRequest, NextResponse } from 'next/server'
import { createRoom, getRoomByCode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { storyId, hostId } = await req.json()

    if (!storyId || !hostId) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const room = await createRoom(storyId, hostId)
    return NextResponse.json({ room })
  } catch {
    return NextResponse.json({ error: '创建房间失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: '请提供房间码' }, { status: 400 })
    }

    const room = await getRoomByCode(code)

    if (!room) {
      return NextResponse.json({ error: '房间不存在' }, { status: 404 })
    }

    return NextResponse.json({ room })
  } catch {
    return NextResponse.json({ error: '查询房间失败' }, { status: 500 })
  }
}