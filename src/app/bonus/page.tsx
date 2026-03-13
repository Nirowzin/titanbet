import { createClient } from '@/lib/supabase/server'
import type { Promotion } from '@/types/database'
import Link from 'next/link'
import { Gift, ArrowRight, Clock, Check, Info, Star, Zap, TrendingUp, Users } from 'lucide-react'

async function getPromotions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return (data || []) as Promotion[]
}

const typeIcons: Record<string, string> = {
  welcome: '🎉',
  deposit: '💰',
  freespin: '🎰',
  cashback: '💸',
  referral: '👥',
  vip: '👑',
}

const typeLabels: Record<string, string> = {
  welcome: 'Boas-Vindas',
  deposit: 'Recarga',
  freespin: 'Giros Grátis',
  cashback: 'Cashback',
  referral: 'Indicação',
  vip: 'VIP Exclusivo',
}

const typeColors: Record<string, string> = {
  welcome: 'from-yellow-900/30 to-orange-900/30 border-yellow-500/20',
  deposit: 'from-green-900/30 to-emerald-900/30 border-green-500/20',
  freespin: 'from-purple-900/30 to-violet-900/30 border-purple-500/20',
  cashback: 'from-blue-900/30 to-cyan-900/30 border-blue-500/20',
  referral: 'from-pink-900/30 to-rose-900/30 border-pink-500/20',
  vip: 'from-amber-900/30 to-yellow-900/30 border-amber-500/20',
}

export default async function BonusPage() {
  const promotions = await getPromotions()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0a00] via-[#1a1200] to-[#0a001a] border-b border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8 text-[#f5a623]" />
            <h1 className="text-3xl font-black text-white">Promoções</h1>
          </div>
          <p className="text-gray-500">Bônus exclusivos para novos e veteranos jogadores do TitanBet</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Stats de promoção */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Gift, label: 'Bônus de Boas-Vindas', value: '200%', sub: 'Até R$500' },
            { icon: Zap, label: 'Recarga Semanal', value: '50%', sub: 'Toda Segunda' },
            { icon: TrendingUp, label: 'Cashback VIP', value: '8%', sub: 'Das suas perdas' },
            { icon: Users, label: 'Indicação Amigo', value: 'R$50', sub: 'Por indicação' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-titan-card rounded-xl p-5 text-center">
              <Icon className="w-6 h-6 text-[#f5a623] mx-auto mb-2" />
              <p className="text-2xl font-black text-[#f5a623]">{value}</p>
              <p className="text-sm font-bold text-white mt-1">{label}</p>
              <p className="text-xs text-gray-600">{sub}</p>
            </div>
          ))}
        </div>

        {/* Grid de promoções */}
        <div className="grid md:grid-cols-2 gap-6">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className={`bg-gradient-to-br ${typeColors[promo.type] || 'from-[#1a1a28] to-[#12121e] border-[#2a2a3e]'} border rounded-2xl p-7 relative overflow-hidden hover-card`}
            >
              {/* Decoração */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/3 rounded-full blur-xl" />

              {/* Badge tipo */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center text-2xl">
                    {typeIcons[promo.type] || '🎁'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#f5a623] uppercase tracking-wider">
                      {typeLabels[promo.type] || promo.type}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{promo.title}</h3>
                  </div>
                </div>
                {promo.bonus_percentage && promo.bonus_percentage > 0 && (
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#f5a623]">{promo.bonus_percentage}%</p>
                    {promo.max_bonus && (
                      <p className="text-xs text-gray-400">até R${promo.max_bonus.toFixed(0)}</p>
                    )}
                  </div>
                )}
                {promo.free_spins > 0 && !promo.bonus_percentage && (
                  <div className="text-right">
                    <p className="text-3xl font-black text-green-400">{promo.free_spins}</p>
                    <p className="text-xs text-gray-400">Giros Grátis</p>
                  </div>
                )}
              </div>

              <p className="text-gray-400 mb-5 leading-relaxed text-sm">{promo.description}</p>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {promo.min_deposit && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Depósito Mínimo</p>
                    <p className="text-sm font-bold text-white">R${promo.min_deposit.toFixed(2)}</p>
                  </div>
                )}
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Rollover</p>
                  <p className="text-sm font-bold text-white">{promo.wagering_requirement}x</p>
                </div>
                {promo.free_spins > 0 && promo.bonus_percentage && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Giros Grátis</p>
                    <p className="text-sm font-bold text-green-400">{promo.free_spins} Giros</p>
                  </div>
                )}
                {promo.valid_until && (
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Válido até</p>
                    <p className="text-sm font-bold text-white">
                      {new Date(promo.valid_until).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Benefícios */}
              <div className="space-y-1.5 mb-6">
                {promo.free_spins > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{promo.free_spins} giros grátis inclusos</span>
                  </div>
                )}
                {promo.max_bonus && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Bônus máximo de R${promo.max_bonus.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Saque via PIX após rollover</span>
                </div>
              </div>

              <Link href="/registro">
                <button className="btn-titan w-full py-3">
                  Resgatar Agora <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              {/* Termos */}
              {promo.terms && (
                <details className="mt-4">
                  <summary className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer hover:text-gray-400">
                    <Info className="w-3 h-3" /> Ver termos e condições
                  </summary>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{promo.terms}</p>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* VIP CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1a0a00] via-[#1a1000] to-[#0a001a] border border-[#f5a623]/20 rounded-3xl p-10 text-center">
          <Star className="w-12 h-12 text-[#f5a623] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">Programa VIP TitanBet</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Suba de nível, acumule pontos e desbloqueie cashback exclusivo, gerente de conta dedicado e muito mais.
          </p>
          <Link href="/vip">
            <button className="btn-titan py-3.5 px-10 text-base">
              Conhecer o Programa VIP <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
