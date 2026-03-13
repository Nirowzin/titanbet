'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getVipLevelName, getStatusColor } from '@/lib/utils'
import { Search, Filter, Users, Shield, Ban, Wallet, ChevronLeft, Star } from 'lucide-react'

export default function AdminUsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = users.filter(u => {
    const matchSearch = !search || 
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
    
    const matchFilter = filter === 'all' ? true :
      filter === 'admin' ? u.role === 'admin' :
      filter === 'verified' ? u.kyc_status === 'approved' :
      filter === 'high_balance' ? u.balance >= 500 : true

    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-[#070710]">
      <div className="bg-[#0d0d1a] border-b border-[#2a2a3e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#f5a623]" />
              Gerenciar Usuários
            </h1>
            <p className="text-xs text-gray-500">{users.length} usuários cadastrados</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por username, email ou nome..."
              className="input-titan pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'admin', label: 'Admins' },
              { id: 'verified', label: 'Verificados' },
              { id: 'high_balance', label: 'Saldo Alto' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === id ? 'bg-[#f5a623] text-black' : 'bg-[#12121e] text-gray-400 border border-[#2a2a3e]'
                }`}
              >
                {label}
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
                  <th className="px-5 py-4">VIP</th>
                  <th className="px-5 py-4">Saldo</th>
                  <th className="px-5 py-4">KYC</th>
                  <th className="px-5 py-4">Depositado</th>
                  <th className="px-5 py-4">Cadastro</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-t border-[#1e1e2e] hover:bg-[#1a1a2e]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#f5a623] to-[#e08000] rounded-xl flex items-center justify-center text-black text-xs font-black flex-shrink-0">
                          {u.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">@{u.username}</p>
                            {u.role === 'admin' && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-[#f5a623]">
                        ⭐ {getVipLevelName(u.vip_level)}
                      </span>
                      <p className="text-xs text-gray-600">{(u.vip_points || 0).toLocaleString()} pts</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{formatCurrency(u.balance)}</p>
                      {u.bonus_balance > 0 && (
                        <p className="text-xs text-purple-400">+{formatCurrency(u.bonus_balance)} bônus</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.kyc_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        u.kyc_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {u.kyc_status === 'approved' ? 'Verificado' : u.kyc_status === 'pending' ? 'Pendente' : 'Não verif.'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{formatCurrency(u.total_deposited || 0)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/40 transition-colors" title="Adicionar saldo">
                          <Wallet className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/40 transition-colors" title="Verificar KYC">
                          <Shield className="w-4 h-4 text-green-400" />
                        </button>
                        <button className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/40 transition-colors" title="Banir usuário">
                          <Ban className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
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
