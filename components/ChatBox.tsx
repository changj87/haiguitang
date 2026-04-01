'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import type { Message, ChatResponse } from '@/types'

interface ChatBoxProps {
  sessionId: string
  storyId: string
  onCorrect: () => void
  disabled?: boolean
}

export default function ChatBox({ sessionId, storyId, onCorrect, disabled }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answerInput, setAnswerInput] = useState('')
  const [answerLoading, setAnswerLoading] = useState(false)
  const [answerHint, setAnswerHint] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const q = input.trim()
    if (!q || loading || disabled) return
    if (q.length > 100) {
      alert('问题不能超过100字')
      return
    }

    setInput('')
    setLoading(true)

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, storyId, question: q, messages }),
      })

      const data: ChatResponse = await res.json()

      if (!res.ok) {
        throw new Error((data as unknown as { error: string }).error ?? '请求失败')
      }

      setMessages((prev) => [...prev, data.message])

      if (data.answer === '恭喜你猜对了！') {
        setTimeout(onCorrect, 1200)
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
      setInput(q)
      alert(err instanceof Error ? err.message : '发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitAnswer() {
    const ans = answerInput.trim()
    if (!ans || answerLoading) return

    setAnswerLoading(true)
    setAnswerHint('')

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, storyId, playerAnswer: ans }),
      })

      const data = await res.json()

      if (data.correct) {
        onCorrect()
      } else {
        // 修复：确保 coverage 是数字
        const coverage = typeof data.coverage === 'number' ? data.coverage : 0
        const missing = Array.isArray(data.missing) && data.missing.length > 0
          ? `缺少：${data.missing.join('、')}`
          : ''
        setAnswerHint(`还差一点！覆盖了 ${coverage}% 的关键点。${missing}`)
      }
    } catch {
      setAnswerHint('判断失败，请重试')
    } finally {
      setAnswerLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">
            <p className="text-2xl mb-2">🐢</p>
            <p>提出你的第一个问题吧</p>
            <p className="text-xs mt-1 text-slate-600">只能回答"是 / 否 / 无关"</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-blink" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-blink" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-blink" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 底部输入区 */}
      <div className="border-t border-slate-700/50 px-4 py-3 space-y-2">
        {showAnswer ? (
          <div className="space-y-2 animate-fade-in">
            {answerHint && (
              <p className="text-xs text-amber-400 px-1">{answerHint}</p>
            )}
            <textarea
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="写下你认为的完整真相..."
              maxLength={500}
              rows={3}
              className="input-field resize-none text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAnswer(false); setAnswerHint('') }}
                className="btn-ghost flex-1 py-2 text-sm"
              >
                继续提问
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={answerLoading || !answerInput.trim()}
                className="btn-primary flex-1 py-2 text-sm"
              >
                {answerLoading ? '判断中...' : '提交答案'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="提出一个是非题..."
                maxLength={100}
                disabled={loading || disabled}
                className="input-field flex-1 text-sm py-2.5"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || disabled}
                className="btn-primary px-4 py-2.5 text-sm"
              >
                {loading ? '...' : '问'}
              </button>
            </div>
            <button
              onClick={() => setShowAnswer(true)}
              disabled={disabled}
              className="w-full btn-ghost py-2 text-sm text-amber-400 border-amber-500/30
                         hover:bg-amber-500/10 disabled:text-slate-600 disabled:border-slate-700/50"
            >
              🎯 我知道答案了，提交真相
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
