'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface Props {
  currentCat: string
  currentSearch?: string
}

const CATEGORIES = [
  { key: 'all', label: 'Todos', icon: '🎯' },
  { key: 'featured', label: 'Destaque', icon: '⭐' },
  { key: 'hot', label: 'Em Alta', icon: '🔥' },
  { key: 'new', label: 'Novidades', icon: '✨' },
  { key: 'slots', label: 'Slots', icon: '🎰' },
  { key: 'crash', label: 'Crash', icon: '🚀' },
  { key: 'live', label: 'Ao Vivo', icon: '📡' },
  { key: 'table', label: 'Mesa', icon: '🃏' },
  { key: 'original', label: 'Originais', icon: '💎' },
]

export function CasinoFilters({ currentCat, currentSearch }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || '')

  const setFilter = (cat: string, q?: string) => {
    const params = new URLSearchParams()
    if (cat && cat !== 'all') params.set('cat', cat)
    if (q) params.set('q', q)
    const url = `${pathname}${params.toString() ? '?' + params.toString() : ''}`
    startTransition(() => router.push(url))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter(currentCat, search)
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          type="text"
          className="input-titan pl-10 pr-24"
          placeholder="Buscar jogos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-titan py-1.5 px-4 text-xs">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Buscar'}
        </button>
      </form>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ key, label, icon }) => {
          const isActive = (key === 'all' && !currentCat) || currentCat === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30'
                  : 'bg-[#12121e] text-gray-400 border-[#2a2a3e] hover:border-[#f5a623]/20 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

