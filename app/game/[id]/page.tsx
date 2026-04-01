'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'
import type { StoryPublic } from '@/types'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string

  const [story, setStory] = useState<StoryPublic | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [showSurface, setShowSurface] = useState(true)
  const [gameOver, setGameOver] = useState(false)

  // 查看汤底相关
  const [showBottomModal, setShowBottomModal] = useState(false)
  const [bottom, setBottom] = useState('')
  const [bottomLoading, setBottomLoading] = useState(false)

  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime, gameOver])

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/story/${storyId}`)
        if (!res.ok) throw new Error('题目不存在')
        const data = await res.json()
        setStory(data.story)

        const sessionRes = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId }),
        })
        const sessionData = await sessionRes.json()
        setSessionId(sessionData.sessionId ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [storyId])

  const handleCorrect = useCallback(() => {
    setGameOver(true)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    router.push(`/result?sessionId=${sessionId}&storyId=${storyId}&time=${timeSpent}`)
  }, [router, sessionId, storyId, startTime])

  // 查看汤底
  async function handleShowBottom() {
    setShowBottomModal(true)
    if (bottom) return
    setBottomLoading(true)
    try {
      const res = await fetch(`/api/story/${storyId}/bottom`)
      if (!res.ok) throw new Error('获取汤底失败')
      const data = await res.json()
      setBottom(data.bottom ?? '加载失败')
    } catch (err) {
      setBottom(err instanceof Error ? err.message : '加载失败')
    } finally {
      setBottomLoading(false)
    }
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500">
        <div className="text-3xl mb-3 animate-pulse">🐢</div>
        <p>加载谜题中...</p>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4">{error || '题目不存在'}</p>
        <button onClick={() => router.push('/')} className="btn-ghost">返回首页</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto flex flex-col h-screen">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <button
          onClick={() => router.push('/')}
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
        >
          ← 返回
        </button>
        <span className="text-sm font-medium text-slate-300">{story.title}</span>
        <span className="text-sm font-mono text-sky-500">{formatTime(elapsed)}</span>
      </header>

      {/* 汤面 */}
      <div
        className="mx-4 mt-3 glass-card overflow-hidden cursor-pointer"
        onClick={() => setShowSurface(!showSurface)}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-sky-400 font-medium">📖 汤面</span>
          <span className="text-xs text-slate-600">{showSurface ? '点击收起' : '点击展开'}</span>
        </div>
        {showSurface && (
          <div className="px-4 pb-4">
            <p className="text-sm text-slate-300 leading-relaxed">{story.surface}</p>
          </div>
        )}
      </div>

      {/* 提示文字 + 查看汤底按钮 */}
      <div className="flex items-center justify-between px-5 mt-2 mb-1">
        <p className="text-xs text-slate-600">提出是非题来揭开谜底</p>
        <button
          onClick={handleShowBottom}
          className="text-xs text-slate-500 hover:text-rose-400 transition-colors duration-200 flex items-center gap-1"
        >
          🔓 查看答案
        </button>
      </div>

      {/* 聊天框 */}
      <div className="flex-1 min-h-0 mx-4 mb-4 glass-card overflow-hidden">
        <ChatBox
          sessionId={sessionId}
          storyId={storyId}
          onCorrect={handleCorrect}
          disabled={gameOver}
        />
      </div>

      {/* 汤底弹窗 */}
      {showBottomModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8"
          onClick={(e) => { if (e.target === e.currentTarget) setShowBottomModal(false) }}
        >
          <div className="w-full max-w-md glass-card p-6 animate-fade-in">
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-400 flex items-center gap-2">
                🔓 汤底真相
              </h3>
              <button
                onClick={() => setShowBottomModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* 汤底内容 */}
            <div className="bg-slate-900/60 rounded-xl p-4 mb-5 border border-amber-500/20">
              {bottomLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="animate-pulse">加载中...</span>
                </div>
              ) : (
                <p className="text-sm text-slate-200 leading-relaxed">{bottom}</p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBottomModal(false)}
                className="btn-ghost flex-1 py-2.5 text-sm"
              >
                继续游戏
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                换一题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
