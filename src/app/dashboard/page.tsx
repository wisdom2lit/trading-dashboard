'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase, signOut } from '@/lib/supabase';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, totalProfit: 0 });

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
          .select('*') as any;

        if (accounts && accounts.length > 0) {
          setAccountBalance(accounts[0].account_balance);
        }

        // Fetch trades
        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('opened_at', { ascending: false })
          .limit(10) as any;

        if (tradesData) {
          setTrades(tradesData);
          
          // Calculate stats
          const wins = tradesData.filter((t: any) => t.profit_loss && t.profit_loss > 0).length;
          const losses = tradesData.filter((t: any) => t.profit_loss && t.profit_loss < 0).length;
          const totalProfit = tradesData.reduce((sum: number, t: any) => sum + (t.profit_loss || 0), 0);
          
          setStats({
            wins,
            losses,
            winRate: tradesData.length > 0 ? (wins / tradesData.length) * 100 : 0,
            totalProfit,
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Navigation */}
      <nav className="glass-card sticky top-0 z-50 m-4 mb-0 rounded-b-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-3xl font-bold text-gradient">
            Trading Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{email}</span>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pt-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'trades', label: 'Trades' },
            { id: 'checklist', label: 'Checklist' },
            { id: 'journal', label: 'Journal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-black'
                  : 'glass-card hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Account Balance', value: `$${accountBalance.toFixed(2)}`, color: 'from-green-500' },
                { label: 'Winning Trades', value: stats.wins, color: 'from-blue-500' },
                { label: 'Losing Trades', value: stats.losses, color: 'from-red-500' },
                { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: 'from-purple-500' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={item}
                  className={`glass-card p-6 bg-gradient-to-br ${stat.color} to-transparent`}
                >
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Trades */}
            <motion.div variants={item} className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Trades</h2>
              {trades.length > 0 ? (
                <div className="space-y-4">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <div>
                        <p className="font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-gray-400">{trade.direction}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(trade.profit_loss || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">{trade.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No trades yet</p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <motion.div variants={item} className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">All Trades</h2>
            <p className="text-gray-400">Trade management features coming soon</p>
          </motion.div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <motion.div variants={item} className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Trading Checklist</h2>
            <p className="text-gray-400">Advanced checklist system coming soon</p>
          </motion.div>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <motion.div variants={item} className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Trade Journal</h2>
            <p className="text-gray-400">Journal entries coming soon</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
