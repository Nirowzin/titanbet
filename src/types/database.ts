export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'moderator'
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund'
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'cashout'
export type BonusType = 'welcome' | 'deposit' | 'freespin' | 'cashback' | 'referral' | 'vip'
export type BonusStatus = 'active' | 'used' | 'expired' | 'cancelled'
export type GameCategory = 'slots' | 'table' | 'live' | 'crash' | 'original'
export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  balance: number
  bonus_balance: number
  total_deposited: number
  total_withdrawn: number
  total_wagered: number
  kyc_status: KycStatus
  cpf: string | null
  date_of_birth: string | null
  is_active: boolean
  is_verified: boolean
  referral_code: string | null
  referred_by: string | null
  vip_level: number
  vip_points: number
  two_factor_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  slug: string
  description: string | null
  category: GameCategory
  provider: string
  thumbnail_url: string | null
  banner_url: string | null
  rtp: number | null
  min_bet: number
  max_bet: number
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_hot: boolean
  tags: string[] | null
  play_count: number
  sort_order: number
  demo_available: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: string
  status: TransactionStatus
  reference: string | null
  provider: string | null
  provider_id: string | null
  description: string | null
  metadata: Json
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface Bet {
  id: string
  user_id: string
  game_id: string | null
  amount: number
  win_amount: number
  multiplier: number
  status: BetStatus
  game_result: Json
  is_bonus_bet: boolean
  session_id: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
  game?: Game
}

export interface Bonus {
  id: string
  user_id: string
  type: BonusType
  name: string
  amount: number
  free_spins: number
  status: BonusStatus
  wagering_requirement: number
  wagering_completed: number
  wagering_total: number
  min_deposit: number | null
  valid_until: string | null
  used_at: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  title: string
  description: string | null
  short_description: string | null
  banner_url: string | null
  thumbnail_url: string | null
  type: BonusType
  bonus_amount: number | null
  bonus_percentage: number | null
  max_bonus: number | null
  min_deposit: number | null
  wagering_requirement: number
  free_spins: number
  is_active: boolean
  is_featured: boolean
  valid_from: string
  valid_until: string | null
  terms: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface VipLevel {
  id: number
  level: number
  name: string
  min_points: number
  cashback_percentage: number
  withdrawal_limit: number
  badge_color: string
  icon: string | null
  benefits: Json
  created_at: string
}

export interface PixKey {
  id: string
  user_id: string
  key_type: string
  key_value: string
  is_primary: boolean
  is_verified: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  type: string
  icon: string | null
  is_read: boolean
  action_url: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; username: string }
        Update: Partial<Profile>
      }
      games: {
        Row: Game
        Insert: Partial<Game> & { name: string; slug: string; category: GameCategory; provider: string }
        Update: Partial<Game>
      }
      transactions: {
        Row: Transaction
        Insert: Partial<Transaction> & { user_id: string; type: TransactionType; amount: number }
        Update: Partial<Transaction>
      }
      bets: {
        Row: Bet
        Insert: Partial<Bet> & { user_id: string; amount: number }
        Update: Partial<Bet>
      }
      bonuses: {
        Row: Bonus
        Insert: Partial<Bonus> & { user_id: string; type: BonusType; name: string }
        Update: Partial<Bonus>
      }
      promotions: {
        Row: Promotion
        Insert: Partial<Promotion> & { title: string; type: BonusType }
        Update: Partial<Promotion>
      }
      vip_levels: {
        Row: VipLevel
        Insert: Partial<VipLevel> & { level: number; name: string; min_points: number }
        Update: Partial<VipLevel>
      }
      pix_keys: {
        Row: PixKey
        Insert: Partial<PixKey> & { user_id: string; key_type: string; key_value: string }
        Update: Partial<PixKey>
      }
      notifications: {
        Row: Notification
        Insert: Partial<Notification> & { title: string; message: string }
        Update: Partial<Notification>
      }
    }
  }
}
