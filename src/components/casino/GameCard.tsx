'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Game } from '@/types/database'
import { cn } from '@/lib/utils'
import { Play, Info } from 'lucide-react'
import { useState } from 'react'

interface GameCardProps {
  game: Game
  className?: string
}

export function GameCard({ game, className }: GameCardProps) {
  const [imgError, setImgError] = useState(false)

  const categoryColors: Record<string, string> = {
    slots: 'bg-purple-500/20 text-purple-300',
    crash: 'bg-red-500/20 text-red-300',
    live: 'bg-green-500/20 text-green-300',
    table: 'bg-blue-500/20 text-blue-300',
    original: 'bg-[#f5a623]/20 text-[#f5a623]',
  }

  return (
    <div className={cn('group relative cursor-pointer hover-card', className)}>
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden bg-[#1a1a2e] aspect-[3/4]">
        {!imgError ? (
          <div
            className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${getGameGradient(game.category)} )`,
            }}
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-2">{getGameEmoji(game.slug)}</div>
              <p className="text-white font-bold text-sm leading-tight">{game.name}</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e]" />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
          <Link href={`/jogo/${game.slug}`}>
            <button className="btn-titan py-2.5 px-6 text-sm font-bold shadow-lg">
              <Play className="w-4 h-4 fill-current" /> Jogar
            </button>
          </Link>
          {game.demo_available && (
            <button className="btn-outline py-2 px-5 text-sm">
              Demo
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.is_new && <span className="badge-new">Novo</span>}
          {game.is_hot && <span className="badge-hot">🔥 Hot</span>}
        </div>

        {/* RTP */}
        {game.rtp && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-300">
            RTP {game.rtp}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#f5a623] transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600">{game.provider}</span>
          <span className={cn('text-xs px-1.5 py-0.5 rounded', categoryColors[game.category] || 'bg-gray-500/20 text-gray-400')}>
            {getCategoryLabel(game.category)}
          </span>
        </div>
      </div>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    slots: 'Slot',
    crash: 'Crash',
    live: 'Ao Vivo',
    table: 'Mesa',
    original: 'Original',
  }
  return map[category] || category
}

function getGameGradient(category: string): string {
  const map: Record<string, string> = {
    slots: '#1a0a2e, #2d0a4e',
    crash: '#2e0a0a, #4e1a0a',
    live: '#0a2e0a, #0a4e1a',
    table: '#0a1a2e, #0a2e4e',
    original: '#1a1000, #2e2000',
  }
  return map[category] || '#1a1a2e, #2a2a3e'
}

function getGameEmoji(slug: string): string {
  const map: Record<string, string> = {
    'fortune-tiger': '🐯',
    'fortune-ox': '🐂',
    'fortune-mouse': '🐭',
    'fortune-rabbit': '🐰',
    'spaceman': '🚀',
    'aviator': '✈️',
    'gates-of-olympus': '⚡',
    'sweet-bonanza': '🍭',
    'big-bass-bonanza': '🎣',
    'crazy-time': '🎡',
    'double-ball-roulette': '🎰',
    'lightning-blackjack': '🃏',
    'mines': '💣',
    'plinko': '⚪',
  }
  return map[slug] || '🎮'
}
