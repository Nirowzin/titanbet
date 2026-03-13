-- ============================================================
-- TitanBet - Schema Supabase
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'cancelled', 'cashout');
CREATE TYPE bonus_type AS ENUM ('welcome', 'deposit', 'freespin', 'cashback', 'referral', 'vip');
CREATE TYPE bonus_status AS ENUM ('active', 'used', 'expired', 'cancelled');
CREATE TYPE game_category AS ENUM ('slots', 'table', 'live', 'crash', 'original');
CREATE TYPE kyc_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- ============================================================
-- PROFILES (extensão da tabela auth.users do Supabase)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  bonus_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_deposited NUMERIC(15, 2) DEFAULT 0.00,
  total_withdrawn NUMERIC(15, 2) DEFAULT 0.00,
  total_wagered NUMERIC(15, 2) DEFAULT 0.00,
  kyc_status kyc_status DEFAULT 'pending',
  cpf TEXT,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  referred_by UUID REFERENCES public.profiles(id),
  vip_level INTEGER DEFAULT 0,
  vip_points INTEGER DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAMES (Jogos/Slots)
-- ============================================================
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category game_category NOT NULL DEFAULT 'slots',
  provider TEXT NOT NULL,
  thumbnail_url TEXT,
  banner_url TEXT,
  rtp NUMERIC(5,2), -- Return to Player %
  min_bet NUMERIC(10,2) DEFAULT 0.10,
  max_bet NUMERIC(10,2) DEFAULT 500.00,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  play_count BIGINT DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  demo_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status transaction_status DEFAULT 'pending',
  reference TEXT UNIQUE, -- referência externa (pix txid, etc.)
  provider TEXT, -- 'mercadopago', 'internal'
  provider_id TEXT, -- ID do provedor de pagamento
  description TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BETS (Apostas)
-- ============================================================
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id),
  amount NUMERIC(15,2) NOT NULL,
  win_amount NUMERIC(15,2) DEFAULT 0.00,
  multiplier NUMERIC(10,4) DEFAULT 1.0,
  status bet_status DEFAULT 'pending',
  game_result JSONB DEFAULT '{}',
  is_bonus_bet BOOLEAN DEFAULT FALSE,
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BONUSES
-- ============================================================
CREATE TABLE public.bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type bonus_type NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(15,2) DEFAULT 0.00,
  free_spins INTEGER DEFAULT 0,
  status bonus_status DEFAULT 'active',
  wagering_requirement NUMERIC(10,2) DEFAULT 30.0, -- multiplicador
  wagering_completed NUMERIC(15,2) DEFAULT 0.00,
  wagering_total NUMERIC(15,2) DEFAULT 0.00,
  min_deposit NUMERIC(10,2),
  valid_until TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROMOTIONS (Promoções visíveis no site)
-- ============================================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  banner_url TEXT,
  thumbnail_url TEXT,
  type bonus_type NOT NULL,
  bonus_amount NUMERIC(15,2),
  bonus_percentage INTEGER,
  max_bonus NUMERIC(15,2),
  min_deposit NUMERIC(10,2),
  wagering_requirement NUMERIC(5,2) DEFAULT 30,
  free_spins INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  terms TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIP LEVELS
-- ============================================================
CREATE TABLE public.vip_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  cashback_percentage NUMERIC(5,2) DEFAULT 0,
  withdrawal_limit NUMERIC(15,2) DEFAULT 5000,
  badge_color TEXT DEFAULT '#gray',
  icon TEXT,
  benefits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PIX KEYS (Chaves PIX cadastradas pelos usuários)
-- ============================================================
CREATE TABLE public.pix_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL, -- 'cpf', 'email', 'phone', 'random'
  key_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = broadcast
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error', 'promo'
  icon TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GAME SESSIONS
-- ============================================================
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_bets NUMERIC(15,2) DEFAULT 0,
  total_wins NUMERIC(15,2) DEFAULT 0,
  rounds_played INTEGER DEFAULT 0
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_game_id ON public.bets(game_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_bets_created_at ON public.bets(created_at DESC);
CREATE INDEX idx_bonuses_user_id ON public.bonuses(user_id);
CREATE INDEX idx_bonuses_status ON public.bonuses(status);
CREATE INDEX idx_games_category ON public.games(category);
CREATE INDEX idx_games_slug ON public.games(slug);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_bets_updated_at BEFORE UPDATE ON public.bets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_bonuses_updated_at BEFORE UPDATE ON public.bonuses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: cria perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTR(NEW.id::TEXT, 1, 4)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função: atualiza saldo do usuário
CREATE OR REPLACE FUNCTION public.update_user_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT -- 'add' ou 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT balance INTO current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  
  IF p_type = 'subtract' AND current_balance < p_amount THEN
    RETURN FALSE; -- Saldo insuficiente
  END IF;
  
  IF p_type = 'add' THEN
    UPDATE public.profiles SET balance = balance + p_amount WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles SET balance = balance - p_amount WHERE id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Usuário vê seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário edita seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin vê todos os perfis" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Transactions
CREATE POLICY "Usuário vê suas transações" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sistema insere transações" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin gerencia transações" ON public.transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bets
CREATE POLICY "Usuário vê suas apostas" ON public.bets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário cria apostas" ON public.bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bonuses
CREATE POLICY "Usuário vê seus bônus" ON public.bonuses
  FOR SELECT USING (auth.uid() = user_id);

-- PIX Keys
CREATE POLICY "Usuário gerencia suas chaves PIX" ON public.pix_keys
  FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Usuário vê suas notificações" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Usuário marca como lida" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Games (públicos para leitura)
CREATE POLICY "Games são públicos" ON public.games
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin gerencia games" ON public.games
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Promotions (públicas)
CREATE POLICY "Promoções são públicas" ON public.promotions
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin gerencia promoções" ON public.promotions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- VIP Levels (públicos)
CREATE POLICY "VIP levels são públicos" ON public.vip_levels
  FOR SELECT USING (TRUE);

-- Site Settings
CREATE POLICY "Settings são públicas para leitura" ON public.site_settings
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin gerencia settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- VIP Levels
INSERT INTO public.vip_levels (level, name, min_points, cashback_percentage, withdrawal_limit, badge_color, benefits) VALUES
(0, 'Bronze', 0, 0, 5000, '#CD7F32', '["Acesso a promoções básicas", "Suporte por email"]'),
(1, 'Prata', 1000, 1, 10000, '#C0C0C0', '["Cashback 1%", "Suporte prioritário", "Bônus mensais"]'),
(2, 'Ouro', 5000, 2, 25000, '#FFD700', '["Cashback 2%", "Gerente de conta", "Torneios exclusivos"]'),
(3, 'Platina', 15000, 3, 50000, '#E5E4E2', '["Cashback 3%", "Saques expressos", "Presentes VIP"]'),
(4, 'Diamante', 50000, 5, 100000, '#B9F2FF', '["Cashback 5%", "Saques instantâneos", "Eventos exclusivos", "Brindes especiais"]'),
(5, 'Elite', 200000, 8, 500000, '#FF4500', '["Cashback 8%", "Serviço 24/7 dedicado", "Convites para eventos", "Benefícios personalizados"]');

-- Jogos de Demonstração
INSERT INTO public.games (name, slug, description, category, provider, rtp, thumbnail_url, is_active, is_featured, is_new, is_hot, tags, sort_order) VALUES
('Fortune Tiger', 'fortune-tiger', 'O famoso jogo do tigrinho - alta volatilidade e grandes multiplicadores', 'slots', 'PG Soft', 96.80, '/games/fortune-tiger.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['popular','tiger','pgsoft'], 1),
('Fortune Ox', 'fortune-ox', 'Gire os rolos e encontre o boi da fortuna com prêmios incríveis', 'slots', 'PG Soft', 96.74, '/games/fortune-ox.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['popular','ox','pgsoft'], 2),
('Fortune Mouse', 'fortune-mouse', 'O rato da sorte te aguarda com multiplicadores de até 8000x', 'slots', 'PG Soft', 96.73, '/games/fortune-mouse.jpg', TRUE, FALSE, TRUE, FALSE, ARRAY['mouse','pgsoft'], 3),
('Spaceman', 'spaceman', 'Crash game espacial - cash out antes que o foguete exploda!', 'crash', 'Pragmatic Play', 97.00, '/games/spaceman.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['crash','space','pragmatic'], 4),
('Gates of Olympus', 'gates-of-olympus', 'Os deuses do Olimpo oferecem multiplicadores até 5000x', 'slots', 'Pragmatic Play', 96.50, '/games/gates-of-olympus.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['olympus','popular','pragmatic'], 5),
('Sweet Bonanza', 'sweet-bonanza', 'Doces e frutas em uma explosão de ganhos com multiplicadores', 'slots', 'Pragmatic Play', 96.48, '/games/sweet-bonanza.jpg', TRUE, FALSE, FALSE, TRUE, ARRAY['sweet','candy','pragmatic'], 6),
('Big Bass Bonanza', 'big-bass-bonanza', 'Pesque grandes peixes e grandes prêmios neste slot emocionante', 'slots', 'Pragmatic Play', 96.71, '/games/big-bass.jpg', TRUE, FALSE, FALSE, FALSE, ARRAY['fish','pragmatic'], 7),
('Aviator', 'aviator', 'O clássico jogo do avião - dobre seu dinheiro ou perca tudo', 'crash', 'Spribe', 97.00, '/games/aviator.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['crash','aviator','spribe'], 8),
('Double Ball Roulette', 'double-ball-roulette', 'Roleta europeia com duas bolas para o dobro de emoção', 'table', 'Evolution', 97.30, '/games/roulette.jpg', TRUE, FALSE, FALSE, FALSE, ARRAY['roulette','table','evolution'], 9),
('Lightning Blackjack', 'lightning-blackjack', 'Blackjack ao vivo com multiplicadores relâmpago aleatórios', 'live', 'Evolution', 99.50, '/games/blackjack.jpg', TRUE, FALSE, TRUE, FALSE, ARRAY['blackjack','live','evolution'], 10),
('Crazy Time', 'crazy-time', 'Roda da fortuna com 4 jogos bônus emocionantes ao vivo', 'live', 'Evolution', 96.08, '/games/crazy-time.jpg', TRUE, TRUE, FALSE, TRUE, ARRAY['live','crazy','evolution'], 11),
('Fortune Rabbit', 'fortune-rabbit', 'O coelho da sorte distribui fortuna com multiplicadores explosivos', 'slots', 'PG Soft', 96.72, '/games/fortune-rabbit.jpg', TRUE, FALSE, TRUE, FALSE, ARRAY['rabbit','pgsoft'], 12),
('Mines', 'mines', 'Desvie das minas e colete gemas - quanto mais longe, maior o prêmio', 'original', 'TitanBet', 97.00, '/games/mines.jpg', TRUE, FALSE, FALSE, TRUE, ARRAY['mines','original','titanbet'], 13),
('Plinko', 'plinko', 'Deixe a bolinha cair e ganhe multiplicadores incríveis', 'original', 'TitanBet', 97.00, '/games/plinko.jpg', TRUE, FALSE, FALSE, FALSE, ARRAY['plinko','original','titanbet'], 14);

-- Promoções
INSERT INTO public.promotions (title, description, short_description, type, bonus_percentage, max_bonus, min_deposit, wagering_requirement, free_spins, is_active, is_featured, sort_order, terms) VALUES
(
  'Bônus de Boas-Vindas 200%',
  'Bem-vindo ao TitanBet! Faça seu primeiro depósito e ganhe 200% de bônus até R$500. É a melhor forma de começar sua jornada de apostas com muito mais saldo.',
  'Ganhe 200% no seu primeiro depósito até R$500',
  'welcome',
  200,
  500.00,
  20.00,
  30,
  50,
  TRUE,
  TRUE,
  1,
  'Válido apenas para novos usuários. Rollover de 30x o valor do bônus. Mínimo de depósito R$20.'
),
(
  'Recarga Semanal 50%',
  'Toda semana você ganha 50% de bônus no seu depósito até R$200. Aproveite para aumentar seu saldo e jogar mais nos seus jogos favoritos.',
  '50% de bônus toda semana até R$200',
  'deposit',
  50,
  200.00,
  30.00,
  25,
  0,
  TRUE,
  TRUE,
  2,
  'Disponível toda segunda-feira. Válido para usuários com ao menos 7 dias de cadastro.'
),
(
  'Cashback VIP até 8%',
  'Quanto mais você joga, mais você recebe de volta. Jogadores VIP recebem até 8% de cashback semanal sobre suas perdas líquidas.',
  'Receba de volta até 8% das suas perdas semanais',
  'cashback',
  8,
  NULL,
  NULL,
  1,
  0,
  TRUE,
  FALSE,
  3,
  'Cashback calculado toda segunda-feira baseado nas perdas líquidas da semana anterior.'
),
(
  '100 Giros Grátis - Fortune Tiger',
  'Faça um depósito de R$50 e ganhe 100 giros grátis no Fortune Tiger. O jogo mais popular do Brasil agora com giros sem custo!',
  'Deposite R$50 e ganhe 100 giros grátis',
  'freespin',
  0,
  NULL,
  50.00,
  20,
  100,
  TRUE,
  FALSE,
  4,
  'Giros válidos apenas no Fortune Tiger. Ganhos dos giros têm rollover de 20x.'
);

-- Configurações do site
INSERT INTO public.site_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Modo manutenção ativo/inativo'),
('min_deposit', '10', 'Depósito mínimo em R$'),
('max_deposit', '50000', 'Depósito máximo por transação em R$'),
('min_withdrawal', '20', 'Saque mínimo em R$'),
('max_withdrawal', '10000', 'Saque máximo por dia em R$'),
('withdrawal_processing_hours', '24', 'Horas para processar saques'),
('welcome_bonus_active', 'true', 'Bônus de boas-vindas ativo'),
('site_name', '"TitanBet"', 'Nome do site'),
('support_email', '"suporte@titanbet.com"', 'Email de suporte'),
('support_whatsapp', '"551199999999"', 'WhatsApp de suporte');
