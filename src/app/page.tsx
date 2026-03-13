import { createClient } from '@/lib/supabase/server'
import type { Game, Promotion } from '@/types/database'
import Link from 'next/link'
import { GameCard } from '@/components/casino/GameCard'
import {
  Trophy, Star, Zap, Shield, TrendingUp, Gift,
  ArrowRight, Gamepad2, Flame, Sparkles, ChevronRight
} from 'lucide-react'

async function getHomeData() {
  const supabase = await createClient()

  const [featuredGames, hotGames, newGames, promotions] = await Promise.all([
    supabase.from('games').select('*').eq('is_featured', true).eq('is_active', true).order('sort_order').limit(8),
    supabase.from('games').select('*').eq('is_hot', true).eq('is_active', true).order('sort_order').limit(8),
    supabase.from('games').select('*').eq('is_new', true).eq('is_active', true).order('sort_order').limit(8),
    supabase.from('promotions').select('*').eq('is_active', true).order('sort_order').limit(3),
  ])

  return {
    featured: featuredGames.data || [] as Game[],
    hot: hotGames.data || [] as Game[],
    newGames: newGames.data || [] as Game[],
    promotions: promotions.data || [] as Promotion[],
  }
}

export default async function Home() {
  const { featured, hot, newGames, promotions } = await getHomeData()

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-titan-gradient">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-orange-900 via-transparent to-blue-900" />
        <div className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 bg-[#f5a623]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div className="animate-slide-up text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-full px-3 py-1.5 mb-4 sm:mb-6">
                <Flame className="w-3.5 h-3.5 text-[#f5a623]" />
                <span className="text-xs sm:text-sm font-medium text-[#f5a623]">A Casa dos Campeões</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
                Aposte e{' '}
                <span className="text-titan-gold">Ganhe Grande</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                Os melhores jogos, as maiores odds e bônus exclusivos. Saque via PIX em minutos.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/registro">
                  <button className="btn-titan text-sm sm:text-base py-2.5 sm:py-3.5 px-5 sm:px-8 shadow-xl animate-pulse-glow">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Criar Conta Grátis
                  </button>
                </Link>
                <Link href="/cassino">
                  <button className="btn-outline text-sm sm:text-base py-2.5 sm:py-3.5 px-5 sm:px-8">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" /> Ver Jogos
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-10 justify-center md:justify-start">
                {[
                  { label: 'Jogadores Ativos', value: '150K+' },
                  { label: 'Jogos Disponíveis', value: '2.500+' },
                  { label: 'Maior Pagamento', value: 'R$870K' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xl sm:text-2xl font-black text-[#f5a623]">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bônus card */}
            <div className="animate-bounce-in mt-4 md:mt-0">
              <div className="relative bg-gradient-to-br from-[#1a1a28] to-[#12121e] border border-[#2a2a3e] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl max-w-sm mx-auto md:max-w-none">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#f5a623]/10 rounded-full blur-xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#f5a623] flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Bônus de Boas-Vindas</p>
                      <p className="text-2xl sm:text-3xl font-black text-[#f5a623]">200%</p>
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg sm:text-xl mb-2">Até R$500 de Bônus</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                    Faça seu primeiro depósito e multiplique seu saldo para jogar mais.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mb-4 sm:mb-6">
                    {['✅ Sem código de bônus', '✅ + 50 Giros Grátis', '✅ Saque PIX instantâneo', '✅ Suporte 24/7 em português'].map(item => (
                      <p key={item} className="text-xs sm:text-sm text-gray-300">{item}</p>
                    ))}
                  </div>
                  <Link href="/registro">
                    <button className="btn-titan w-full py-2.5 sm:py-3.5 text-sm sm:text-base">
                      Resgatar Bônus Agora <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </Link>
                  <p className="text-xs text-gray-600 mt-2 sm:mt-3 text-center">*Rollover 30x. Válido para novos jogadores.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-[#1e1e2e] bg-[#0d0d18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-6 items-center">
            {[
              { icon: Shield, label: 'SSL 256-bit', sub: 'Conexão Segura' },
              { icon: Zap, label: 'PIX Instantâneo', sub: 'Saque Rápido' },
              { icon: Trophy, label: 'Licenciada', sub: 'Operação Legal' },
              { icon: Star, label: '4.9/5', sub: '50.000+ avaliações' },
              { icon: TrendingUp, label: 'RTP 99%', sub: 'Maior Retorno' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1a2e] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5a623]" />
                </div>
                <div className="hidden xs:block sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{label}</p>
                  <p className="text-xs text-gray-600 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Promoções */}
        {promotions.length > 0 && (
          <section>
            <SectionHeader title="Promoções em Destaque" icon={Gift} href="/bonus" label="Ver Todas" />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {promotions.map(promo => <PromotionCard key={promo.id} promo={promo} />)}
            </div>
          </section>
        )}

        {/* Destaque */}
        {featured.length > 0 && (
          <section>
            <SectionHeader title="Jogos em Destaque" icon={Sparkles} href="/cassino" label="Ver Todos" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {featured.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>
        )}

        {/* Hot */}
        {hot.length > 0 && (
          <section>
            <SectionHeader title="🔥 Em Alta Agora" icon={Flame} href="/cassino?cat=hot" label="Ver Mais" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {hot.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>
        )}

        {/* Novidades */}
        {newGames.length > 0 && (
          <section>
            <SectionHeader title="✨ Novidades" icon={Star} href="/cassino?cat=new" label="Ver Mais" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {newGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>
        )}

        {/* Categorias */}
        <section>
          <SectionHeader title="Explorar por Categoria" icon={Gamepad2} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: 'Slots', icon: '🎰', cat: 'slots', color: 'from-purple-900/40 to-purple-800/20 border-purple-500/20' },
              { label: 'Crash Games', icon: '🚀', cat: 'crash', color: 'from-red-900/40 to-red-800/20 border-red-500/20' },
              { label: 'Ao Vivo', icon: '📡', cat: 'live', color: 'from-green-900/40 to-green-800/20 border-green-500/20' },
              { label: 'Jogos de Mesa', icon: '🃏', cat: 'table', color: 'from-blue-900/40 to-blue-800/20 border-blue-500/20' },
              { label: 'Originais', icon: '⭐', cat: 'original', color: 'from-yellow-900/40 to-yellow-800/20 border-yellow-500/20' },
            ].map(({ label, icon, cat, color }) => (
              <Link key={cat} href={`/cassino?cat=${cat}`}>
                <div className={`bg-gradient-to-br ${color} border rounded-xl p-3 sm:p-5 text-center hover:scale-105 transition-transform`}>
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{icon}</div>
                  <p className="text-xs sm:text-sm font-bold text-white">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section>
          <div className="bg-gradient-to-r from-[#1a0a00] via-[#1a1200] to-[#001a00] border border-[#f5a623]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f5a623]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f5a623]/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">
                Pronto para ser o próximo <span className="text-titan-gold">grande vencedor</span>?
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-5 sm:mb-8 max-w-lg mx-auto">
                Junte-se a mais de 150.000 jogadores que já descobriram o melhor cassino online do Brasil.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                <Link href="/registro">
                  <button className="btn-titan text-sm sm:text-base py-2.5 sm:py-3.5 px-6 sm:px-10 shadow-2xl">
                    <Trophy className="w-5 h-5" /> Começar Agora
                  </button>
                </Link>
                <Link href="/cassino">
                  <button className="btn-outline text-sm sm:text-base py-2.5 sm:py-3.5 px-6 sm:px-8">Ver Todos os Jogos</button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({ title, icon: Icon, href, label }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  label?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5a623]" />
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
      </div>
      {href && label && (
        <Link href={href} className="flex items-center gap-1 text-sm text-[#f5a623] hover:text-white transition-colors">
          {label} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function PromotionCard({ promo }: { promo: Promotion }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a28] to-[#12121e] border border-[#2a2a3e] rounded-xl sm:rounded-2xl p-4 sm:p-6 hover-card">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center">
          <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5a623]" />
        </div>
        {promo.bonus_percentage && promo.bonus_percentage > 0 && (
          <span className="bg-[#f5a623] text-black text-base sm:text-lg font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg">
            {promo.bonus_percentage}%
          </span>
        )}
        {promo.free_spins > 0 && (
          <span className="bg-green-500 text-black text-xs sm:text-sm font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg">
            {promo.free_spins} Giros
          </span>
        )}
      </div>
      <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 sm:mb-2">{promo.title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">{promo.short_description}</p>
      {promo.max_bonus && (
        <p className="text-xs text-[#f5a623] mb-2 sm:mb-3">Até R${promo.max_bonus.toFixed(0)} de bônus</p>
      )}
      <Link href="/bonus">
        <button className="btn-titan w-full py-2 sm:py-2.5 text-xs sm:text-sm">
          Resgatar <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </Link>
    </div>
  )
}

