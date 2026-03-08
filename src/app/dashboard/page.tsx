'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Trade = {
  id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  date: string;
  profit?: number;
  notes?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [profitFactor, setProfitFactor] = useState(0);
  const [stats, setStats] = useState({
    winTrades: 0,
    lossTrades: 0,
    largestWin: 0,
    largestLoss: 0,
    bestStreak: 0,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const journal = localStorage.getItem('juneJournal');
    if (journal) {
      try {
        const parsed = JSON.parse(journal) || [];
        setTrades(parsed);
        calculateStats(parsed);
      } catch (e) {
        console.error('Failed to load trades');
      }
    }
  }, []);

  const calculateStats = (tradesList: Trade[]) => {
    if (tradesList.length === 0) {
      setTotalProfit(0);
      setWinRate(0);
      setProfitFactor(0);
      setStats({
        winTrades: 0,
        lossTrades: 0,
        largestWin: 0,
        largestLoss: 0,
        bestStreak: 0,
      });
      return;
    }

    const tradesWithProfit = tradesList.filter((t) => t.profit !== undefined);
    const totalProf = tradesWithProfit.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winTr = tradesWithProfit.filter((t) => t.profit && t.profit > 0).length;
    const lossTr = tradesWithProfit.filter((t) => t.profit && t.profit < 0).length;
    const totalWins = tradesWithProfit
      .filter((t) => t.profit && t.profit > 0)
      .reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLosses = Math.abs(
      tradesWithProfit
        .filter((t) => t.profit && t.profit < 0)
        .reduce((sum, t) => sum + (t.profit || 0), 0)
    );

    setTotalProfit(totalProf);
    setWinRate(tradesWithProfit.length > 0 ? (winTr / tradesWithProfit.length) * 100 : 0);
    setProfitFactor(totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0);

    // Best streak
    let bestStreak = 0;
    let currentStreak = 0;
    tradesWithProfit.forEach((t) => {
      if (t.profit && t.profit > 0) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    setStats({
      winTrades: winTr,
      lossTrades: lossTr,
      largestWin: tradesWithProfit.length > 0
        ? Math.max(...tradesWithProfit.filter((t) => t.profit && t.profit > 0).map((t) => t.profit || 0), 0)
        : 0,
      largestLoss: tradesWithProfit.length > 0
        ? Math.min(...tradesWithProfit.filter((t) => t.profit && t.profit < 0).map((t) => t.profit || 0), 0)
        : 0,
      bestStreak,
    });
  };

  const getDayColor = (day: number): { bg: string; borderColor: string } => {
    const dayTrades = trades.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth.getMonth() &&
        tDate.getFullYear() === currentMonth.getFullYear() &&
        tDate.getDate() === day
      );
    });

    if (dayTrades.length === 0) {
      return { bg: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.03)' };
    }

    const dayProfit = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    if (dayProfit > 0) {
      return { bg: 'rgba(0,255,0,0.10)', borderColor: '#16a34a' };
    } else if (dayProfit < 0) {
      return { bg: 'rgba(255,0,128,0.10)', borderColor: '#ef4444' };
    }
    return { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' };
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#16a34a',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            &lt;
          </button>
          <div style={{ fontWeight: '900', color: '#16a34a', letterSpacing: '0.2px', minWidth: '150px', textAlign: 'center' }}>
            {currentMonth.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
          </div>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#16a34a',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            &gt;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginTop: '8px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(230,238,248,0.6)', padding: '8px' }}>
              {day}
            </div>
          ))}

          {days.map((day, idx) => {
            const colors = day ? getDayColor(day) : { bg: 'transparent', borderColor: 'transparent' };
            return (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '900',
                  color: day ? 'rgba(230,238,248,0.85)' : 'transparent',
                  background: colors.bg,
                  border: `1px solid ${colors.borderColor}`,
                  cursor: 'pointer',
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const groupTradesByWeek = () => {
    const grouped: Record<string, Trade[]> = {};

    trades
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === currentMonth.getMonth() &&
          tDate.getFullYear() === currentMonth.getFullYear()
        );
      })
      .forEach((trade) => {
        const tDate = new Date(trade.date);
        const weekStart = new Date(tDate);
        const dow = (weekStart.getDay() + 6) % 7;
        weekStart.setDate(weekStart.getDate() - dow);
        const weekKey = weekStart.toISOString().slice(0, 10);

        if (!grouped[weekKey]) grouped[weekKey] = [];
        grouped[weekKey].push(trade);
      });

    return grouped;
  };

  const weeklySummaries = groupTradesByWeek();
  const sortedWeeks = Object.keys(weeklySummaries).sort((a, b) => b.localeCompare(a));

  return (
    <div
      style={{
        background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)',
        color: '#00ff88',
        minHeight: '100vh',
        padding: '104px 22px 22px',
        fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial',
      }}
    >
      {/* Navigation */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'transparent',
          zIndex: 1000,
          padding: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          height: '50px',
        }}
      >
        <div></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#bbf7d0' }}>
            {new Date().toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/checklist"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'transparent',
              color: '#bbf7d0',
              border: '1px solid rgba(187,247,208,0.3)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            📋 Checklist
          </a>
          <a
            href="/dashboard"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #16a34a, #06b6d4)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            📊 Dashboard
          </a>
          <a
            href="/trades"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'transparent',
              color: '#bbf7d0',
              border: '1px solid rgba(187,247,208,0.3)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            📈 Trades
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <h1 style={{ color: '#16a34a', margin: '0 0 6px', letterSpacing: '0.2px', fontSize: '28px' }}>
          Trading Dashboard
        </h1>
        <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)' }}>
          At-a-glance performance from saved trades
        </div>

        {/* Net Profit Hero */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: '14px',
            marginTop: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '8px' }}>
              Net Profit & Loss
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: '950',
                color: totalProfit >= 0 ? '#16a34a' : '#ef4444',
                letterSpacing: '-0.8px',
                textShadow:
                  totalProfit >= 0
                    ? '0 18px 54px rgba(0,255,0,0.238), 0 0 22px rgba(0,255,255,0.153)'
                    : '0 18px 54px rgba(255,0,128,0.187), 0 0 22px rgba(255,0,128,0.119)',
              }}
            >
              ${totalProfit.toFixed(2)}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(230,238,248,0.65)' }}>
              {trades.filter((t) => t.profit !== undefined).length} trades completed
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Win Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '850', letterSpacing: '0.2px' }}>
                {winRate.toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Profit Factor</div>
              <div style={{ fontSize: '20px', fontWeight: '850', letterSpacing: '0.2px' }}>
                {isFinite(profitFactor) ? profitFactor.toFixed(2) : '—'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Avg Confluence</div>
              <div style={{ fontSize: '20px', fontWeight: '850', letterSpacing: '0.2px' }}>0%</div>
            </div>
          </div>
        </div>

        {/* Key Stats Section */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: '14px',
            marginTop: '14px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <h2 style={{ fontSize: '14px', color: '#16a34a', marginBottom: '12px', letterSpacing: '0.3px', margin: 0 }}>
            Key Stats
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Total Profit</div>
              <div style={{ fontSize: '20px', fontWeight: '850' }}>
                {trades
                  .filter((t) => t.profit && t.profit > 0)
                  .reduce((sum, t) => sum + (t.profit || 0), 0)
                  .toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginTop: '4px' }}>
                {stats.winTrades} winning trades
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Total Loss</div>
              <div style={{ fontSize: '20px', fontWeight: '850' }}>
                {Math.abs(
                  trades
                    .filter((t) => t.profit && t.profit < 0)
                    .reduce((sum, t) => sum + (t.profit || 0), 0)
                ).toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginTop: '4px' }}>
                {stats.lossTrades} losing trades
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Largest Win</div>
              <div style={{ fontSize: '20px', fontWeight: '850' }}>${stats.largestWin.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Largest Loss</div>
              <div style={{ fontSize: '20px', fontWeight: '850' }}>${Math.abs(stats.largestLoss).toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)', marginBottom: '6px' }}>Best Win Streak</div>
              <div style={{ fontSize: '20px', fontWeight: '850' }}>{stats.bestStreak}</div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: '14px',
            marginTop: '14px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <h2 style={{ fontSize: '14px', color: '#16a34a', marginBottom: '12px', letterSpacing: '0.3px', margin: 0 }}>
            Calendar
          </h2>
          {renderCalendar()}
        </div>

        {/* Weekly Summaries */}
        {sortedWeeks.length > 0 && (
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '16px',
              borderRadius: '14px',
              marginTop: '14px',
              marginBottom: '28px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <h2 style={{ fontSize: '14px', color: '#16a34a', marginBottom: '12px', letterSpacing: '0.3px', margin: 0 }}>
              Weekly Summaries
            </h2>

            {sortedWeeks.map((weekKey) => {
              const weekTrades = weeklySummaries[weekKey];
              const profit = weekTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
              const wins = weekTrades.filter((t) => t.profit && t.profit > 0).length;

              return (
                <div
                  key={weekKey}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr repeat(4, 1fr)',
                    gap: '10px',
                    marginBottom: '10px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)' }}>
                    Week of {new Date(weekKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                    {weekTrades.length} trades
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      padding: '8px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: profit >= 0 ? '#16a34a' : '#ef4444',
                    }}
                  >
                    ${profit.toFixed(2)}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                    {wins} wins
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                    {((wins / weekTrades.length) * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
