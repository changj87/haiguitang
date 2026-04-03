'use client'

import { useState, useEffect } from 'react'
import GameCard from '@/components/GameCard'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/components/AuthProvider'
import type { StoryPublic } from '@/types'

const CATEGORIES = ['全部', '经典', '悬疑', '日常', '烧脑']

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [stories, setStories] = useState<StoryPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('全部')

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((d) => setStories(d.stories ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === '全部'
    ? stories
    : stories.filter((s) => s.category === activeCategory)

  const totalPlays = stories.reduce((acc, s) => acc + s.play_count, 0)

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || '玩家'

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      {/* 登录/用户栏 */}
      <div className="flex justify-end mb-4 min-h-[32px]">
        {!authLoading && (
          user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hi, {displayName}</span>
              <button
                onClick={signOut}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors"
            >
              登录 / 注册
            </button>
          )
        )}
      </div>

      {/* 顶部 Hero */}
      <header className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="text-5xl animate-float">🐢</div>
          <div className="absolute -inset-4 bg-sky-500/10 rounded-full blur-xl" />
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">海龟汤</h1>
        <p className="text-sm text-slate-500">每一个问题，都是揭开真相的钥匙</p>
      </header>

      {/* 统计栏 */}
      <div className="glass-card p-4 mb-6 flex justify-around text-center">
        <div>
          <div className="text-2xl font-bold text-sky-400">{stories.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">道谜题</div>
        </div>
        <div className="w-px bg-slate-700/50" />
        <div>
          <div className="text-2xl font-bold text-sky-400">
            {totalPlays > 0 ? totalPlays.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">次游玩</div>
        </div>
        <div className="w-px bg-slate-700/50" />
        <div>
          <div className="text-2xl font-bold text-sky-400">AI</div>
          <div className="text-xs text-slate-500 mt-0.5">智能主持</div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === cat
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 题目列表 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-medium text-slate-400">
            {activeCategory === '全部' ? '全部谜题' : activeCategory}
            <span className="ml-2 text-slate-600">· {filtered.length} 道</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-3 bg-slate-700 rounded w-1/4 mb-3" />
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-700/60 rounded w-full mb-1" />
                <div className="h-3 bg-slate-700/60 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-500 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            <p>该分类暂无谜题</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((story, i) => (
              <div
                key={story.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <GameCard story={story} />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="text-center mt-10 text-xs text-slate-700">
        <p>AI 主持 · 是 / 否 / 无关</p>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  )
}
