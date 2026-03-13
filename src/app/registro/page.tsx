'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateCPF, maskCPF } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Trophy, Eye, EyeOff, Loader2, Lock, Mail, User, Phone, Gift, Check } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  })

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
    const formatted = raw
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
    setForm(f => ({ ...f, cpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
    const formatted = raw
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
    setForm(f => ({ ...f, phone: formatted }))
  }

  const validateStep1 = () => {
    if (!form.username || form.username.length < 3) return toast.error('Nome de usuário deve ter ao menos 3 caracteres')
    if (!form.email || !form.email.includes('@')) return toast.error('Email inválido')
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) return toast.error('Telefone inválido')
    const cpfRaw = form.cpf.replace(/\D/g, '')
    if (!validateCPF(cpfRaw)) return toast.error('CPF inválido')
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return toast.error('Você precisa aceitar os termos de uso')
    if (form.password.length < 6) return toast.error('Senha deve ter ao menos 6 caracteres')
    if (form.password !== form.confirmPassword) return toast.error('Senhas não conferem')

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          phone: form.phone,
          cpf: form.cpf.replace(/\D/g, ''),
          referral_code: form.referralCode || undefined,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email já está cadastrado')
      } else {
        toast.error(error.message)
      }
    } else if (data.user) {
      // Atualiza perfil com dados extras
      await supabase.from('profiles').update({
        phone: form.phone,
        cpf: form.cpf.replace(/\D/g, ''),
      }).eq('id', data.user.id)

      toast.success('Conta criada com sucesso! Bem-vindo ao TitanBet! 🎉')
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-titan-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-titan-gold rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-extrabold text-titan-gold">TitanBet</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
          <p className="text-gray-500 mt-1">Ganhe 200% no seu primeiro depósito!</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-[#f5a623]' : 'bg-[#2a2a3e]'} transition-colors`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-[#f5a623]' : 'bg-[#2a2a3e]'} transition-colors`} />
        </div>

        {/* Card */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl">
          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Seus Dados</h2>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome de Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    className="input-titan pl-10"
                    placeholder="seu_username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="email"
                    className="input-titan pl-10"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Telefone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="tel"
                    className="input-titan pl-10"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">CPF</label>
                <input
                  type="text"
                  className="input-titan"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={handleCpfChange}
                />
                <p className="text-xs text-gray-600 mt-1">Necessário para verificação e saques</p>
              </div>

              {/* Código de indicação */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Código de Indicação <span className="text-gray-600">(opcional)</span>
                </label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    className="input-titan pl-10"
                    placeholder="Ex: TITAN2024"
                    value={form.referralCode}
                    onChange={e => setForm(f => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={validateStep1}
                className="btn-titan w-full py-3.5 text-base"
              >
                Continuar
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Crie sua Senha</h2>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-titan pl-10 pr-10"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-titan pl-10"
                    placeholder="Repita a senha"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Força da senha */}
              {form.password && (
                <div className="space-y-1">
                  {[
                    { label: 'Ao menos 6 caracteres', ok: form.password.length >= 6 },
                    { label: 'Letras e números', ok: /(?=.*[a-zA-Z])(?=.*\d)/.test(form.password) },
                    { label: 'As senhas coincidem', ok: form.password === form.confirmPassword && form.confirmPassword.length > 0 },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-[#2a2a3e]'}`}>
                        {ok && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-xs ${ok ? 'text-green-400' : 'text-gray-600'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Termos */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${agreed ? 'bg-[#f5a623] border-[#f5a623]' : 'border-[#2a2a3e] bg-[#0d0d1a]'}`}
                >
                  {agreed && <Check className="w-3 h-3 text-black" />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Tenho 18 anos ou mais e concordo com os{' '}
                  <Link href="/termos" className="text-[#f5a623] hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" className="text-[#f5a623] hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">
                  Voltar
                </button>
                <button type="submit" className="btn-titan flex-1 py-3" disabled={loading || !agreed}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : 'Criar Conta'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#2a2a3e]">
            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-[#f5a623] font-medium hover:underline">Fazer login</Link>
            </p>
          </div>
        </div>

        {/* Bônus badge */}
        <div className="mt-6 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-xl px-5 py-4 text-center">
          <p className="text-sm font-bold text-[#f5a623]">🎁 Bônus Exclusivo para Novos Jogadores</p>
          <p className="text-xs text-gray-500 mt-1">200% no 1º depósito + 50 giros grátis no Fortune Tiger</p>
        </div>
      </div>
    </div>
  )
}
