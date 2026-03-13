'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, GamepadIcon, Search, Plus, Eye, EyeOff, Edit2, Star, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminJogosClient({ games }: { games: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [localGames, setLocalGames] = useState(games)
  const [showAdd, setShowAdd] = useState(false)
  const [newGame, setNewGame] = useState({
    name: '', provider: '', category: 'slots', emoji: '', rtp: '96',
    description: '', is_featured: false, is_hot: false, is_new: true,
  })

  const filtered = localGames.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.provider?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true :
      filter === 'active' ? g.is_active :
      filter === 'inactive' ? !g.is_active :
      g.category === filter
    return matchSearch && matchFilter
  })

  const toggleActive = async (gameId: string, currentStatus: boolean) => {
    const res = await fetch('/api/admin/jogos/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, is_active: !currentStatus }),
    })
    const data = await res.json()
    if (data.error) { toast.error(data.error); return }
    setLocalGames(prev => prev.map(g => g.id === gameId ? { ...g, is_active: !currentStatus } : g))
    toast.success(`Jogo ${!currentStatus ? 'ativado' : 'desativado'}!`)
  }

  const addGame = async () => {
    if (!newGame.name || !newGame.provider) return toast.error('Nome e provedor são obrigatórios')
    const slug = newGame.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const res = await fetch('/api/admin/jogos/adicionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newGame, slug, rtp: parseFloat(newGame.rtp) }),
    })
    const data = await res.json()
    if (data.error) { toast.error(data.error); return }
    setLocalGames(prev => [data.game, ...prev])
    setShowAdd(false)
    toast.success('Jogo adicionado com sucesso!')
  }

  const categoryOptions = ['slots', 'crash', 'live', 'table', 'original']

  return (
    <div className="min-h-screen bg-[#070710]">
      <div className="bg-[#0d0d1a] border-b border-[#2a2a3e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <GamepadIcon className="w-5 h-5 text-[#f5a623]" />
                Gerenciar Jogos
              </h1>
              <p className="text-xs text-gray-500">{localGames.length} jogos no catálogo</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-titan flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar Jogo
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Modal adicionar jogo */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#f5a623]" /> Adicionar Novo Jogo
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                    <input type="text" className="input-titan text-sm" placeholder="Fortune Tiger" value={newGame.name} onChange={e => setNewGame(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Provedor *</label>
                    <input type="text" className="input-titan text-sm" placeholder="PG Soft" value={newGame.provider} onChange={e => setNewGame(p => ({ ...p, provider: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Emoji</label>
                    <input type="text" className="input-titan text-sm text-center text-xl" placeholder="🐯" value={newGame.emoji} onChange={e => setNewGame(p => ({ ...p, emoji: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">RTP (%)</label>
                    <input type="number" className="input-titan text-sm" placeholder="96" value={newGame.rtp} onChange={e => setNewGame(p => ({ ...p, rtp: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                  <div className="grid grid-cols-5 gap-1">
                    {categoryOptions.map(cat => (
                      <button key={cat} onClick={() => setNewGame(p => ({ ...p, category: cat }))}
                        className={`py-2 text-xs rounded-lg font-medium capitalize transition-all ${newGame.category === cat ? 'bg-[#f5a623] text-black' : 'bg-[#2a2a3e] text-gray-400'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                  <textarea className="input-titan text-sm min-h-[80px] resize-none" placeholder="Descrição do jogo..." value={newGame.description} onChange={e => setNewGame(p => ({ ...p, description: e.target.value }))} />
                </div>

                <div className="flex gap-3">
                  {[
                    { key: 'is_featured', icon: Star, label: 'Destaque' },
                    { key: 'is_hot', icon: Flame, label: 'Hot' },
                    { key: 'is_new', icon: Plus, label: 'Novo' },
                  ].map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setNewGame(p => ({ ...p, [key]: !(p as any)[key] }))}
                      className={`flex-1 flex items-center gap-1.5 justify-center py-2 rounded-xl text-xs font-bold border transition-all ${(newGame as any)[key] ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#f5a623]' : 'border-[#2a2a3e] text-gray-500'}`}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancelar</button>
                <button onClick={addGame} className="btn-titan flex-1">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Buscar jogo ou provedor..." className="input-titan pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'inactive', ...categoryOptions].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e]'}`}>
                {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f === 'inactive' ? 'Inativos' : f}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">{filtered.length} jogo(s)</p>

        {/* Grade de jogos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(game => (
            <div key={game.id} className={`bg-[#12121e] border rounded-2xl p-4 transition-all ${game.is_active ? 'border-[#2a2a3e]' : 'border-[#2a2a3e]/50 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{game.emoji || '🎮'}</span>
                <button
                  onClick={() => toggleActive(game.id, game.is_active)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${game.is_active ? 'bg-green-500/20 hover:bg-green-500/40' : 'bg-red-500/20 hover:bg-red-500/40'}`}
                >
                  {game.is_active ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                </button>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{game.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{game.provider} · RTP {game.rtp}%</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs bg-[#2a2a3e] text-gray-400 px-2 py-0.5 rounded-full capitalize">{game.category}</span>
                {game.is_featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">⭐</span>}
                {game.is_hot && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">🔥</span>}
                {game.is_new && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✨ Novo</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
