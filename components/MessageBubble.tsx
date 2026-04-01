'use client'

import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

// AI 回答对应的样式
const ANSWER_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  '是':         { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-300', icon: '✓' },
  '否':         { bg: 'bg-rose-500/15 border-rose-500/30',       text: 'text-rose-300',    icon: '✗' },
  '无关':       { bg: 'bg-slate-700/60 border-slate-600/50',     text: 'text-slate-400',   icon: '—' },
  '非常接近！': { bg: 'bg-amber-500/15 border-amber-500/30',     text: 'text-amber-300',   icon: '🔥' },
  '恭喜你猜对了！': { bg: 'bg-sky-500/15 border-sky-500/30',    text: 'text-sky-300',     icon: '🎉' },
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[75%] bg-sky-600/30 border border-sky-500/30
                        rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-sm text-slate-100">{message.content}</p>
        </div>
      </div>
    )
  }

  // AI 回答
  const style = ANSWER_STYLE[message.content] ?? ANSWER_STYLE['无关']

  return (
    <div className="flex justify-start animate-fade-in">
      <div className={`max-w-[60%] border rounded-2xl rounded-tl-sm px-4 py-2.5 ${style.bg}`}>
        <p className={`text-sm font-medium text-center ${style.text}`}>
          {style.icon} {message.content}
        </p>
      </div>
    </div>
  )
}
