import { createClient } from '@/lib/supabase/server'
import type { Game, GameCategory } from '@/types/database'
import { GameCard } from '@/components/casino/GameCard'
import { Gamepad2, Zap, Trophy, Users } from 'lucide-react'
import { CasinoFilters } from '@/components/casino/CasinoFilters'

interface Props {
  searchParams: Promise<{ cat?: string; q?: string; provider?: string }>
}

async function getGames(category?: string, search?: string, provider?: string) {
  const supabase = await createClient()
  let query = supabase.from('games').select('*').eq('is_active', true)

  if (category && !['all', 'featured', 'hot', 'new'].includes(category)) {
    query = query.eq('category', category as GameCategory)
  }
  if (category === 'featured') query = query.eq('is_featured', true)
  if (category === 'hot') query = query.eq('is_hot', true)
  if (category === 'new') query = query.eq('is_new', true)
  if (search) query = query.ilike('name', `%${search}%`)
  if (provider) query = query.eq('provider', provider)

  const { data } = await query.order('sort_order').limit(60)
  return (data || []) as Game[]
}

export default async function CassinoPage({ searchParams }: Props) {
  const params = await searchParams
  const games = await getGames(params.cat, params.q, params.provider)
  const currentCat = params.cat || 'all'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0a2e] via-[#0d0d1a] to-[#0a0a1e] border-b border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-[#f5a623]" />
            <h1 className="text-3xl font-black text-white">Cassino</h1>
          </div>
          <p className="text-gray-500 mb-6">+2.500 jogos dos melhores provedores do mundo</p>
          <div className="flex flex-wrap gap-6">
            {[
              { icon: Trophy, label: 'Provedores', value: '50+' },
              { icon: Gamepad2, label: 'Jogos ativos', value: '2.500+' },
              { icon: Users, label: 'Jogando agora', value: '4.200' },
              { icon: Zap, label: 'Jackpot atual', value: 'R$1.2M' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#f5a623]" />
                <span className="text-sm text-gray-600">{label}:</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <CasinoFilters currentCat={currentCat} currentSearch={params.q} />

        <div className="mt-6">
          {games.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {games.length} jogo{games.length !== 1 ? 's' : ''} encontrado{games.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {games.map(game => <GameCard key={game.id} game={game} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum jogo encontrado</h3>
              <p className="text-gray-500">Tente outra categoria ou remova os filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

