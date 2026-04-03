'use client'

import { useState, useEffect } from 'react'
import type { Story } from '@/types'

type StoryRow = Omit<Story, 'created_at'>

const EMPTY_FORM: Omit<StoryRow, 'id' | 'play_count'> = {
  title: '',
  difficulty: 1,
  category: '经典',
  surface: '',
  bottom: '',
  key_points: [],
}

const CATEGORIES = ['经典', '悬疑', '日常', '烧脑']
const DIFFICULTIES = [
  { value: 1, label: '🌊 简单' },
  { value: 2, label: '🌀 中等' },
  { value: 3, label: '🔱 困难' },
]

export default function AdminPage() {
  const [stories, setStories] = useState<StoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [keyPointInput, setKeyPointInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => { loadStories() }, [])

  async function loadStories() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stories')
      const data = await res.json()
      setStories(data.stories ?? [])
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setKeyPointInput('')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(story: StoryRow) {
    setForm({
      title: story.title,
      difficulty: story.difficulty,
      category: story.category,
      surface: story.surface,
      bottom: story.bottom,
      key_points: story.key_points,
    })
    setKeyPointInput('')
    setEditingId(story.id)
    setShowForm(true)
  }

  function addKeyPoint() {
    const kp = keyPointInput.trim()
    if (!kp || form.key_points.includes(kp)) return
    setForm((f) => ({ ...f, key_points: [...f.key_points, kp] }))
    setKeyPointInput('')
  }

  function removeKeyPoint(kp: string) {
    setForm((f) => ({ ...f, key_points: f.key_points.filter((k) => k !== kp) }))
  }

  async function handleSave() {
    if (!form.title || !form.surface || !form.bottom || form.key_points.length === 0) {
      showToast('请填写所有必填项，并至少添加一个关键点')
      return
    }
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/stories/${editingId}` : '/api/admin/stories'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('保存失败')
      showToast(editingId ? '✅ 修改成功' : '✅ 新增成功')
      setShowForm(false)
      loadStories()
    } catch {
      showToast('❌ 保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这道题目吗？')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/stories/${id}`, { method: 'DELETE' })
      showToast('🗑 已删除')
      loadStories()
    } finally {
      setDeletingId(null)
    }
  }

  const diffLabel = (d: number) => DIFFICULTIES.find((x) => x.value === d)?.label ?? ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                        bg-slate-800 border border-slate-600 text-slate-100
                        px-5 py-2.5 rounded-2xl text-sm shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">📚 题库管理</h1>
          <p className="text-xs text-slate-500 mt-0.5">共 {stories.length} 道题目</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.location.href = '/'} className="btn-ghost py-2 px-4 text-sm">
            ← 返回首页
          </button>
          <button onClick={openNew} className="btn-primary py-2 px-4 text-sm">
            + 新增题目
          </button>
        </div>
      </div>

      {/* 题目列表 */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-700/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-500">
          <div className="text-3xl mb-2">📭</div>
          <p>暂无题目，点击「新增题目」开始添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">{story.category}</span>
                    <span className="text-xs text-slate-600">{diffLabel(story.difficulty)}</span>
                    <span className="text-xs text-slate-600">· {story.play_count} 次游玩</span>
                  </div>
                  <h3 className="font-medium text-slate-200 mb-1">{story.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{story.surface}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {story.key_points.map((kp) => (
                      <span key={kp} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(story)}
                    className="text-xs text-sky-400 hover:text-sky-300 px-3 py-1.5
                               bg-sky-500/10 hover:bg-sky-500/20 rounded-xl transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    disabled={deletingId === story.id}
                    className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5
                               bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors
                               disabled:opacity-50"
                  >
                    {deletingId === story.id ? '...' : '删除'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="w-full max-w-2xl glass-card p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-100">
                {editingId ? '✏️ 编辑题目' : '➕ 新增题目'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">题目标题 *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="如：电梯谜题"
                  maxLength={50}
                  className="input-field text-sm"
                />
              </div>

              {/* 分类 + 难度 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">分类 *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="input-field text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">难度 *</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) as 1|2|3 }))}
                    className="input-field text-sm"
                  >
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {/* 汤面 */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">汤面（展示给玩家）*</label>
                <textarea
                  value={form.surface}
                  onChange={(e) => setForm((f) => ({ ...f, surface: e.target.value }))}
                  placeholder="描述故事表面现象，不能透露真相..."
                  rows={3}
                  maxLength={500}
                  className="input-field text-sm resize-none"
                />
              </div>

              {/* 汤底 */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">🔒 汤底（真相，玩家看不到）*</label>
                <textarea
                  value={form.bottom}
                  onChange={(e) => setForm((f) => ({ ...f, bottom: e.target.value }))}
                  placeholder="故事的完整真相..."
                  rows={3}
                  maxLength={1000}
                  className="input-field text-sm resize-none border-amber-500/30 focus:border-amber-500/60"
                />
              </div>

              {/* 关键答案点 */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">
                  关键答案点 * <span className="text-slate-600">（玩家提交答案时用于评分）</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={keyPointInput}
                    onChange={(e) => setKeyPointInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyPoint() }}}
                    placeholder="输入一个关键点，回车添加"
                    maxLength={50}
                    className="input-field text-sm flex-1"
                  />
                  <button onClick={addKeyPoint} className="btn-ghost py-2 px-4 text-sm flex-shrink-0">
                    添加
                  </button>
                </div>
                {form.key_points.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.key_points.map((kp) => (
                      <span key={kp} className="flex items-center gap-1.5 text-xs
                                                  bg-sky-500/15 text-sky-300 border border-sky-500/30
                                                  px-2.5 py-1 rounded-full">
                        {kp}
                        <button onClick={() => removeKeyPoint(kp)} className="hover:text-rose-400 transition-colors">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">取消</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? '保存中...' : editingId ? '保存修改' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
