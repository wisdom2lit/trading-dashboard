'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Trade = {
  id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  date: string;
  profit?: number;
  notes?: string;
};

type Rule = {
  id: string;
  label: string;
  weight: number;
  section: string;
  lock?: string;
};

const rules: Rule[] = [
  // Weekly checks
  { id: 'w_trend_bull', label: 'Trend — Bullish', weight: 3, section: 'Weekly', lock: 'w_trend_bear' },
  { id: 'w_trend_bear', label: 'Trend — Bearish', weight: 3, section: 'Weekly', lock: 'w_trend_bull' },
  { id: 'w_reject', label: 'Weekly Rejected AOI', weight: 5, section: 'Weekly' },
  { id: 'w_bos', label: 'Weekly BOS', weight: 5, section: 'Weekly' },
  { id: 'w_choch', label: 'Weekly CHoCH', weight: 5, section: 'Weekly' },
  { id: 'w_ob_fvg', label: 'Weekly Order Block / FVG', weight: 5, section: 'Weekly' },
  { id: 'w_ema', label: 'Liquidity (grabbed or not)', weight: 5, section: 'Weekly' },

  // Daily checks
  { id: 'd_trend_bull', label: 'Trend — Bullish', weight: 3, section: 'Daily', lock: 'd_trend_bear' },
  { id: 'd_trend_bear', label: 'Trend — Bearish', weight: 3, section: 'Daily', lock: 'd_trend_bull' },
  { id: 'd_bos', label: 'Daily BOS', weight: 5, section: 'Daily', lock: 'd_choch' },
  { id: 'd_liquidity', label: 'Liquidity Sweep', weight: 5, section: 'Daily' },
  { id: 'd_rejected_poi', label: 'Rejected POI', weight: 5, section: 'Daily' },
  { id: 'd_premium', label: 'Premium Aligned', weight: 3, section: 'Daily', lock: 'd_discount' },
  { id: 'd_discount', label: 'Discount Aligned', weight: 3, section: 'Daily', lock: 'd_premium' },
  { id: 'd_choch', label: 'Daily CHoCH', weight: 5, section: 'Daily', lock: 'd_bos' },
  { id: 'd_smt', label: 'Daily SMT', weight: 5, section: 'Daily' },

  // 4H checks
  { id: 'h4_trend_bull', label: 'Trend — Bullish', weight: 3, section: '4H', lock: 'h4_trend_bear' },
  { id: 'h4_trend_bear', label: 'Trend — Bearish', weight: 3, section: '4H', lock: 'h4_trend_bull' },
  { id: 'h4_choch', label: '4H CHoCH', weight: 5, section: '4H', lock: 'h4_bos' },
  { id: 'h4_sweep', label: '4H Liquidity Sweep', weight: 5, section: '4H' },
  { id: 'h4_rejected_poi', label: 'Rejected POI', weight: 5, section: '4H' },
  { id: 'h4_smt', label: '4H SMT', weight: 5, section: '4H' },
  { id: 'h4_london', label: 'London Session', weight: 3, section: '4H' },
  { id: 'h4_ny', label: 'NY Session', weight: 3, section: '4H' },
  { id: 'h4_premium', label: 'Premium Aligned', weight: 3, section: '4H', lock: 'h4_discount' },
  { id: 'h4_discount', label: 'Discount Aligned', weight: 3, section: '4H', lock: 'h4_premium' },
  { id: 'h4_disp', label: '4H Displacement', weight: 5, section: '4H' },
  { id: 'h4_bos', label: '4H BOS', weight: 5, section: '4H' },

  // Execution & Entry
  { id: 'ltf_smt', label: 'LTF SMT (MANDATORY)', weight: 10, section: 'Execution' },
  { id: 'ltf_choch', label: 'LTF CHoCH', weight: 5, section: 'Execution' },
  { id: 'ltf_poi', label: 'OB / BB / FVG Entry', weight: 5, section: 'Execution' },

  { id: 'e_disp', label: 'Entry Displacement Candle', weight: 5, section: 'Entry' },
  { id: 'e_candle', label: 'Candle Confirmation', weight: 5, section: 'Entry' },
];

export default function ChecklistPage() {
  const router = useRouter();
  const [active, setActive] = useState<Set<string>>(new Set());
  const [sl, setSL] = useState('');
  const [tp, setTP] = useState('');
  const [score, setScore] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeDir, setTradeDir] = useState('Long');
  const [tradeProfit, setTradeProfit] = useState('');
  const [tradeNotes, setTradeNotes] = useState('');
  const [session, setSession] = useState('');

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('juneRules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActive(new Set(parsed));
      } catch (e) {
        console.error('Failed to load saved state');
      }
    }

    const journal = localStorage.getItem('juneJournal');
    if (journal) {
      try {
        const parsed = JSON.parse(journal);
        setTrades(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to load trades');
      }
    }

    const storedSession = localStorage.getItem('currentSession') || 'Session ' + new Date().toLocaleDateString();
    setSession(storedSession);
    localStorage.setItem('currentSession', storedSession);
  }, []);

  // Calculate score
  useEffect(() => {
    const grouped = rules.reduce((acc, rule) => {
      if (!acc[rule.section]) acc[rule.section] = [];
      acc[rule.section].push(rule);
      return acc;
    }, {} as Record<string, Rule[]>);

    let totalScore = 0;
    Object.entries(grouped).forEach(([_, sectionRules]) => {
      // Handle mutually exclusive rules
      const ruleMap = new Map(sectionRules.map(r => [r.id, r]));
      const processed = new Set<string>();

      sectionRules.forEach(rule => {
        if (processed.has(rule.id)) return;

        if (rule.lock && ruleMap.has(rule.lock)) {
          // This is part of a mutually exclusive pair
          const otherActive = active.has(rule.lock);
          const thisActive = active.has(rule.id);

          if (thisActive || otherActive) {
            totalScore += Math.max(
              thisActive ? rule.weight : 0,
              otherActive ? (ruleMap.get(rule.lock)?.weight || 0) : 0
            );
            processed.add(rule.lock);
          }
          processed.add(rule.id);
        } else if (!rule.lock || !active.has(rule.lock)) {
          if (active.has(rule.id)) {
            totalScore += rule.weight;
          }
          processed.add(rule.id);
        }
      });
    });

    setScore(Math.min(100, totalScore));
  }, [active]);

  const saveState = () => {
    localStorage.setItem('juneRules', JSON.stringify(Array.from(active)));
  };

  const handleToggleRule = (ruleId: string) => {
    const newActive = new Set(active);
    const rule = rules.find(r => r.id === ruleId);

    if (newActive.has(ruleId)) {
      newActive.delete(ruleId);
    } else {
      // Check for lock
      if (rule?.lock && newActive.has(rule.lock)) {
        newActive.delete(rule.lock);
      }
      newActive.add(ruleId);
    }

    setActive(newActive);
    localStorage.setItem('juneRules', JSON.stringify(Array.from(newActive)));
  };

  const handleSaveTrade = () => {
    if (!tradeSymbol) {
      alert('Please enter a symbol');
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: tradeSymbol,
      direction: tradeDir as 'Long' | 'Short',
      date: new Date().toISOString(),
      profit: tradeProfit ? parseFloat(tradeProfit) : undefined,
      notes: tradeNotes,
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    localStorage.setItem('juneJournal', JSON.stringify(updated));

    setTradeSymbol('');
    setTradeProfit('');
    setTradeNotes('');
  };

  const handleClearTrades = () => {
    if (confirm('Clear all trades?')) {
      setTrades([]);
      localStorage.setItem('juneJournal', JSON.stringify([]));
    }
  };

  const handleClear = () => {
    setActive(new Set());
    setScore(0);
    setSL('');
    setTP('');
    localStorage.removeItem('juneRules');
  };

  const verdict =
    score === 0 ? 'NO' : score < 40 ? 'B' : score < 70 ? 'A' : 'A+';
  const verdictClass =
    verdict === 'NO' ? 'bg-red-500/10 text-white' : 
    verdict === 'B' ? 'bg-yellow-500/10 text-yellow-300' :
    verdict === 'A' ? 'bg-blue-500/10 text-blue-300' :
    'bg-green-500/10 text-green-300';

  const sections = rules.reduce((acc, rule) => {
    if (!acc[rule.section]) acc[rule.section] = [];
    acc[rule.section].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <div style={{
      background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)',
      color: '#00ff88',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial',
    }}>
      {/* Navigation */}
      <div style={{
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
      }}>
        <div></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#bbf7d0' }}>
            {session}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/checklist"
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
            📋 Checklist
          </a>
          <a
            href="/dashboard"
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

      <div style={{
        maxWidth: '900px',
        margin: '80px auto 28px',
        padding: '0 24px',
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#bbf7d0',
          letterSpacing: '0.6px',
          marginBottom: '6px',
          fontSize: '32px',
        }}>
          TRADING CHECKLIST
        </h1>
        <h3 style={{
          textAlign: 'center',
          color: '#bbf7d0',
          marginTop: 0,
          fontWeight: 400,
          fontSize: '16px',
        }}>
          Checklist & setup verifier
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '18px', marginTop: '24px' }}>
          {/* Left Panel */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            padding: '18px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Score Circle */}
            <div style={{
              width: '150px',
              height: '150px',
              margin: '0 auto',
              position: 'relative',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg
                style={{
                  width: '100%',
                  height: '100%',
                  transform: 'rotate(-90deg)',
                }}
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  strokeWidth="12"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  strokeWidth="12"
                  fill="none"
                  stroke="#16a34a"
                  strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.7s cubic-bezier(.2,.9,.2,1)',
                  }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e6eef8',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{score}%</div>
                <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.7)' }}>
                  Confidence
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div
              style={{
                marginTop: '8px',
                fontWeight: '800',
                fontSize: '16px',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'inline-block',
                margin: '0 auto',
              }}
              className={verdictClass}
            >
              {verdict === 'NO' ? 'NO TRADE' : verdict === 'B' ? 'B' : verdict === 'A' ? 'A' : 'A+'}
            </div>

            {/* Risk Inputs */}
            <div style={{ marginTop: '12px' }}>
              <label style={{ marginBottom: '12px', display: 'block' }}>
                Stop Loss
                <input
                  type="number"
                  placeholder="pips"
                  value={sl}
                  onChange={(e) => setSL(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: '#e6eef8',
                  }}
                />
              </label>
              <label style={{ marginBottom: '12px', display: 'block' }}>
                Take Profit
                <input
                  type="number"
                  placeholder="pips"
                  value={tp}
                  onChange={(e) => setTP(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: '#e6eef8',
                  }}
                />
              </label>
            </div>

            {/* Trade Entry */}
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <label style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ width: '64px' }}>Symbol</span>
                <input
                  type="text"
                  placeholder="EURUSD"
                  value={tradeSymbol}
                  onChange={(e) => setTradeSymbol(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'inherit',
                  }}
                />
              </label>
              <label style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ width: '64px' }}>Dir</span>
                <select
                  value={tradeDir}
                  onChange={(e) => setTradeDir(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'inherit',
                  }}
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </label>
              <label style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ width: '64px' }}>P&L</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="optional"
                  value={tradeProfit}
                  onChange={(e) => setTradeProfit(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'inherit',
                  }}
                />
              </label>
              <textarea
                placeholder="Brief notes..."
                value={tradeNotes}
                onChange={(e) => setTradeNotes(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '64px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'inherit',
                  marginBottom: '8px',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveTrade}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #06b6d4, #7c3aed)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Save Trade
                </button>
                <button
                  onClick={handleClearTrades}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'transparent',
                    color: 'rgba(230,238,248,0.9)',
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'transparent',
                  color: 'rgba(230,238,248,0.9)',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('juneRules', JSON.stringify(Array.from(active)));
                  localStorage.setItem('juneJournal', JSON.stringify(trades));
                }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #06b6d4, #7c3aed)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Right Panel - Checklist Items */}
          <div>
            {Object.entries(sections).map(([section, sectionRules]) => (
              <div
                key={section}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  boxShadow: '0 6px 18px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <h2
                  style={{
                    marginBottom: '12px',
                    color: '#86efac',
                    fontSize: '16px',
                  }}
                >
                  {section}
                </h2>

                {sectionRules.map((rule) => (
                  <label
                    key={rule.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active.has(rule.id)}
                      onChange={() => handleToggleRule(rule.id)}
                      style={{
                        marginRight: '12px',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ flex: 1, fontWeight: 600 }}>{rule.label}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        marginLeft: '12px',
                        color: active.has(rule.id) ? 'white' : 'rgba(230,238,248,0.95)',
                      }}
                    >
                      +{rule.weight}%
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
