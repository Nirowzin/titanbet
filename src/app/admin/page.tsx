import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  Users, DollarSign, TrendingUp, GamepadIcon, ArrowUpRight,
  ArrowDownRight, ShieldCheck, Clock, CheckCircle, AlertTriangle,
  BarChart3, Settings
} from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Verificar se é admin
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Buscar estatísticas
  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: revenueData },
    { data: pendingWithdrawals },
    { count: totalGames },
    { data: recentTransactions },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    admin.from('transactions').select('amount, type').eq('status', 'completed').eq('type', 'deposit'),
    admin.from('transactions').select('*').eq('type', 'withdrawal').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    admin.from('games').select('*', { count: 'exact', head: true }),
    admin.from('transactions').select('*, profiles(username)').order('created_at', { ascending: false }).limit(15),
    admin.from('profiles').select('id, username, email, balance, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const totalRevenue = (revenueData || []).reduce((s: number, t: any) => s + t.amount, 0)

  const stats = [
    {
      title: 'Usuários Total',
      value: (totalUsers || 0).toLocaleString('pt-BR'),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: '+12% este mês',
      positive: true,
    },
    {
      title: 'Receita Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      change: '+8% esta semana',
      positive: true,
    },
    {
      title: 'Usuários Ativos (24h)',
      value: (activeUsers || 0).toLocaleString('pt-BR'),
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      change: 'Ativos agora',
      positive: true,
    },
    {
      title: 'Jogos Disponíveis',
      value: (totalGames || 0).toLocaleString('pt-BR'),
      icon: GamepadIcon,
      color: 'text-[#f5a623]',
      bg: 'bg-[#f5a623]/10',
      change: 'No catálogo',
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#070710]">
      {/* Header admin */}
      <div className="bg-[#0d0d1a] border-b border-[#2a2a3e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Painel Admin</h1>
            <p className="text-sm text-gray-500">TitanBet — Área Administrativa</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#f5a623]" />
            <span className="text-sm text-gray-400">Admin: {user.email}</span>
          </div>
        </div>
      </div>

      {/* Nav lateral + conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Nav pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { href: '/admin', label: 'Dashboard', icon: BarChart3, active: true },
            { href: '/admin/usuarios', label: 'Usuários', icon: Users },
            { href: '/admin/transacoes', label: 'Transações', icon: DollarSign },
            { href: '/admin/jogos', label: 'Jogos', icon: GamepadIcon },
            { href: '/admin/promocoes', label: 'Promoções', icon: TrendingUp },
            { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
          ].map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ title, value, icon: Icon, color, bg, change, positive }) => (
            <div key={title} className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{title}</p>
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-2">{value}</p>
              <div className="flex items-center gap-1">
                {positive ? (
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                )}
                <span className="text-xs text-gray-600">{change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Saques pendentes */}
          <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Saques Pendentes
              </h2>
              <Link href="/admin/transacoes?filter=pending_withdrawal" className="text-xs text-[#f5a623] hover:underline">
                Ver todos →
              </Link>
            </div>

            {(pendingWithdrawals || []).length > 0 ? (
              <div className="space-y-2">
                {(pendingWithdrawals || []).slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#1e1e2e]">
                    <div>
                      <p className="text-sm text-white">{tx.description?.split(' - ')[1] || 'PIX'}</p>
                      <p className="text-xs text-gray-600">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{formatCurrency(tx.amount)}</span>
                      <div className="flex gap-1">
                        <button className="w-7 h-7 bg-green-500/20 hover:bg-green-500/40 rounded-lg flex items-center justify-center transition-colors">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                        <button className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-500/30 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Nenhum saque pendente!</p>
              </div>
            )}
          </div>

          {/* Usuários recentes */}
          <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Novos Usuários
              </h2>
              <Link href="/admin/usuarios" className="text-xs text-[#f5a623] hover:underline">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-2">
              {(recentUsers || []).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#1e1e2e]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#f5a623] to-[#e08000] rounded-lg flex items-center justify-center text-black text-xs font-black">
                      {u.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-white">@{u.username || 'usuário'}</p>
                      <p className="text-xs text-gray-600">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#f5a623]">{formatCurrency(u.balance)}</p>
                    <p className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transações recentes */}
          <div className="lg:col-span-2 bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#f5a623]" />
                Últimas Transações
              </h2>
              <Link href="/admin/transacoes" className="text-xs text-[#f5a623] hover:underline">
                Ver todas →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-[#1e1e2e]">
                    <th className="pb-3 pr-4">Usuário</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentTransactions || []).map((tx: any) => (
                    <tr key={tx.id} className="border-b border-[#1a1a2e]/50">
                      <td className="py-3 pr-4 text-gray-400">@{tx.profiles?.username || '-'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                          tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                          tx.type === 'win' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-white">{formatCurrency(tx.amount)}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs ${
                          tx.status === 'completed' ? 'text-green-400' :
                          tx.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
