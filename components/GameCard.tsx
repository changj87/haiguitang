'use client'

import type { StoryPublic } from '@/types'

interface GameCardProps {
  story: StoryPublic
}

const DIFFICULTY_MAP = {
  1: { label: '简单', icon: '🌊', bar: 'w-1/3 bg-emerald-500', text: 'text-emerald-400' },
  2: { label: '中等', icon: '🌀', bar: 'w-2/3 bg-amber-500',   text: 'text-amber-400'   },
  3: { label: '困难', icon: '🔱', bar: 'w-full bg-rose-500',   text: 'text-rose-400'    },
} as const

const CATEGORY_EMOJI: Record<string, string> = {
  '经典': '📖',
  '悬疑': '🔍',
  '日常': '☕',
  '烧脑': '🧠',
}

export default function GameCard({ story }: GameCardProps) {
  const diff = DIFFICULTY_MAP[story.difficulty]

  return (
    <div
      onClick={() => { window.location.href = `/game/${story.id}` }}
      className="group cursor-pointer"
    >
      <div className="glass-card p-5 transition-all duration-200
                      hover:border-sky-500/40 hover:bg-slate-800/80
                      hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-900/20
                      active:translate-y-0 active:shadow-none">

        {/* 顶部：分类 + 难度 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span>{CATEGORY_EMOJI[story.category] ?? '🎯'}</span>
            {story.category}
          </span>
          <div className="flex items-center gap-2">
            {/* 难度进度条 */}
            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${diff.bar} transition-all`} />
            </div>
            <span className={`text-xs font-medium ${diff.text}`}>
              {diff.icon} {diff.label}
            </span>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-slate-100 mb-2 text-base
                       group-hover:text-sky-300 transition-colors duration-200">
          {story.title}
        </h3>

        {/* 汤面预览 */}
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {story.surface}
        </p>

        {/* 底部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>🎮 {story.play_count > 0 ? `${story.play_count.toLocaleString()} 次` : '首次游玩'}</span>
          </div>
          <span className="text-xs font-medium text-sky-500/70
                           group-hover:text-sky-400 group-hover:translate-x-0.5
                           transition-all duration-200 flex items-center gap-1">
            开始探索
            <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
          </span>
        </div>
      </div>
    </div>
  )
}
