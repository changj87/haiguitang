import { createClient } from '@supabase/supabase-js'
import type { Story, GameSession, Room, Message } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 前端客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端客户端（API Route 专用）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ===== 题库操作 =====

export async function getStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, difficulty, category, surface, play_count, created_at')
    .order('play_count', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getStoryPublic(id: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, difficulty, category, surface, play_count, created_at')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getStoryFull(id: string): Promise<Story> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Story
}

export async function incrementPlayCount(storyId: string) {
  try {
    await supabaseAdmin.rpc('increment_play_count', { story_id: storyId })
  } catch {
    // 忽略错误
  }
}

// ===== 游戏会话操作 =====

export async function createGameSession(
  storyId: string,
  userId: string | null
): Promise<GameSession> {
  const { data, error } = await supabaseAdmin
    .from('game_sessions')
    .insert({
      story_id: storyId,
      user_id: userId,
      messages: [],
      status: 'playing',
      question_count: 0,
      time_spent: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as GameSession
}

export async function updateSessionMessages(
  sessionId: string,
  messages: Message[],
  questionCount: number
) {
  const { error } = await supabaseAdmin
    .from('game_sessions')
    .update({
      messages,
      question_count: questionCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function completeSession(
  sessionId: string,
  timeSpent: number,
  stars: 1 | 2 | 3
) {
  const { error } = await supabaseAdmin
    .from('game_sessions')
    .update({
      status: 'completed',
      time_spent: timeSpent,
      stars,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function giveUpSession(sessionId: string, timeSpent: number) {
  const { error } = await supabaseAdmin
    .from('game_sessions')
    .update({
      status: 'gave_up',
      time_spent: timeSpent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw error
}

export async function getGameSession(sessionId: string): Promise<GameSession> {
  const { data, error } = await supabaseAdmin
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data as GameSession
}

// ===== 房间操作 =====

export async function createRoom(storyId: string, hostId: string): Promise<Room> {
  const roomCode = generateRoomCode()
  const { data, error } = await supabaseAdmin
    .from('rooms')
    .insert({
      room_code: roomCode,
      host_id: hostId,
      story_id: storyId,
      status: 'waiting',
    })
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .single()

  if (error) return null
  return data as Room
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}
