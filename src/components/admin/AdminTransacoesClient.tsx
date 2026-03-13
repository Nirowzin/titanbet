'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getTransactionLabel, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Search, CheckCircle, XCircle, DollarSign, ChevronLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminTransacoesClient({ transactions }: { transactions: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [localTxs, setLocalTxs] = useState(transactions)

  const filtered = localTxs.filter(tx => {
    const matchSearch = !search || 
      tx.profiles?.username?.toLowerCase().includes(search.toLowerCase()) ||
      tx.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      tx.external_reference?.toLowerCase().includes(search.toLowerCase())
    
    const matchFilter = filter === 'all' ? true :
      filter === 'pending' ? tx.status === 'pending' :
      filter === 'withdrawal' ? tx.type === 'withdrawal' :
      filter === 'deposit' ? tx.type === 'deposit' : true

    return matchSearch && matchFilter
  })

  const approveWithdrawal = async (txId: string) => {
    setProcessingId(txId)
    try {
      const res = await fetch('/api/admin/transacoes/aprovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: txId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLocalTxs(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'completed' } : tx))
      toast.success('Saque aprovado e processado!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar saque')
    }
    setProcessingId(null)
  }

  const rejectWithdrawal = async (txId: string) => {
    setProcessingId(txId)
    try {
      const res = await fetch('/api/admin/transacoes/rejeitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: txId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLocalTxs(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'failed' } : tx))
      toast.success('Saque rejeitado e saldo estornado.')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar')
    }
    setProcessingId(null)
  }

  const pendingCount = localTxs.filter(t => t.status === 'pending' && t.type === 'withdrawal').length

  return (
    <div className="min-h-screen bg-[#070710]">
      <div className="bg-[#0d0d1a] border-b border-[#2a2a3e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#f5a623]" />
              Transações
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">{transactions.length} transações</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Alerta de saques pendentes */}
        {pendingCount > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-white">
              Há <strong className="text-yellow-400">{pendingCount} saque(s) pendente(s)</strong> aguardando aprovação.
            </p>
            <button onClick={() => setFilter('withdrawal')} className="ml-auto text-xs text-yellow-400 hover:underline whitespace-nowrap">
              Ver saques →
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por usuário ou referência..."
              className="input-titan pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'deposit', label: 'Depósitos' },
              { id: 'withdrawal', label: 'Saques' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === id ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e]'
                }`}
              >
                {label}
                {id === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">{filtered.length} resultado(s)</p>

        {/* Tabela */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 bg-[#0d0d1a]">
                <tr>
                  <th className="px-5 py-4">Usuário</th>
                  <th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Descrição</th>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-t border-[#1e1e2e] hover:bg-[#1a1a2e]/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">@{tx.profiles?.username || '-'}</p>
                      <p className="text-xs text-gray-600">{tx.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                        tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                        tx.type === 'win' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getTransactionLabel(tx.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-white">{formatCurrency(tx.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold ${getStatusColor(tx.status)}`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs max-w-[180px] truncate">
                      {tx.description || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(tx.created_at)}</td>
                    <td className="px-5 py-4">
                      {tx.type === 'withdrawal' && tx.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveWithdrawal(tx.id)}
                            disabled={processingId === tx.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(tx.id)}
                            disabled={processingId === tx.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
