'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getTransactionLabel, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Transaction } from '@/types/database'
import toast from 'react-hot-toast'
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, QrCode, Copy,
  CheckCircle, Clock, AlertCircle, Loader2, Zap, RefreshCw, History
} from 'lucide-react'

type Tab = 'deposito' | 'saque' | 'historico'

export default function CarteiraPage() {
  const { profile, refreshProfile } = useAuth()
  const [tab, setTab] = useState<Tab>('deposito')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  // Depósito
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_url: string; external_reference: string } | null>(null)

  // Saque
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    if (tab === 'historico') loadTransactions()
  }, [tab])

  const loadTransactions = async () => {
    const supabase = createClient()
    setLoadingTx(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions((data || []) as Transaction[])
    setLoadingTx(false)
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount < 10) return toast.error('Valor mínimo de depósito é R$10,00')
    if (amount > 50000) return toast.error('Valor máximo por depósito é R$50.000,00')

    setDepositLoading(true)
    try {
      const res = await fetch('/api/pagamentos/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setPixData({
        qr_code: data.qr_code,
        qr_code_url: data.qr_code_url,
        external_reference: data.external_reference,
      })
      toast.success('QR Code PIX gerado! Aguardando pagamento...')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar PIX')
    }
    setDepositLoading(false)
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 20) return toast.error('Valor mínimo de saque é R$20,00')
    if (!profile) return
    if (amount > profile.balance) return toast.error('Saldo insuficiente')
    if (!pixKey) return toast.error('Informe sua chave PIX')

    setWithdrawLoading(true)
    try {
      const res = await fetch('/api/pagamentos/saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, pix_key: pixKey, pix_key_type: pixKeyType }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      toast.success('Solicitação de saque enviada! Processamento em até 24h.')
      setWithdrawAmount('')
      setPixKey('')
      await refreshProfile()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar saque')
    }
    setWithdrawLoading(false)
  }

  const copyPix = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Código PIX copiado!')
  }

  const quickAmounts = [20, 50, 100, 200, 500, 1000]

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f5a623]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#001a0a] via-[#0d0d1a] to-[#001a2e] border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-8 h-8 text-[#f5a623]" />
            <h1 className="text-3xl font-black text-white">Carteira</h1>
          </div>

          {/* Saldo cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#f5a623]/10 to-transparent border border-[#f5a623]/20 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-1">Saldo Disponível</p>
              <p className="text-3xl font-black text-[#f5a623]">{formatCurrency(profile.balance)}</p>
              <p className="text-xs text-gray-600 mt-1">Disponível para apostas e saques</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-1">Saldo Bônus</p>
              <p className="text-3xl font-black text-purple-400">{formatCurrency(profile.bonus_balance)}</p>
              <p className="text-xs text-gray-600 mt-1">Sujeito a rollover antes do saque</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Abas */}
        <div className="flex gap-1 bg-[#12121e] border border-[#2a2a3e] rounded-xl p-1 mb-8">
          {([
            { id: 'deposito', label: 'Depositar', icon: ArrowDownCircle },
            { id: 'saque', label: 'Sacar', icon: ArrowUpCircle },
            { id: 'historico', label: 'Histórico', icon: History },
          ] as { id: Tab; label: string; icon: typeof ArrowDownCircle }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-[#f5a623] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Depósito */}
        {tab === 'deposito' && (
          <div className="max-w-lg mx-auto animate-slide-up">
            {!pixData ? (
              <div className="bg-titan-card rounded-2xl p-7">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#f5a623]" /> Depositar via PIX
                </h2>

                {/* Valor */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Valor do Depósito</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input
                      type="number"
                      className="input-titan pl-10"
                      placeholder="0,00"
                      min="10"
                      max="50000"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Mínimo: R$10,00 | Máximo: R$50.000,00</p>
                </div>

                {/* Atalhos de valor */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setDepositAmount(amount.toString())}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        depositAmount === amount.toString()
                          ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#f5a623]'
                          : 'border-[#2a2a3e] text-gray-400 hover:border-[#f5a623]/30 hover:text-white'
                      }`}
                    >
                      R${amount}
                    </button>
                  ))}
                </div>

                {/* Bônus indicator */}
                {parseFloat(depositAmount) >= 20 && (
                  <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-xl p-4 mb-5 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#f5a623] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#f5a623]">+ Bônus de 200%!</p>
                      <p className="text-xs text-gray-400">
                        Você receberá até{' '}
                        <strong className="text-white">
                          {formatCurrency(Math.min(parseFloat(depositAmount) * 2, 500))}
                        </strong>{' '}
                        de bônus com seu depósito
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  className="btn-titan w-full py-4 text-base"
                  disabled={depositLoading || !depositAmount}
                >
                  {depositLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PIX...</>
                  ) : (
                    <><QrCode className="w-5 h-5" /> Gerar QR Code PIX</>
                  )}
                </button>

                {/* Info */}
                <div className="mt-5 space-y-2">
                  {['Depósito confirmado em segundos', 'Sem taxas adicionais', 'Bônus creditado automaticamente'].map(info => (
                    <div key={info} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{info}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-titan-card rounded-2xl p-7 text-center animate-bounce-in">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">PIX Gerado!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Copie o código abaixo e pague no seu app bancário
                </p>

                {/* QR Code placeholder */}
                <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-5 flex items-center justify-center p-2">
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <p className="text-gray-600 text-xs text-center">QR Code PIX</p>
                  </div>
                </div>

                <div className="bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-2">Código Copia e Cola</p>
                  <p className="text-xs text-gray-300 break-all font-mono leading-relaxed">
                    {pixData.qr_code || '00020126580014br.gov.bcb.pix...'}
                  </p>
                </div>

                <button
                  onClick={() => copyPix(pixData.qr_code || '')}
                  className="btn-titan w-full py-3 mb-3"
                >
                  <Copy className="w-4 h-4" /> Copiar Código PIX
                </button>

                <div className="flex items-center gap-2 justify-center text-yellow-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Código válido por 30 minutos</span>
                </div>

                <button
                  onClick={() => { setPixData(null); setDepositAmount('') }}
                  className="btn-ghost w-full mt-3"
                >
                  <RefreshCw className="w-4 h-4" /> Gerar novo PIX
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saque */}
        {tab === 'saque' && (
          <div className="max-w-lg mx-auto animate-slide-up">
            <div className="bg-titan-card rounded-2xl p-7">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-[#f5a623]" /> Solicitar Saque PIX
              </h2>

              {/* Saldo */}
              <div className="bg-[#f5a623]/5 border border-[#f5a623]/10 rounded-xl p-4 mb-5">
                <p className="text-sm text-gray-500">Saldo disponível para saque</p>
                <p className="text-2xl font-black text-[#f5a623]">{formatCurrency(profile.balance)}</p>
              </div>

              {/* Valor */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">Valor do Saque</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input
                    type="number"
                    className="input-titan pl-10"
                    placeholder="0,00"
                    min="20"
                    max={profile.balance}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-600">Mínimo: R$20,00</p>
                  <button
                    onClick={() => setWithdrawAmount(profile.balance.toString())}
                    className="text-xs text-[#f5a623] hover:underline"
                  >
                    Sacar tudo
                  </button>
                </div>
              </div>

              {/* Tipo de chave PIX */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Chave PIX</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'cpf', label: 'CPF' },
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Celular' },
                    { value: 'random', label: 'Aleatória' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPixKeyType(value)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                        pixKeyType === value
                          ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#f5a623]'
                          : 'border-[#2a2a3e] text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chave PIX */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Chave PIX</label>
                <input
                  type="text"
                  className="input-titan"
                  placeholder={
                    pixKeyType === 'cpf' ? '000.000.000-00' :
                    pixKeyType === 'email' ? 'seu@email.com' :
                    pixKeyType === 'phone' ? '(11) 99999-9999' :
                    'Chave aleatória'
                  }
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                />
              </div>

              {/* Aviso KYC */}
              {profile.kyc_status !== 'approved' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-400">Verificação pendente</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Para saques acima de R$500, é necessário verificar sua identidade.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                className="btn-titan w-full py-4 text-base"
                disabled={withdrawLoading || !withdrawAmount || !pixKey}
              >
                {withdrawLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Solicitar Saque</>
                )}
              </button>

              <div className="mt-4 space-y-2">
                {['Saque processado em até 24h', 'PIX transferido direto para sua conta', 'Sem taxas de saque'].map(info => (
                  <div key={info} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Histórico */}
        {tab === 'historico' && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Histórico de Transações</h2>
              <button onClick={loadTransactions} className="btn-ghost flex items-center gap-2 text-sm">
                <RefreshCw className={`w-4 h-4 ${loadingTx ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {loadingTx ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#f5a623] mx-auto" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-titan-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        ['deposit', 'win', 'bonus'].includes(tx.type) 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        {['deposit', 'win', 'bonus'].includes(tx.type) 
                          ? <ArrowDownCircle className="w-5 h-5 text-green-400" />
                          : <ArrowUpCircle className="w-5 h-5 text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{getTransactionLabel(tx.type)}</p>
                        <p className="text-xs text-gray-600">{formatDate(tx.created_at)}</p>
                        {tx.description && (
                          <p className="text-xs text-gray-600 mt-0.5">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        ['deposit', 'win', 'bonus'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {['deposit', 'win', 'bonus'].includes(tx.type) ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-xs ${getStatusColor(tx.status)}`}>
                        {getStatusLabel(tx.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma transação encontrada</p>
                <p className="text-sm text-gray-700 mt-1">Faça seu primeiro depósito para começar!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
