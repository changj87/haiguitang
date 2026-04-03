'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('请填写邮箱和密码'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message)
    } else {
      onClose()
    }
  }

  const handleRegister = async () => {
    if (!email || !password || !username) { setError('请填写所有字段'); return }
    if (password.length < 6) { setError('密码至少 6 位'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('注册成功！请检查邮箱完成验证，然后登录。')
    }
  }

  const switchTab = (t: 'login' | 'register') => {
    setTab(t)
    setError('')
    setSuccess('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-sm p-6 rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-slate-700/50">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`pb-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tab === 'register' && (
            <input
              type="text"
              placeholder="昵称"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister()
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />

          {error && <p className="text-xs text-red-400 px-1">{error}</p>}
          {success && <p className="text-xs text-green-400 px-1">{success}</p>}

          <button
            onClick={tab === 'login' ? handleLogin : handleRegister}
            disabled={loading || !!success}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-sm font-semibold transition-colors mt-1"
          >
            {loading ? '处理中...' : tab === 'login' ? '登录' : '注册'}
          </button>
        </div>
      </div>
    </div>
  )
}
