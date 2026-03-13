'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Trophy, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Preencha todos os campos')

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Email ou senha incorretos')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Login realizado com sucesso!')
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
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta!</h1>
          <p className="text-gray-500 mt-1">Faça login para continuar jogando</p>
        </div>

        {/* Card */}
        <div className="bg-[#12121e] border border-[#2a2a3e] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  className="input-titan pl-10"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Senha</label>
                <Link href="/recuperar-senha" className="text-xs text-[#f5a623] hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-titan pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-titan w-full py-3.5 text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
              ) : (
                'Entrar na Conta'
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2a2a3e]" />
            <span className="text-xs text-gray-600">ou</span>
            <div className="flex-1 h-px bg-[#2a2a3e]" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Não tem uma conta?{' '}
            <Link href="/registro" className="text-[#f5a623] font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Promoção */}
        <div className="mt-6 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-xl px-5 py-4 text-center">
          <p className="text-sm text-gray-400">
            🎰 Novo por aqui? Ganhe{' '}
            <strong className="text-[#f5a623]">200% de bônus</strong>{' '}
            no primeiro depósito!
          </p>
          <Link href="/registro" className="text-xs text-[#f5a623] hover:underline mt-1 block">
            Cadastre-se e resgate →
          </Link>
        </div>
      </div>
    </div>
  )
}
