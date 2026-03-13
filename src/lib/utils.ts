import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(clean[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(clean[10])
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export function getTransactionLabel(type: string): string {
  const map: Record<string, string> = {
    deposit: 'Depósito',
    withdrawal: 'Saque',
    bet: 'Aposta',
    win: 'Ganho',
    bonus: 'Bônus',
    refund: 'Reembolso',
  }
  return map[type] || type
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
    won: 'Ganhou',
    lost: 'Perdeu',
    cashout: 'Cash Out',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
    cancelled: 'text-gray-400',
    won: 'text-green-400',
    lost: 'text-red-400',
    active: 'text-green-400',
    expired: 'text-gray-400',
    used: 'text-blue-400',
  }
  return map[status] || 'text-gray-400'
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getVipLevelColor(level: number): string {
  const colors: Record<number, string> = {
    0: '#CD7F32',
    1: '#C0C0C0',
    2: '#FFD700',
    3: '#E5E4E2',
    4: '#B9F2FF',
    5: '#FF4500',
  }
  return colors[level] || '#CD7F32'
}

export function getVipLevelName(level: number): string {
  const names: Record<number, string> = {
    0: 'Bronze',
    1: 'Prata',
    2: 'Ouro',
    3: 'Platina',
    4: 'Diamante',
    5: 'Elite',
  }
  return names[level] || 'Bronze'
}
