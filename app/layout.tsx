import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '海龟汤 · 情境猜谜',
  description: '通过提问来猜测故事的真相，每一个答案都是一块拼图。',
  keywords: '海龟汤,情境猜谜,推理游戏,益智',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased`}
      >
        {/* 背景装饰：深海光晕 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-sky-900/20 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/20 blur-3xl" />
        </div>

        {/* 页面内容 */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
