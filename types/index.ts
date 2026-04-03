// ===== 题目相关 =====
export interface Story {
  id: string
  title: string
  difficulty: 1 | 2 | 3
  category: string
  surface: string        // 汤面（展示给玩家）
  bottom: string         // 汤底（只有AI知道，不发给前端）
  key_points: string[]   // 关键答案点
  play_count: number
  created_at: string
}

// 前端展示用（不含汤底，防止泄露）
export type StoryPublic = Omit<Story, 'bottom' | 'key_points'>

// ===== 消息相关 =====
export type MessageRole = 'user' | 'assistant' | 'system'
export type AIAnswer = '是' | '否' | '无关' | '非常接近！' | '恭喜你猜对了！'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

// ===== 游戏会话 =====
export type GameStatus = 'playing' | 'completed' | 'gave_up'

export interface GameSession {
  id: string
  user_id: string | null
  story_id: string
  messages: Message[]
  status: GameStatus
  question_count: number
  time_spent: number     // 秒
  stars: 1 | 2 | 3 | null
  created_at: string
  updated_at: string
}

// ===== 多人房间 =====
export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface Room {
  id: string
  room_code: string
  host_id: string
  story_id: string
  status: RoomStatus
  created_at: string
}

// ===== API 请求/响应 =====
export interface ChatRequest {
  sessionId: string
  storyId: string
  question: string
  messages: Message[]
}

export interface ChatResponse {
  answer: AIAnswer
  message: Message
}

export interface JudgeRequest {
  sessionId: string
  storyId: string
  playerAnswer: string
}

export interface JudgeResponse {
  correct: boolean
  coverage: number          // 0-100
  missing: string[]         // 缺少的关键点
  stars: 1 | 2 | 3 | null
}

// ===== 结算页面 =====
export interface GameResult {
  story: StoryPublic
  session: GameSession
  stars: 1 | 2 | 3
  timeSpent: number
  questionCount: number
}

// ===== 用户 =====
export interface UserProfile {
  id: string           // 对应 Supabase auth.users.id
  username: string
  points: number
  created_at: string
}

// ===== 工具类型 =====
export interface ApiError {
  error: string
  code?: string
}
