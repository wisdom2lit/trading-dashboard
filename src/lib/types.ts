// User profiles
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Trading accounts
export interface TradingAccount {
  id: string;
  user_id: string;
  broker_name: string;
  account_balance: number;
  initial_balance: number;
  daily_loss_limit: number;
  weekly_loss_limit: number;
  created_at: string;
  updated_at: string;
}

// Trades
export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  entry_price: number;
  exit_price: number | null;
  stop_loss: number;
  take_profit: number;
  quantity: number;
  profit_loss: number | null;
  notes: string;
  opened_at: string;
  closed_at: string | null;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

// Trade Checklist items
export interface TradeChecklistItem {
  id: string;
  user_id: string;
  item_id: string;
  label: string;
  weight: number;
  section: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

// Trade Journal entries
export interface TradeJournalEntry {
  id: string;
  user_id: string;
  trade_id: string;
  symbol: string;
  direction: string;
  entry_time: string;
  exit_time: string | null;
  stop_loss: number;
  take_profit: number;
  profit_loss: number | null;
  notes: string;
  checklist_score: number;
  created_at: string;
  updated_at: string;
}

// Transactions (for finance tracker)
export interface Transaction {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Statistics/Dashboard data
export interface DashboardStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit_loss: number;
  average_profit_trade: number;
  average_loss_trade: number;
  largest_win: number;
  largest_loss: number;
}
