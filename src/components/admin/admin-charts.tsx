'use client'

import React, { useState, useMemo } from 'react'
import { TrendingUp, BarChart3, PieChart, Calendar, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { UMKMDepositItem, PelajarWithdrawalItem } from '@/lib/escrow-store'
import { AkadTransaksiItem } from '@/lib/akad-store'

interface FinancialAreaChartProps {
  deposits: UMKMDepositItem[]
  withdrawals: PelajarWithdrawalItem[]
  akads: AkadTransaksiItem[]
  totalDanaEscrow: number
}

export function AdminFinancialAreaChart({
  deposits,
  withdrawals,
  akads,
  totalDanaEscrow
}: FinancialAreaChartProps) {
  const [metricMode, setMetricMode] = useState<'total' | 'deposit' | 'pencairan'>('total')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const chartData = useMemo(() => {
    const dayMap = new Map<string, { dateStr: string; label: string; totalAkad: number; deposit: number; pencairan: number }>()

    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().slice(0, 10)
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      dayMap.set(dateKey, {
        dateStr: dateKey,
        label: dayLabel,
        totalAkad: 0,
        deposit: 0,
        pencairan: 0
      })
    }

    akads.forEach(a => {
      if (!a.createdAt) return
      const key = a.createdAt.slice(0, 10)
      const existing = dayMap.get(key)
      if (existing) {
        existing.totalAkad += a.nominalTotal || 0
      } else {
        const d = new Date(a.createdAt)
        dayMap.set(key, {
          dateStr: key,
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          totalAkad: a.nominalTotal || 0,
          deposit: 0,
          pencairan: 0
        })
      }
    })

    deposits.forEach(d => {
      if (d.status !== 'APPROVED' || !d.createdAt) return
      const key = d.createdAt.slice(0, 10)
      const existing = dayMap.get(key)
      if (existing) {
        existing.deposit += d.nominal || 0
      } else {
        const dateObj = new Date(d.createdAt)
        dayMap.set(key, {
          dateStr: key,
          label: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          totalAkad: 0,
          deposit: d.nominal || 0,
          pencairan: 0
        })
      }
    })

    withdrawals.forEach(w => {
      if (w.status !== 'APPROVED' || !w.createdAt) return
      const key = w.createdAt.slice(0, 10)
      const existing = dayMap.get(key)
      if (existing) {
        existing.pencairan += w.nominal || 0
      } else {
        const dateObj = new Date(w.createdAt)
        dayMap.set(key, {
          dateStr: key,
          label: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          totalAkad: 0,
          deposit: 0,
          pencairan: w.nominal || 0
        })
      }
    })

    const sorted = Array.from(dayMap.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    const displayList = sorted.slice(-7)

    let runningAccumulator = 0
    return displayList.map(item => {
      const dayVolume = item.totalAkad + item.deposit
      runningAccumulator += dayVolume
      return {
        ...item,
        dayVolume,
        cumulativeVolume: runningAccumulator,
        value: metricMode === 'total' ? runningAccumulator : metricMode === 'deposit' ? item.deposit : item.pencairan
      }
    })
  }, [akads, deposits, withdrawals, metricMode])

  const values = chartData.map(d => d.value)
  const maxValue = Math.max(...values, 1000000)
  const chartHeight = 220
  const chartWidth = 640
  const padLeft = 70
  const padRight = 30
  const padTop = 25
  const padBottom = 35
  const plotWidth = chartWidth - padLeft - padRight
  const plotHeight = chartHeight - padTop - padBottom

  const points = chartData.map((d, i) => {
    const x = padLeft + (i / Math.max(chartData.length - 1, 1)) * plotWidth
    const ratio = d.value / maxValue
    const y = padTop + plotHeight - ratio * plotHeight
    return { x, y, data: d }
  })

  let areaPath = ''
  let linePath = ''
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const midX = (prev.x + curr.x) / 2
      linePath += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
    }
    const lastX = points[points.length - 1].x
    const firstX = points[0].x
    const baselineY = padTop + plotHeight
    areaPath = `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(fraction => {
    const val = Math.round(maxValue * fraction)
    const y = padTop + plotHeight - fraction * plotHeight
    return { val, y }
  })

  const currentHover = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9B71]" />
            <h3 className="font-extrabold text-base text-[#2D2319]">Grafik Tren Finansial Platform</h3>
          </div>
          <p className="text-xs text-[#8B7E74] mt-0.5">
            Visualisasi kurva perputaran modal, mutasi kas, dan escrow secara real-time
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E8E2DA] self-start sm:self-auto">
          <button
            onClick={() => { setMetricMode('total'); setHoveredIdx(null) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'total'
                ? 'bg-[#2D2319] text-white shadow-2xs'
                : 'text-[#8B7E74] hover:text-[#2D2319]'
            }`}
          >
            Kumulatif Total
          </button>
          <button
            onClick={() => { setMetricMode('deposit'); setHoveredIdx(null) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'deposit'
                ? 'bg-[#2D2319] text-white shadow-2xs'
                : 'text-[#8B7E74] hover:text-[#2D2319]'
            }`}
          >
            Deposit Masuk
          </button>
          <button
            onClick={() => { setMetricMode('pencairan'); setHoveredIdx(null) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'pencairan'
                ? 'bg-[#2D2319] text-white shadow-2xs'
                : 'text-[#8B7E74] hover:text-[#2D2319]'
            }`}
          >
            Pencairan Siswa
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[540px] select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9B71" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#FF9B71" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FF9B71" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF9B71" />
              <stop offset="100%" stopColor="#964825" />
            </linearGradient>
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#FF9B71" floodOpacity="0.3" />
            </filter>
          </defs>

          {yTicks.map(tick => (
            <g key={tick.val}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={chartWidth - padRight}
                y2={tick.y}
                stroke="#F1EDE8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 12}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[10px] fill-[#8B7E74] font-mono"
              >
                {tick.val >= 1000000
                  ? `${(tick.val / 1000000).toFixed(tick.val % 1000000 === 0 ? 0 : 1)}Jt`
                  : tick.val >= 1000
                  ? `${Math.round(tick.val / 1000)}rb`
                  : tick.val}
              </text>
            </g>
          ))}

          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#shadowFilter)"
            />
          )}

          {points.map((pt, i) => (
            <g key={i}>
              <text
                x={pt.x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-[10px] fill-[#8B7E74] font-medium"
              >
                {pt.data.label}
              </text>

              {hoveredIdx === i && (
                <line
                  x1={pt.x}
                  y1={padTop}
                  x2={pt.x}
                  y2={padTop + plotHeight}
                  stroke="#FF9B71"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 7 : 4.5}
                className="fill-white stroke-[#964825] cursor-pointer transition-all duration-200"
                strokeWidth={hoveredIdx === i ? 3.5 : 2.5}
                onMouseEnter={() => setHoveredIdx(i)}
                onTouchStart={() => setHoveredIdx(i)}
              />

              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onTouchStart={() => setHoveredIdx(i)}
              />
            </g>
          ))}
        </svg>

        {currentHover && (
          <div
            className="absolute bg-[#2D2319] text-white p-3 rounded-2xl shadow-xl pointer-events-none text-xs space-y-1 transition-all duration-150 z-20 border border-white/10"
            style={{
              left: `${Math.min(Math.max((currentHover.x / chartWidth) * 100, 15), 85)}%`,
              top: `${Math.max(10, (currentHover.y / chartHeight) * 100 - 30)}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-[10px] text-gray-400 font-medium">
              {currentHover.data.label}
            </div>
            <div className="font-extrabold text-sm text-[#FF9B71] tabular-nums">
              {formatRupiah(currentHover.data.value)}
            </div>
            <div className="text-[10px] text-gray-300 pt-0.5 border-t border-white/10 flex items-center justify-between gap-3">
              <span>Akad: {formatRupiah(currentHover.data.totalAkad)}</span>
              <span>Deposit: {formatRupiah(currentHover.data.deposit)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2DA]">
          <div className="text-[11px] text-[#8B7E74] font-medium">Puncak Volume Harian</div>
          <div className="text-base font-extrabold text-[#2D2319] mt-0.5 tabular-nums">
            {formatRupiah(maxValue)}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2DA]">
          <div className="text-[11px] text-[#8B7E74] font-medium">Saldo Escrow Mengendap</div>
          <div className="text-base font-extrabold text-blue-700 mt-0.5 tabular-nums">
            {formatRupiah(totalDanaEscrow)}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2DA]">
          <div className="text-[11px] text-[#8B7E74] font-medium">Rata-rata Transaksi Aktif</div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5 tabular-nums">
            {formatRupiah(akads.length > 0 ? Math.round(akads.reduce((s, a) => s + (a.nominalTotal || 0), 0) / akads.length) : 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AkadDonutChartProps {
  akads: AkadTransaksiItem[]
  onNavigateTab: (tab: string) => void
}

export function AdminAkadDonutChart({ akads, onNavigateTab }: AkadDonutChartProps) {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = akads.length || 1
    const done = akads.filter(a => a.step === 4)
    const review = akads.filter(a => a.step === 3)
    const working = akads.filter(a => a.step === 2)
    const start = akads.filter(a => a.step === 1)

    const slices = [
      {
        id: 'done',
        name: 'Selesai & Lunas',
        count: done.length,
        percent: Math.round((done.length / total) * 100),
        color: '#10B981',
        nominal: done.reduce((s, a) => s + (a.nominalTotal || 0), 0)
      },
      {
        id: 'review',
        name: 'Review Deliverable',
        count: review.length,
        percent: Math.round((review.length / total) * 100),
        color: '#3B82F6',
        nominal: review.reduce((s, a) => s + (a.nominalTotal || 0), 0)
      },
      {
        id: 'working',
        name: 'Dalam Pengerjaan',
        count: working.length,
        percent: Math.round((working.length / total) * 100),
        color: '#F59E0B',
        nominal: working.reduce((s, a) => s + (a.nominalTotal || 0), 0)
      },
      {
        id: 'start',
        name: 'Awal Kontrak',
        count: start.length,
        percent: Math.round((start.length / total) * 100),
        color: '#8B5CF6',
        nominal: start.reduce((s, a) => s + (a.nominalTotal || 0), 0)
      }
    ]

    return {
      slices,
      totalCount: akads.length,
      successRate: akads.length > 0 ? Math.round((done.length / akads.length) * 100) : 0
    }
  }, [akads])

  const radius = 72
  const strokeWidth = 22
  const center = 100
  const circumference = 2 * Math.PI * radius

  let cumulativePercent = 0
  const strokeSegments = stats.slices.map(slice => {
    const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((cumulativePercent / 100) * circumference)
    cumulativePercent += slice.percent
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset
    }
  })

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#964825]" />
            <h3 className="font-extrabold text-base text-[#2D2319]">Grafik Donat Portofolio Akad</h3>
          </div>
          <p className="text-xs text-[#8B7E74]">Proporsi tahapan pengerjaan proyek siswa</p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          {stats.totalCount} Akad Aktif
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F6F3EE"
              strokeWidth={strokeWidth}
            />

            {stats.totalCount > 0 ? (
              strokeSegments.map(seg => {
                if (seg.percent <= 0) return null
                const isHovered = hoveredStatus === seg.id
                return (
                  <circle
                    key={seg.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredStatus(seg.id)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                )
              })
            ) : (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#E8E2DA"
                strokeWidth={strokeWidth}
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="text-2xl font-black text-[#2D2319] tabular-nums">
              {stats.totalCount > 0 ? `${stats.successRate}%` : '0%'}
            </div>
            <div className="text-[10px] text-[#8B7E74] font-bold uppercase tracking-wider">
              Tingkat Selesai
            </div>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-[260px]">
          {stats.slices.map(slice => {
            const isHovered = hoveredStatus === slice.id
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredStatus(slice.id)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={`p-2.5 rounded-2xl transition-all border cursor-pointer ${
                  isHovered
                    ? 'bg-[#FAF8F5] border-[#FF9B71] shadow-2xs'
                    : 'bg-transparent border-transparent hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="font-bold text-[#2D2319]">{slice.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#8B7E74]">
                    {slice.count} ({slice.percent}%)
                  </span>
                </div>
                <div className="text-[10px] text-[#8B7E74] pl-4.5 mt-0.5 flex items-center justify-between">
                  <span>Nilai: {formatRupiah(slice.nominal)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigateTab('escrows')}
          className="w-full py-2.5 rounded-xl bg-[#F6F3EE] hover:bg-[#EDE7DE] text-xs font-bold text-[#2D2319] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Kelola Ruang Akad & Escrow</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

interface CategoryBarChartProps {
  categories: { name: string; count: number; percent: number }[]
  totalProjects: number
  onNavigateTab: (tab: string) => void
}

export function AdminCategoryBarChart({
  categories,
  totalProjects,
  onNavigateTab
}: CategoryBarChartProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)

  const maxCount = Math.max(...categories.map(c => c.count), 1)

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2DA] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FF9B71]" />
            <h3 className="font-extrabold text-base text-[#2D2319]">Grafik Batang Kategori Proyek</h3>
          </div>
          <p className="text-xs text-[#8B7E74]">Distribusi permintaan jasa digital mitra UMKM</p>
        </div>
        <span className="text-xs font-bold text-[#964825] bg-[#FFF4EC] border border-[#FFE0D2] px-3 py-1 rounded-full">
          {totalProjects} Total Proyek
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[420px] h-[220px] flex items-end justify-between gap-4 pt-8 pb-4 px-2">
          {categories.map((cat) => {
            const heightPercent = Math.max(Math.round((cat.count / maxCount) * 100), 8)
            const isHovered = hoveredCat === cat.name

            return (
              <div
                key={cat.name}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredCat(cat.name)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                <div className="text-[11px] font-bold text-[#2D2319] mb-1.5 tabular-nums transition-transform group-hover:scale-110">
                  {cat.count}
                </div>

                <div className="w-full max-w-[48px] bg-gray-100 rounded-2xl overflow-hidden flex flex-col justify-end h-[140px] p-1">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      isHovered
                        ? 'bg-gradient-to-t from-[#964825] to-[#FF9B71] shadow-md'
                        : 'bg-gradient-to-t from-[#E8754D] to-[#FFB088]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <div className="text-center mt-2.5">
                  <div className="text-[11px] font-semibold text-[#2D2319] truncate max-w-[80px]">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-[#8B7E74] font-mono">
                    {cat.percent}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#8B7E74]">
        <span className="font-medium">
          Kategori terpopuler: {categories.slice().sort((a, b) => b.count - a.count)[0]?.name || 'Desain Grafis'}
        </span>
        <button
          onClick={() => onNavigateTab('proyek')}
          className="text-[#964825] font-bold hover:underline cursor-pointer"
        >
          Lihat Detail Proyek
        </button>
      </div>
    </div>
  )
}
