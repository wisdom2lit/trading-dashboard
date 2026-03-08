'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

type Trade = {
  id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  entry_price: number;
  profit_loss: number;
  status: string;
  opened_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [accountBalance, setAccountBalance] = useState(5000);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, totalProfit: 0 });
  const [newSymbol, setNewSymbol] = useState('');
  const [newDirection, setNewDirection] = useState('Long');
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          router.push('/auth/login');
          return;
        }

        setEmail(user.email);

        // Fetch trading accounts
        const { data: accounts } = await supabase
          .from('trading_accounts')
          .select('*');

        if (accounts && accounts.length > 0) {
          setAccountBalance(accounts[0].account_balance);
        }

        // Fetch trades
        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('opened_at', { ascending: false });

        if (tradesData) {
          setTrades(tradesData);
          
          // Calculate stats
          const wins = tradesData.filter((t: Trade) => t.profit_loss && t.profit_loss > 0).length;
          const losses = tradesData.filter((t: Trade) => t.profit_loss && t.profit_loss < 0).length;
          const totalProfit = tradesData.reduce((sum: number, t: Trade) => sum + (t.profit_loss || 0), 0);
          
          setStats({
            wins,
            losses,
            winRate: tradesData.length > 0 ? (wins / tradesData.length) * 100 : 0,
            totalProfit,
          });
          setMonthlyProfit(totalProfit);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleAddTrade = async () => {
    if (!newSymbol || !newEntryPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = (await supabase
        .from('trades')
        // @ts-expect-error - Supabase type inference issue with dynamic Insert
        .insert([
          {
            user_id: user.id,
            symbol: newSymbol,
            direction: newDirection,
            entry_price: parseFloat(newEntryPrice),
            stop_loss: 0,
            take_profit: 0,
            quantity: 1,
            status: 'open',
          },
        ])
        .select());

      if (error) throw error;
      
      setTrades([data[0], ...trades]);
      setNewSymbol('');
      setNewEntryPrice('');
      toast.success('Trade added successfully');
    } catch (err) {
      console.error('Failed to add trade:', err);
      toast.error('Failed to add trade');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTrades(trades.filter((t) => t.id !== id));
      toast.success('Trade deleted');
    } catch (err) {
      console.error('Failed to delete trade:', err);
      toast.error('Failed to delete trade');
    }
  };

  const riskStatus = monthlyProfit >= 0 ? 'safe' : 'alert';
  const maxDailyLoss = 1000;
  const dailyDrawdown = Math.abs(monthlyProfit);
  const drawdownPercent = ((dailyDrawdown / maxDailyLoss) * 100).toFixed(1);
  const riskReward = stats.wins > 0 ? (accountBalance / stats.wins).toFixed(2) : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-white text-2xl font-bold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading Dashboard...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="glass-card mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Trading Dashboard</h1>
              <p className="text-gray-300 text-sm">Advanced Analytics & Portfolio Management</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">👤 {email}</span>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Account Overview Section */}
        <motion.div
          className="glass-card mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Account Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/8 p-4 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-all cursor-pointer">
              <p className="text-gray-300 text-xs font-medium mb-2">Account Balance</p>
              <p className="text-2xl font-bold text-white">${accountBalance.toFixed(2)}</p>
            </div>
            <div className="bg-white/8 p-4 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-all cursor-pointer">
              <p className="text-gray-300 text-xs font-medium mb-2">Monthly P&L</p>
              <p className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${monthlyProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/8 p-4 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-all cursor-pointer">
              <p className="text-gray-300 text-xs font-medium mb-2">Win Rate</p>
              <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>

        {/* Risk Alert */}
        <motion.div
          className={`glass-card mb-6 p-4 border-l-4 flex items-center gap-4 ${
            riskStatus === 'safe'
              ? 'border-l-green-400 bg-green-400/5'
              : 'border-l-red-400 bg-red-400/5'
          }`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className={`w-4 h-4 rounded-full flex-shrink-0 ${
              riskStatus === 'safe' ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
            }`}
          />
          <div>
            <p className={`font-bold ${riskStatus === 'safe' ? 'text-green-400' : 'text-red-400'}`}>
              {riskStatus === 'safe' ? '✓ Risk Status: Safe' : '⚠ Risk Status: Alert'}
            </p>
            <p className="text-gray-300 text-sm">
              Daily Drawdown: {drawdownPercent}% | Max Daily Loss: ${maxDailyLoss.toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          className="glass-card mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/8 p-4 rounded-lg text-center border border-cyan-500/20 hover:bg-cyan-500/10 transition-all">
              <p className="text-gray-300 text-xs font-medium mb-2">Total Profit</p>
              <p className={`text-xl font-bold ${monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${monthlyProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/8 p-4 rounded-lg text-center border border-cyan-500/20 hover:bg-cyan-500/10 transition-all">
              <p className="text-gray-300 text-xs font-medium mb-2">Win Trades</p>
              <p className="text-xl font-bold text-green-400">{stats.wins}</p>
            </div>
            <div className="bg-white/8 p-4 rounded-lg text-center border border-cyan-500/20 hover:bg-cyan-500/10 transition-all">
              <p className="text-gray-300 text-xs font-medium mb-2">Loss Trades</p>
              <p className="text-xl font-bold text-red-400">{stats.losses}</p>
            </div>
            <div className="bg-white/8 p-4 rounded-lg text-center border border-cyan-500/20 hover:bg-cyan-500/10 transition-all">
              <p className="text-gray-300 text-xs font-medium mb-2">Total Trades</p>
              <p className="text-xl font-bold text-white">{trades.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Risk Calculator */}
        <motion.div
          className="glass-card mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Risk Calculator</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-300 font-medium mb-2 block">Account Size</label>
              <input
                type="number"
                value={accountBalance}
                disabled
                className="w-full bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 font-medium mb-2 block">Risk Per Trade 💰</label>
              <input
                type="number"
                placeholder="500"
                defaultValue="500"
                className="w-full bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 font-medium mb-2 block">Reward Multiple 📈</label>
              <input
                type="number"
                placeholder="2"
                defaultValue="2"
                className="w-full bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 font-medium mb-2 block">Risk/Reward Ratio</label>
              <div className="bg-cyan-500/15 border border-cyan-500/30 rounded-lg px-3 py-2">
                <p className="text-cyan-400 font-bold text-lg">{riskReward}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Trade Section */}
        <motion.div
          className="glass-card mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">📊 Add New Trade</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mb-4">
            <input
              type="text"
              placeholder="Symbol (e.g., EURUSD)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
            />
            <select
              value={newDirection}
              onChange={(e) => setNewDirection(e.target.value)}
              className="bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option>Long</option>
              <option>Short</option>
            </select>
            <input
              type="number"
              placeholder="Entry Price"
              value={newEntryPrice}
              onChange={(e) => setNewEntryPrice(e.target.value)}
              step="0.01"
              className="bg-white/8 border border-cyan-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={handleAddTrade}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all col-span-2 md:col-span-1"
            >
              ➕ Add Trade
            </button>
          </div>
        </motion.div>

        {/* Trade Log Table */}
        <motion.div
          className="glass-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">📈 Trade Log ({trades.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-cyan-500/30">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Direction</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Entry Price</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">P&L</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? (
                  trades.slice(0, 20).map((trade) => (
                    <motion.tr
                      key={trade.id}
                      className={`border-b border-cyan-500/10 hover:bg-white/5 transition-colors ${
                        trade.profit_loss > 0
                          ? 'border-l-4 border-l-green-400'
                          : trade.profit_loss < 0
                          ? 'border-l-4 border-l-red-400'
                          : ''
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.direction === 'Long' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">${trade.entry_price.toFixed(2)}</td>
                      <td className={`py-3 px-4 font-bold ${
                        trade.profit_loss > 0 ? 'text-green-400' : 
                        trade.profit_loss < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        ${trade.profit_loss?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.status === 'open'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {new Date(trade.opened_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteTrade(trade.id)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded text-xs font-medium transition-all"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No trades yet. Add your first trade above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
