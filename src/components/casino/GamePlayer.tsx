'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { Game } from '@/types/database'
import {
  Play, Star, Info, Volume2, VolumeX, Maximize2, RotateCcw,
  Zap, TrendingUp, ChevronRight, Lock, Plus, Minus
} from 'lucide-react'

interface Props {
  game: Game
  profile: { balance: number; bonus_balance: number; vip_level: number } | null
  user: any
  isDemo: boolean
  similarGames: Partial<Game>[]
}

const categoryEmojis: Record<string, string> = {
  slots: '🎰', crash: '🚀', live: '🎭', table: '🃏', original: '⚡',
  featured: '⭐', hot: '🔥', new: '✨',
}

export default function GamePlayer({ game, profile, user, isDemo: initialDemo, similarGames }: Props) {
  const [isDemo, setIsDemo] = useState(initialDemo)
  const [betAmount, setBetAmount] = useState(5)
  const [playing, setPlaying] = useState(false)
  const [gameResult, setGameResult] = useState<{ win: boolean; amount: number; multiplier: number } | null>(null)
  const [balance, setBalance] = useState(profile?.balance || 0)
  const [muted, setMuted] = useState(false)
  const [totalWon, setTotalWon] = useState(0)
  const [totalBets, setTotalBets] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = !!user

  const handleBet = async () => {
    if (!isDemo && !isLoggedIn) {
      toast.error('Faça login para apostar com dinheiro real!')
      return
    }
    if (!isDemo && betAmount > balance) {
      toast.error('Saldo insuficiente!')
      return
    }
    if (betAmount < 1) {
      toast.error('Aposta mínima: R$1,00')
      return
    }

    setPlaying(true)
    setGameResult(null)

    // Simular jogada (em produção, chamar API)
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))

    const rtp = (game.rtp || 96) / 100
    const win = Math.random() < rtp * 0.4
    const multiplier = win ? parseFloat((1.5 + Math.random() * 10).toFixed(2)) : 0
    const winAmount = win ? betAmount * multiplier : 0

    setGameResult({ win, amount: winAmount, multiplier })
    setTotalBets(b => b + 1)

    if (!isDemo) {
      // Chamar API de apostas
      try {
        const res = await fetch('/api/jogos/apostar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: game.id,
            bet_amount: betAmount,
            win,
            win_amount: winAmount,
            multiplier,
          }),
        })
        const data = await res.json()
        if (data.new_balance !== undefined) {
          setBalance(data.new_balance)
        }
      } catch (e) {}
    } else {
      // Modo demo: simular saldo
      if (win) setTotalWon(t => t + winAmount)
    }

    if (win) {
      toast.success(`🎉 Ganhou ${formatCurrency(winAmount)}! (${multiplier}x)`)
    }

    setPlaying(false)
  }

  const quickBets = [1, 5, 10, 25, 50, 100]

  const categoryEmoji = categoryEmojis[game.category] || '🎮'
  const gameColor = {
    slots: 'from-purple-600 to-purple-900',
    crash: 'from-red-600 to-red-900',
    live: 'from-blue-600 to-blue-900',
    table: 'from-green-600 to-green-900',
    original: 'from-yellow-600 to-yellow-900',
  }[game.category] || 'from-gray-600 to-gray-900'

  return (
    <div className="min-h-screen">
      {/* Game header */}
      <div className="bg-[#0d0d1a] border-b border-[#1e1e2e] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{game.emoji || categoryEmoji}</div>
            <div>
              <h1 className="font-bold text-white">{game.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{game.provider}</span>
                <span className="text-xs text-[#f5a623]">RTP: {game.rtp}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-3 py-1 rounded-full font-bold">
                DEMO
              </span>
            )}
            <button onClick={() => setMuted(m => !m)} className="btn-ghost p-2">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Área do jogo */}
          <div>
            <div
              ref={gameAreaRef}
              className={`relative bg-gradient-to-br ${gameColor} rounded-2xl overflow-hidden aspect-video flex items-center justify-center`}
            >
              {/* Simulação visual do jogo */}
              <div className="text-center">
                {playing ? (
                  <div className="animate-pulse">
                    <div className="text-8xl mb-4 animate-bounce">{game.emoji || categoryEmoji}</div>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-white/50 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-white/70 mt-3 text-sm">Aguardando resultado...</p>
                  </div>
                ) : gameResult ? (
                  <div className={`animate-bounce-in ${gameResult.win ? 'text-yellow-300' : 'text-white/60'}`}>
                    <div className="text-8xl mb-3">{gameResult.win ? '🎉' : '😔'}</div>
                    {gameResult.win ? (
                      <>
                        <p className="text-4xl font-black">{formatCurrency(gameResult.amount)}</p>
                        <p className="text-xl mt-2 opacity-80">{gameResult.multiplier}x</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold">Tente novamente!</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-9xl mb-4">{game.emoji || categoryEmoji}</div>
                    <p className="text-white/50 text-lg">{isDemo ? 'Modo Demonstração' : 'Pronto para jogar!'}</p>
                  </div>
                )}
              </div>

              {/* Overlay demo/login */}
              {!isLoggedIn && !isDemo && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-[#f5a623] mx-auto mb-3" />
                    <p className="text-white font-bold mb-4">Faça login para jogar com dinheiro real</p>
                    <Link href="/login" className="btn-titan">Entrar</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Controles sob o jogo */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsDemo(d => !d)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDemo
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {isDemo ? '🎮 Modo Demo' : '💰 Dinheiro Real'}
              </button>

              {isLoggedIn && (
                <button
                  onClick={() => setIsDemo(d => !d)}
                  className="btn-ghost text-sm px-4"
                >
                  {isDemo ? 'Jogar Real' : 'Ir para Demo'}
                </button>
              )}

              <button className="btn-ghost p-2">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Info do jogo */}
            {game.description && (
              <div className="mt-4 p-4 bg-titan-card rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#f5a623]" />
                  <span className="text-sm font-bold text-white">Sobre o Jogo</span>
                </div>
                <p className="text-sm text-gray-500">{game.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-600">
                  <span>RTP: <strong className="text-white">{game.rtp}%</strong></span>
                  <span>Provedor: <strong className="text-white">{game.provider}</strong></span>
                  <span>Categoria: <strong className="text-white capitalize">{game.category}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Painel de apostas */}
          <div className="space-y-4">
            {/* Saldo */}
            {isLoggedIn && !isDemo && (
              <div className="bg-titan-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Saldo disponível</p>
                    <p className="text-xl font-black text-[#f5a623]">{formatCurrency(balance)}</p>
                  </div>
                  <Link href="/carteira" className="btn-ghost text-xs flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Depositar
                  </Link>
                </div>
              </div>
            )}

            {isDemo && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                <p className="text-sm font-bold text-yellow-400 mb-1">Modo Demonstração</p>
                <p className="text-xs text-gray-500">Jogue sem gastar dinheiro real. Resultados são simulados.</p>
              </div>
            )}

            {/* Controle de aposta */}
            <div className="bg-titan-card rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">Valor da Aposta</h3>

              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setBetAmount(b => Math.max(1, b - 5))}
                  className="w-10 h-10 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded-xl flex items-center justify-center text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    className="input-titan pl-10 text-center font-bold text-lg"
                    value={betAmount}
                    min={1}
                    onChange={e => setBetAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                  />
                </div>
                <button
                  onClick={() => setBetAmount(b => b + 5)}
                  className="w-10 h-10 bg-[#2a2a3e] hover:bg-[#3a3a4e] rounded-xl flex items-center justify-center text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Valores rápidos */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {quickBets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      betAmount === amount
                        ? 'bg-[#f5a623] text-black'
                        : 'bg-[#2a2a3e] text-gray-400 hover:bg-[#3a3a4e] hover:text-white'
                    }`}
                  >
                    R${amount}
                  </button>
                ))}
              </div>

              {/* Multiplicar */}
              <div className="flex gap-2 mb-5">
                <button onClick={() => setBetAmount(b => b / 2)} className="flex-1 py-2 bg-[#2a2a3e] rounded-xl text-xs text-gray-400">½</button>
                <button onClick={() => setBetAmount(b => b * 2)} className="flex-1 py-2 bg-[#2a2a3e] rounded-xl text-xs text-gray-400">2x</button>
                {isLoggedIn && !isDemo && (
                  <button onClick={() => setBetAmount(balance)} className="flex-1 py-2 bg-[#2a2a3e] rounded-xl text-xs text-gray-400">Max</button>
                )}
              </div>

              <button
                onClick={handleBet}
                disabled={playing}
                className="btn-titan w-full py-4 text-lg font-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {playing ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RotateCcw className="w-5 h-5 animate-spin" />
                    Jogando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Zap className="w-5 h-5" />
                    {isDemo ? 'Jogar Demo' : `Apostar ${formatCurrency(betAmount)}`}
                  </span>
                )}
              </button>

              {!isLoggedIn && (
                <p className="text-center text-xs text-gray-600 mt-3">
                  <Link href="/login" className="text-[#f5a623] hover:underline">Faça login</Link> para apostar com dinheiro real
                </p>
              )}
            </div>

            {/* Stats da sessão */}
            {totalBets > 0 && (
              <div className="bg-titan-card rounded-2xl p-4">
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#f5a623]" /> Sessão atual
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rodadas</span>
                    <span className="text-white font-bold">{totalBets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total ganho</span>
                    <span className="text-green-400 font-bold">{formatCurrency(totalWon)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Jogos similares */}
            {similarGames.length > 0 && (
              <div className="bg-titan-card rounded-2xl p-4">
                <p className="text-sm font-bold text-white mb-3">Jogos similares</p>
                <div className="space-y-2">
                  {similarGames.map(sg => (
                    <Link
                      key={sg.id}
                      href={`/jogo/${sg.slug}`}
                      className="flex items-center justify-between p-2 hover:bg-[#2a2a3e] rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{sg.emoji || categoryEmojis[sg.category || ''] || '🎮'}</span>
                        <div>
                          <p className="text-sm text-white">{sg.name}</p>
                          <p className="text-xs text-gray-600">RTP {sg.rtp}%</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
