-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading accounts table
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL,
  account_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  daily_loss_limit DECIMAL(15, 2),
  weekly_loss_limit DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
  entry_price DECIMAL(15, 8) NOT NULL,
  exit_price DECIMAL(15, 8),
  stop_loss DECIMAL(15, 8) NOT NULL,
  take_profit DECIMAL(15, 8) NOT NULL,
  quantity DECIMAL(15, 8) NOT NULL,
  profit_loss DECIMAL(15, 2),
  notes TEXT,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade checklist items table
CREATE TABLE IF NOT EXISTS public.trade_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  label TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 0,
  section TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Trade journal entries table
CREATE TABLE IF NOT EXISTS public.trade_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  stop_loss DECIMAL(15, 8) NOT NULL,
  take_profit DECIMAL(15, 8) NOT NULL,
  profit_loss DECIMAL(15, 2),
  notes TEXT,
  checklist_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for finance tracker)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON public.trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON public.trades(opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id ON public.trade_checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.trade_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);

-- Enable Row Level Security (RLS) for user data isolation
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for trading_accounts
CREATE POLICY "Users can view their own trading accounts"
  ON public.trading_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading accounts"
  ON public.trading_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading accounts"
  ON public.trading_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading accounts"
  ON public.trading_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for trades
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for trade_checklist_items
CREATE POLICY "Users can view their own checklist items"
  ON public.trade_checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own checklist items"
  ON public.trade_checklist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items"
  ON public.trade_checklist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items"
  ON public.trade_checklist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for trade_journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON public.trade_journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON public.trade_journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.trade_journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.trade_journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);
