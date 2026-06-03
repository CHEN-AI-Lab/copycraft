'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  totalUsers: number
  paidUsers: number
  todayGenerations: number
  totalGenerations: number
  users: Array<{
    id: string
    email: string
    name: string | null
    paid: boolean
    createdAt: string
    lastGenerate: string | null
    generationCount: number
  }>
  dailyTrend: Array<{
    date: string
    count: number
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (res.status === 401) {
          router.push('/zh-CN/sign-in')
          return null
        }
        if (res.status === 403) {
          setError('无权限访问管理后台')
          return null
        }
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then((data) => {
        if (data) setStats(data)
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorView message={error} />
  if (!stats) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">管理后台</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            CopyCraft 运营数据总览
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="总用户数" value={stats.totalUsers} />
          <StatCard label="付费用户" value={stats.paidUsers} />
          <StatCard label="今日生成" value={stats.todayGenerations} />
          <StatCard label="累计生成" value={stats.totalGenerations} />
        </div>

        {/* Daily Trend */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">每日生成趋势</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.dailyTrend.map((day) => {
              const max = Math.max(...stats.dailyTrend.map(d => d.count), 1)
              const height = (day.count / max) * 100
              const date = new Date(day.date)
              const label = `${date.getMonth() + 1}/${date.getDate()}`
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{day.count}</span>
                  <div
                    className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="text-[10px] text-slate-400 rotate-45 origin-left whitespace-nowrap">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* User Table */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">用户列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-left text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">邮箱</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">付费</th>
                  <th className="px-4 py-3 font-medium">注册时间</th>
                  <th className="px-4 py-3 font-medium">生成次数</th>
                  <th className="px-4 py-3 font-medium">最近使用</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {stats.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.name || '-'}</td>
                    <td className="px-4 py-3">
                      {u.paid
                        ? <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">👑 PRO</span>
                        : <span className="text-slate-400">-</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{u.generationCount}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.lastGenerate ? formatDate(u.lastGenerate) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value.toLocaleString()}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-slate-400">加载中...</div>
    </div>
  )
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{message}</p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
