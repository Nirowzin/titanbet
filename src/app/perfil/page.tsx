'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, maskCPF, getVipLevelName, getVipLevelColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  User, Shield, Star, Copy, Bell, Lock, Camera,
  CheckCircle, AlertCircle, Loader2, Edit2, Save, X
} from 'lucide-react'

type Tab = 'dados' | 'seguranca' | 'kyc' | 'notificacoes'

export default function PerfilPage() {
  const { profile, user, refreshProfile } = useAuth()
  const [tab, setTab] = useState<Tab>('dados')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    username: '',
  })

  const startEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      username: profile?.username || '',
    })
    setEditing(true)
  }

  const saveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        username: formData.username,
      })
      .eq('id', user!.id)

    if (error) {
      toast.error('Erro ao salvar perfil')
    } else {
      toast.success('Perfil atualizado!')
      await refreshProfile()
      setEditing(false)
    }
    setSaving(false)
  }

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)

  const changePassword = async () => {
    if (newPwd !== confirmPwd) return toast.error('Senhas não coincidem')
    if (newPwd.length < 8) return toast.error('Senha mínima de 8 caracteres')
    setChangingPwd(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) toast.error('Erro ao alterar senha')
    else {
      toast.success('Senha alterada com sucesso!')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    }
    setChangingPwd(false)
  }

  const copyReferral = () => {
    const code = profile?.referral_code || ''
    navigator.clipboard.writeText(`${window.location.origin}/registro?ref=${code}`)
    toast.success('Link de indicação copiado!')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f5a623]" />
      </div>
    )
  }

  const vipProgress = ((profile.vip_points % 1000) / 1000) * 100

  return (
    <div className="min-h-screen">
      {/* Header perfil */}
      <div className="bg-gradient-to-r from-[#001a0a] via-[#0d0d1a] to-[#001a2e] border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f5a623] to-[#e08000] flex items-center justify-center text-black text-2xl font-black flex-shrink-0">
                {profile.username?.[0]?.toUpperCase() || profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#12121e] border border-[#2a2a3e] rounded-lg flex items-center justify-center hover:border-[#f5a623]/50 transition-colors">
                <Camera className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{profile.full_name || profile.username}</h1>
              <p className="text-gray-500 text-sm">@{profile.username}</p>

              <div className="flex items-center gap-4 mt-3">
                {/* VIP badge */}
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getVipLevelColor(profile.vip_level)}`}>
                  ⭐ {getVipLevelName(profile.vip_level)}
                </span>

                {/* KYC */}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  profile.kyc_status === 'approved'
                    ? 'bg-green-500/20 text-green-400'
                    : profile.kyc_status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {profile.kyc_status === 'approved' ? 'Verificado' : profile.kyc_status === 'pending' ? 'Em análise' : 'Não verificado'}
                </span>
              </div>

              {/* VIP progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{profile.vip_points.toLocaleString('pt-BR')} pontos</span>
                  <span>Próximo nível: {1000 - (profile.vip_points % 1000)} pts</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#f5a623] to-[#ffd700] transition-all"
                    style={{ width: `${vipProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-xl font-black text-[#f5a623]">{formatCurrency(profile.balance)}</p>
              <p className="text-xs text-gray-600">Saldo atual</p>
              <p className="text-sm font-bold text-white mt-2">{formatCurrency(profile.total_won || 0)}</p>
              <p className="text-xs text-gray-600">Total ganho</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121e] border border-[#2a2a3e] rounded-xl p-1 mb-8 overflow-x-auto">
          {([
            { id: 'dados', label: 'Dados Pessoais', icon: User },
            { id: 'seguranca', label: 'Segurança', icon: Lock },
            { id: 'kyc', label: 'Verificação', icon: Shield },
            { id: 'notificacoes', label: 'Notificações', icon: Bell },
          ] as { id: Tab; label: string; icon: typeof User }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === id ? 'bg-[#f5a623] text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Dados Pessoais */}
        {tab === 'dados' && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-titan-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Informações Pessoais</h2>
                {!editing ? (
                  <button onClick={startEdit} className="btn-ghost flex items-center gap-2 text-sm">
                    <Edit2 className="w-4 h-4" /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="btn-ghost flex items-center gap-2 text-sm">
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button onClick={saveProfile} className="btn-titan flex items-center gap-2 text-sm py-2 px-4" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nome Completo', key: 'full_name', value: profile.full_name, type: 'text' },
                  { label: 'Nome de Usuário', key: 'username', value: profile.username, type: 'text' },
                  { label: 'Telefone', key: 'phone', value: profile.phone, type: 'text' },
                ].map(({ label, key, value, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>
                    {editing ? (
                      <input
                        type={type}
                        className="input-titan"
                        value={(formData as any)[key]}
                        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      />
                    ) : (
                      <p className="text-white bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3">
                        {value || <span className="text-gray-600">Não informado</span>}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Email</label>
                  <p className="text-white bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 opacity-50 cursor-not-allowed">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">CPF</label>
                  <p className="text-white bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3 opacity-50 cursor-not-allowed">
                    {profile.cpf ? maskCPF(profile.cpf) : <span className="text-gray-600">Não informado</span>}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-600">Membro desde {formatDate(profile.created_at)}</p>
              </div>
            </div>

            {/* Indicação */}
            <div className="bg-titan-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Programa de Indicações</h2>
              <p className="text-sm text-gray-500 mb-4">
                Compartilhe seu link e ganhe <strong className="text-[#f5a623]">R$20,00</strong> para cada amigo que se cadastrar e depositar!
              </p>

              <div className="flex gap-3">
                <div className="flex-1 bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-600 mb-1">Código de indicação</p>
                  <p className="text-white font-mono font-bold">{profile.referral_code || 'GERE_SEU_CODIGO'}</p>
                </div>
                <button onClick={copyReferral} className="btn-titan px-4">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-700 mt-3">
                Indicações realizadas: <strong className="text-white">{profile.total_referrals || 0}</strong>
              </p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Depositado', value: formatCurrency(profile.total_deposited || 0) },
                { label: 'Total Ganho', value: formatCurrency(profile.total_won || 0) },
                { label: 'Total Apostado', value: formatCurrency(profile.total_wagered || 0) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-titan-card rounded-2xl p-5 text-center">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segurança */}
        {tab === 'seguranca' && (
          <div className="max-w-lg animate-slide-up">
            <div className="bg-titan-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Alterar Senha</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    className="input-titan"
                    placeholder="Mínimo 8 caracteres"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="input-titan"
                    placeholder="Repita a nova senha"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={changePassword}
                className="btn-titan w-full mt-5 py-3"
                disabled={changingPwd || !newPwd || !confirmPwd}
              >
                {changingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Alterar Senha
              </button>
            </div>
          </div>
        )}

        {/* KYC */}
        {tab === 'kyc' && (
          <div className="animate-slide-up">
            <div className="bg-titan-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-[#f5a623]" />
                <div>
                  <h2 className="text-lg font-bold text-white">Verificação de Identidade (KYC)</h2>
                  <p className="text-sm text-gray-500">Necessário para saques acima de R$500</p>
                </div>
              </div>

              {profile.kyc_status === 'approved' ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Conta Verificada!</h3>
                  <p className="text-gray-500">Sua identidade foi verificada com sucesso.</p>
                </div>
              ) : profile.kyc_status === 'pending' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Em Análise</h3>
                  <p className="text-gray-500">Seus documentos estão sendo analisados. Prazo: 24-48h.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">
                      Para verificar sua conta, envie um documento de identidade válido (RG, CNH ou Passaporte).
                    </p>
                  </div>

                  {['Documento de identidade (frente)', 'Documento de identidade (verso)', 'Selfie segurando o documento'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl p-4">
                      <div>
                        <p className="text-sm font-medium text-white">{doc}</p>
                        <p className="text-xs text-gray-600">JPG, PNG ou PDF - Max 5MB</p>
                      </div>
                      <label className="btn-outline cursor-pointer text-sm py-2 px-4">
                        <input type="file" className="hidden" accept="image/*,.pdf" />
                        Enviar
                      </label>
                    </div>
                  ))}

                  <button className="btn-titan w-full py-3">
                    <Shield className="w-4 h-4" /> Enviar para Análise
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificações */}
        {tab === 'notificacoes' && (
          <div className="animate-slide-up">
            <div className="bg-titan-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Preferências de Notificação</h2>

              <div className="space-y-4">
                {[
                  { label: 'Bônus e promoções', desc: 'Ofertas exclusivas e novos bônus', default: true },
                  { label: 'Depósitos e saques', desc: 'Confirmações de transações financeiras', default: true },
                  { label: 'Apostas e jogos', desc: 'Resultados de apostas e sessões', default: false },
                  { label: 'VIP e pontos', desc: 'Progresso de nível VIP', default: true },
                  { label: 'Novos jogos', desc: 'Lançamentos e adições ao catálogo', default: false },
                ].map(({ label, desc, default: defaultValue }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-[#0d0d1a] border border-[#2a2a3e] rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${defaultValue ? 'bg-[#f5a623]' : 'bg-[#2a2a3e]'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow ${defaultValue ? 'translate-x-6.5 ml-1' : 'ml-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
