'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import {
  Trophy, Gamepad2, Gift, Wallet, User, LogOut, Menu, X,
  ChevronDown, Bell, Search, Zap, Shield, Star
} from 'lucide-react'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/cassino', label: 'Cassino', icon: Gamepad2 },
    { href: '/bonus', label: 'Promoções', icon: Gift },
    { href: '/vip', label: 'VIP', icon: Star },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-[#0a0a0f]'
      } border-b border-[#1e1e2e]`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-titan-gold rounded-lg flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-extrabold text-titan-gold tracking-tight hidden sm:block">
            TitanBet
          </span>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? 'bg-[#f5a623]/10 text-[#f5a623]'
                  : 'text-[#b0b0c8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user && profile ? (
            <>
              {/* Saldo — apenas md+ */}
              <div className="hidden md:flex items-center gap-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-3 py-2">
                <Wallet className="w-4 h-4 text-[#f5a623]" />
                <span className="text-sm font-bold text-white">
                  {formatCurrency(profile.balance)}
                </span>
              </div>

              {/* Depositar — apenas sm+ */}
              <Link href="/carteira?tab=deposito" className="hidden sm:block">
                <button className="btn-titan text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Depositar</span>
                  <span className="sm:hidden">+</span>
                </button>
              </Link>

              {/* Notificações — apenas md+ */}
              <button className="relative hidden md:flex w-9 h-9 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] items-center justify-center hover:bg-[#2a2a3e] transition-colors">
                <Bell className="w-4 h-4 text-[#b0b0c8]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f5a623] rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-[#2a2a3e] transition-colors"
                >
                  <div className="w-6 h-6 bg-titan-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-black">
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block max-w-[80px] truncate">
                    {profile.username}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-12 w-56 bg-[#1a1a28] border border-[#2a2a3e] rounded-xl shadow-2xl py-2 z-50 animate-slide-up"
                    onBlur={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-[#2a2a3e]">
                      <p className="text-sm font-bold text-white">{profile.username}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                      <p className="text-sm font-bold text-[#f5a623] mt-1">
                        {formatCurrency(profile.balance)}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#b0b0c8] hover:bg-white/5 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> Meu Perfil
                      </Link>
                      <Link href="/carteira" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#b0b0c8] hover:bg-white/5 hover:text-white transition-colors">
                        <Wallet className="w-4 h-4" /> Carteira
                      </Link>
                      <Link href="/historico" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#b0b0c8] hover:bg-white/5 hover:text-white transition-colors">
                        <Trophy className="w-4 h-4" /> Histórico
                      </Link>
                      {profile.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f5a623] hover:bg-white/5 transition-colors">
                          <Shield className="w-4 h-4" /> Painel Admin
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#2a2a3e] pt-1">
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-ghost text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">Entrar</button>
              </Link>
              <Link href="/registro">
                <button className="btn-titan text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                  <span className="hidden sm:inline">Criar Conta</span>
                  <span className="sm:hidden">Cadastrar</span>
                </button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center flex-shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e1e2e] bg-[#0d0d18] animate-slide-up">
          <div className="px-3 py-3 space-y-1">
            {/* Saldo mobile */}
            {user && profile && (
              <div className="flex items-center justify-between bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-3 mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#f5a623]" />
                  <span className="text-xs text-gray-400">Saldo</span>
                </div>
                <span className="text-sm font-bold text-white">{formatCurrency(profile.balance)}</span>
              </div>
            )}
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? 'bg-[#f5a623]/10 text-[#f5a623]'
                    : 'text-[#b0b0c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user && profile && (
              <>
                <div className="h-px bg-[#2a2a3e] my-2" />
                <Link href="/carteira?tab=deposito" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[#f5a623]/10 text-[#f5a623]">
                  <Zap className="w-4 h-4" /> Depositar ({formatCurrency(profile.balance)})
                </Link>
                <Link href="/perfil" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#b0b0c8] hover:bg-white/5 hover:text-white">
                  <User className="w-4 h-4" /> Meu Perfil
                </Link>
                <Link href="/carteira" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#b0b0c8] hover:bg-white/5 hover:text-white">
                  <Wallet className="w-4 h-4" /> Carteira
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay fecha menus */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  )
}
