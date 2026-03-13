'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, getTransactionLabel, getStatusLabel, getStatusColor } from '@/lib/utils'
import { History, ArrowDownCircle, ArrowUpCircle, GamepadIcon, Filter } from 'lucide-react'

type TabType = 'transacoes' | 'apostas'

export default function HistoricoClient({ transactions, bets }: { transactions: any[]; bets: any[] }) {
  const [tab, setTab] = useState<TabType>('transacoes')
  const [filter, setFilter] = useState('all')

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  const filteredBets = bets.filter(b => {
    if (filter === 'all') return true
    return b.status === filter
  })

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#001a0a] via-[#0d0d1a] to-[#001a2e] border-b border-[#1e1e2e]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-[#f5a623]" />
            <div>
              <h1 className="text-3xl font-black text-white">Histórico</h1>
              <p className="text-gray-500 text-sm">Acompanhe todas as suas atividades</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {([
              { id: 'transacoes', label: 'Transações', icon: ArrowDownCircle, count: transactions.length },
              { id: 'apostas', label: 'Apostas', icon: GamepadIcon, count: bets.length },
            ] as const).map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setFilter('all') }}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  tab === id ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 hover:text-white border border-[#2a2a3e]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-black/20' : 'bg-[#2a2a3e]'}`}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filtro rápido */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {tab === 'transacoes' ? (
            ['all', 'deposit', 'withdrawal', 'bet', 'win', 'bonus'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e] hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : getTransactionLabel(f as any)}
              </button>
            ))
          ) : (
            ['all', 'win', 'loss'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e] hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'win' ? 'Vitórias' : 'Derrotas'}
              </button>
            ))
          )}
        </div>

        {/* Transações */}
        {tab === 'transacoes' && (
          <div className="space-y-2">
            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
              <div key={tx.id} className="bg-titan-card rounded-xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ['deposit', 'win', 'bonus'].includes(tx.type) ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {['deposit', 'win', 'bonus'].includes(tx.type)
                    ? <ArrowDownCircle className="w-5 h-5 text-green-400" />
                    : <ArrowUpCircle className="w-5 h-5 text-red-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{getTransactionLabel(tx.type)}</p>
                      {tx.description && <p className="text-xs text-gray-600 truncate">{tx.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black ${['deposit','win','bonus'].includes(tx.type) ? 'text-green-400' : 'text-red-400'}`}>
                        {['deposit','win','bonus'].includes(tx.type) ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-xs ${getStatusColor(tx.status)}`}>{getStatusLabel(tx.status)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">{formatDate(tx.created_at)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-16">
                <History className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        )}

        {/* Apostas */}
        {tab === 'apostas' && (
          <div>
            {/* Resumo */}
            {bets.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total apostado', value: formatCurrency(bets.reduce((s, b) => s + b.amount, 0)) },
                  {
                    label: 'Total ganho',
                    value: formatCurrency(bets.filter(b => b.status === 'win').reduce((s, b) => s + b.win_amount, 0)),
                    green: true,
                  },
                  {
                    label: 'Taxa de vitórias',
                    value: `${Math.round((bets.filter(b => b.status === 'win').length / bets.length) * 100)}%`,
                  },
                ].map(({ label, value, green }) => (
                  <div key={label} className="bg-titan-card rounded-xl p-4 text-center">
                    <p className={`text-xl font-black ${green ? 'text-green-400' : 'text-white'}`}>{value}</p>
                    <p className="text-xs text-gray-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {filteredBets.length > 0 ? filteredBets.map(bet => (
                <div key={bet.id} className="bg-titan-card rounded-xl p-4 flex items-center gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {bet.games?.emoji || '🎮'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-white">{bet.games?.name || 'Jogo'}</p>
                        <p className="text-xs text-gray-600">
                          Aposta: {formatCurrency(bet.amount)}
                          {bet.multiplier > 0 && ` · ${bet.multiplier}x`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {bet.status === 'win' ? (
                          <p className="font-black text-green-400">+{formatCurrency(bet.win_amount)}</p>
                        ) : (
                          <p className="font-black text-red-400">-{formatCurrency(bet.amount)}</p>
                        )}
                        <span className={`text-xs ${bet.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.status === 'win' ? '✅ Ganhou' : '❌ Perdeu'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{formatDate(bet.created_at)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16">
                  <GamepadIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma aposta encontrada</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
