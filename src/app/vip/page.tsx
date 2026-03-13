import { createClient } from '@/lib/supabase/server'
import { getVipLevelName, getVipLevelColor } from '@/lib/utils'
import { Star, Trophy, Zap, Gift, Shield, Crown, TrendingUp, ChevronRight } from 'lucide-react'

export default async function VIPPage() {
  const supabase = await createClient()

  const { data: vipLevels } = await supabase
    .from('vip_levels')
    .select('*')
    .order('level', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('vip_level, vip_points, total_wagered').eq('id', user.id).single()
    profile = data
  }

  const levelColors = [
    'from-gray-500/20 to-gray-600/10 border-gray-500/30',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    'from-red-500/20 to-red-600/10 border-red-500/30',
  ]

  const levelIcons = ['⚪', '🔵', '🟣', '🟡', '🟠', '🔴']

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1a0a00] to-[#0a0a0f] border-b border-[#2a2a3e] py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-[#f5a623]" />
            <span className="text-sm font-bold text-[#f5a623]">Programa VIP Exclusivo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Quanto mais você joga,{' '}
            <span className="text-[#f5a623]">mais você ganha</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Suba de nível, desbloqueie benefícios exclusivos e receba cashback, bônus e tratamento VIP real.
          </p>

          {profile && (
            <div className="mt-8 inline-flex items-center gap-4 bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
              <div className="text-3xl">{levelIcons[profile.vip_level] || '⚪'}</div>
              <div className="text-left">
                <p className="text-white font-bold">Seu nível atual: {getVipLevelName(profile.vip_level)}</p>
                <p className="text-sm text-gray-500">{profile.vip_points.toLocaleString('pt-BR')} pontos VIP</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Como funciona */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-6 text-center">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'Jogue e ganhe pontos', desc: 'A cada R$10 apostado nos jogos, você ganha 1 ponto VIP.' },
              { icon: TrendingUp, title: 'Suba de nível', desc: 'Acumule pontos para desbloquear os próximos níveis VIP.' },
              { icon: Gift, title: 'Resgate benefícios', desc: 'Cashback maior, saques mais rápidos e bônus exclusivos.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-titan-card rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#f5a623]" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Níveis */}
        <h2 className="text-2xl font-black text-white mb-6 text-center">Níveis VIP</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(vipLevels || []).map((level, i) => {
            const isCurrentLevel = profile?.vip_level === level.level
            return (
              <div
                key={level.id}
                className={`relative bg-gradient-to-br ${levelColors[i] || levelColors[0]} border rounded-2xl p-6 ${
                  isCurrentLevel ? 'ring-2 ring-[#f5a623]' : ''
                }`}
              >
                {isCurrentLevel && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5a623] text-black text-xs font-black px-3 py-1 rounded-full">
                    SEU NÍVEL
                  </span>
                )}

                <div className="text-4xl mb-3">{levelIcons[i]}</div>
                <h3 className="text-xl font-black text-white mb-1">{level.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {level.min_points.toLocaleString('pt-BR')}+ pontos VIP
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Cashback</span>
                    <span className="font-bold text-white">{level.cashback_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Saque máx/dia</span>
                    <span className="font-bold text-white">R${level.withdrawal_limit?.toLocaleString('pt-BR')}</span>
                  </div>
                  {level.free_spins_weekly > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Free spins/semana</span>
                      <span className="font-bold text-white">{level.free_spins_weekly}</span>
                    </div>
                  )}
                </div>

                {level.benefits && (level.benefits as string[]).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-600 mb-2">Benefícios exclusivos</p>
                    {(level.benefits as string[]).map((benefit: string) => (
                      <div key={benefit} className="flex items-center gap-2 mb-1">
                        <ChevronRight className="w-3 h-3 text-[#f5a623]" />
                        <span className="text-xs text-gray-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-[#f5a623]/10 via-transparent to-[#f5a623]/10 border border-[#f5a623]/20 rounded-2xl p-8">
          <Trophy className="w-12 h-12 text-[#f5a623] mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-3">Comece agora e suba de nível!</h3>
          <p className="text-gray-400 mb-6">Faça seu primeiro depósito e já inicie sua jornada VIP.</p>
          <a href="/carteira" className="btn-titan inline-flex items-center gap-2 py-3 px-8 text-base">
            <Zap className="w-5 h-5" /> Depositar Agora
          </a>
        </div>
      </div>
    </div>
  )
}
