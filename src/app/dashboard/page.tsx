'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

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

      const { data, error } = await supabase
        .from('trades')
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
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setTrades([data[0], ...trades]);
      }
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172E 0%, #1a1f3a 25%, #2d1b4e 50%, #1a1f3a 75%, #0F172E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0F172E 0%, #1a1f3a 25%, #2d1b4e 50%, #1a1f3a 75%, #0F172E 100%)',
      backgroundAttachment: 'fixed',
      padding: '20px',
      minHeight: '100vh',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(40,40,55,0.7)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(77, 182, 172, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 600, color: '#FFFFFF' }}>📊 Prop Trading Dashboard</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Real-time account monitoring & risk management</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>👤 {email || 'User'}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#E57373',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(229, 115, 115, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFAB91';
                  e.currentTarget.style.color = '#1C1C1C';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 171, 145, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#E57373';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(229, 115, 115, 0.3)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid - 2 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* LEFT COLUMN - Account Overview Card */}
          <div style={{
            background: 'rgba(40,40,55,0.7)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#FFFFFF' }}>Account Overview</h2>
            
            {/* Risk Alert */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: 600,
              border: '2px solid',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderColor: monthlyProfit >= 0 ? '#81C784' : '#E57373',
              color: monthlyProfit >= 0 ? '#81C784' : '#FFAB91',
              boxShadow: monthlyProfit >= 0 
                ? '0 0 20px rgba(129, 199, 132, 0.3)'
                : '0 0 20px rgba(229, 115, 115, 0.3)',
              animation: 'pulse 2s infinite',
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: monthlyProfit >= 0 ? '#81C784' : '#E57373',
                animation: 'pulse-dot 2s infinite',
              }} />
              <span>{monthlyProfit >= 0 ? '✓ All Clear - Trading Safe' : '⚠ Risk Alert - Drawdown'}</span>
            </div>

            {/* Account Items - 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(77, 182, 172, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Account Balance</label>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>${accountBalance.toFixed(2)}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(77, 182, 172, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Win Rate</label>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{stats.winRate.toFixed(1)}%</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(77, 182, 172, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Total Trades</label>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{trades.length}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(77, 182, 172, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Monthly P&L</label>
                <div style={{ fontSize: '20px', fontWeight: 700, color: monthlyProfit >= 0 ? '#81C784' : '#E57373' }}>${monthlyProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Monthly Summary */}
          <div style={{
            background: 'rgba(40,40,55,0.7)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(77, 182, 172, 0.2)',
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#FFFFFF' }}>Monthly Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(77, 182, 172, 0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 182, 172, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', fontWeight: 500 }}>Total Profit</label>
                <div style={{ fontSize: '24px', fontWeight: 700, color: monthlyProfit >= 0 ? '#81C784' : '#E57373' }}>${monthlyProfit.toFixed(2)}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(77, 182, 172, 0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 182, 172, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', fontWeight: 500 }}>Win Trades</label>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#81C784' }}>{stats.wins}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(77, 182, 172, 0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 182, 172, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', fontWeight: 500 }}>Loss Trades</label>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#E57373' }}>{stats.losses}</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(77, 182, 172, 0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(77, 182, 172, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', fontWeight: 500 }}>Total Trades</label>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{trades.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Calculator */}
        <div style={{
          background: 'rgba(40,40,55,0.7)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(77, 182, 172, 0.2)',
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#FFFFFF' }}>💰 Risk Calculator</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Account Size</label>
              <input
                type="number"
                value={accountBalance}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgba(77, 182, 172, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  opacity: '0.6',
                  fontWeight: 600,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Risk Per Trade</label>
              <input
                type="number"
                placeholder="500"
                defaultValue="500"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgba(77, 182, 172, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>Reward Multiple</label>
              <input
                type="number"
                placeholder="2"
                defaultValue="2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid rgba(77, 182, 172, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
        </div>

        {/* Add Trade Form */}
        <div style={{
          background: 'rgba(40,40,55,0.7)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(77, 182, 172, 0.2)',
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#FFFFFF' }}>📝 Add New Trade</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            <input
              type="text"
              placeholder="Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              style={{
                padding: '10px',
                border: '2px solid rgba(77, 182, 172, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4DB6AC';
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <select
              value={newDirection}
              onChange={(e) => setNewDirection(e.target.value)}
              style={{
                padding: '10px',
                border: '2px solid rgba(77, 182, 172, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4DB6AC';
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
              style={{
                padding: '10px',
                border: '2px solid rgba(77, 182, 172, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4DB6AC';
                e.currentTarget.style.background = 'rgba(77, 182, 172, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(77, 182, 172, 0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleAddTrade}
              style={{
                background: 'linear-gradient(135deg, #4DB6AC, #FFAB91)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 20px rgba(77, 182, 172, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(77, 182, 172, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(77, 182, 172, 0.4)';
              }}
            >
              ➕ Add Trade
            </button>
          </div>
        </div>

        {/* Trade Log Table */}
        <div style={{
          background: 'rgba(40,40,55,0.7)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(77, 182, 172, 0.2)',
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#FFFFFF' }}>📈 Trade Log ({trades.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Symbol</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Direction</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Entry Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>P&L</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', borderBottom: '2px solid rgba(77, 182, 172, 0.2)', background: 'rgba(255, 255, 255, 0.02)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? (
                  trades.map((trade) => (
                    <tr
                      key={trade.id}
                      style={{
                        transition: 'background 0.3s ease',
                        borderLeft: trade.profit_loss > 0 ? '4px solid #81C784' : trade.profit_loss < 0 ? '4px solid #E57373' : '4px solid rgba(255, 255, 255, 0.4)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(77, 182, 172, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>{trade.symbol}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', color: 'rgba(255, 255, 255, 0.9)' }}>
                        <span style={{
                          background: trade.direction === 'Long' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(229, 115, 115, 0.2)',
                          color: trade.direction === 'Long' ? '#64B5F6' : '#EF9A9A',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {trade.direction}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', color: 'rgba(255, 255, 255, 0.9)' }}>${trade.entry_price.toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', fontWeight: 'bold', color: trade.profit_loss > 0 ? '#81C784' : trade.profit_loss < 0 ? '#E57373' : 'rgba(255, 255, 255, 0.9)' }}>
                        ${trade.profit_loss?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', color: 'rgba(255, 255, 255, 0.9)' }}>
                        <span style={{
                          background: trade.status === 'open' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(128, 128, 128, 0.2)',
                          color: trade.status === 'open' ? '#64B5F6' : '#999999',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          {trade.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        {new Date(trade.opened_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(77, 182, 172, 0.1)' }}>
                        <button
                          onClick={() => handleDeleteTrade(trade.id)}
                          style={{
                            background: '#E57373',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 15px rgba(229, 115, 115, 0.3)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FFAB91';
                            e.currentTarget.style.color = '#1C1C1C';
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 171, 145, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#E57373';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(229, 115, 115, 0.3)';
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      No trades yet. Add your first trade above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes pulse-dot {
          0% {
            box-shadow: 0 0 0 0 rgba(129, 199, 132, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(129, 199, 132, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(129, 199, 132, 0);
          }
        }
      `}</style>
    </div>
  );
}
