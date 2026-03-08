'use client';

import { useEffect, useState } from 'react';

type Trade = {
  id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  date: string;
  profit?: number;
  notes?: string;
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const journal = localStorage.getItem('juneJournal');
    if (journal) {
      try {
        setTrades(JSON.parse(journal) || []);
      } catch (e) {
        console.error('Failed to load trades');
      }
    }
  }, []);

  const groupTradesByPeriod = () => {
    const grouped: Record<string, Record<string, Record<string, Trade[]>>> = {};

    trades.forEach((trade) => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const weekStart = new Date(date);
      const dow = (weekStart.getDay() + 6) % 7;
      weekStart.setDate(weekStart.getDate() - dow);
      const weekKey = weekStart.toISOString().slice(0, 10);
      const dayKey = date.toISOString().slice(0, 10);

      if (!grouped[monthKey]) grouped[monthKey] = {};
      if (!grouped[monthKey][weekKey]) grouped[monthKey][weekKey] = {};
      if (!grouped[monthKey][weekKey][dayKey]) grouped[monthKey][weekKey][dayKey] = [];
      grouped[monthKey][weekKey][dayKey].push(trade);
    });

    return grouped;
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const toggleWeek = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  };

  const formatWeekRange = (startDate: Date) => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    return `${startDate.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
    })} – ${end.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}`;
  };

  const grouped = groupTradesByPeriod();
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div
      style={{
        background: 'linear-gradient(45deg, #0a0a0a, #1a1a1a)',
        color: '#00ff88',
        minHeight: '100vh',
        padding: '24px',
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
            📈 Trades
          </a>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1060px',
          margin: '80px auto 28px',
        }}
      >
        <div>
          <h1
            style={{
              color: '#16a34a',
              margin: '0 0 6px',
              letterSpacing: '0.2px',
              fontSize: '32px',
            }}
          >
            All Trades
          </h1>
          <div style={{ fontSize: '12px', color: 'rgba(230,238,248,0.65)' }}>
            Organized by months, weeks, and days
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: '14px',
            marginTop: '14px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {trades.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: 'rgba(230,238,248,0.65)',
                fontSize: '16px',
              }}
            >
              No trades saved yet.
            </div>
          ) : (
            sortedMonths.map((monthKey) => {
              const monthData = grouped[monthKey];
              const monthDate = new Date(monthKey + '-01');
              const monthName = monthDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
              });
              const sortedWeeks = Object.keys(monthData).sort((a, b) => b.localeCompare(a));

              return (
                <div
                  key={monthKey}
                  style={{
                    marginBottom: '20px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => toggleMonth(monthKey)}
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#16a34a',
                      }}
                    >
                      {monthName}
                    </div>
                    <div style={{ color: 'rgba(230,238,248,0.65)' }}>
                      {expandedMonths.has(monthKey) ? '▼' : '▶'}
                    </div>
                  </div>

                  {expandedMonths.has(monthKey) && (
                    <div style={{ padding: '16px' }}>
                      {sortedWeeks.map((weekKey) => {
                        const weekData = monthData[weekKey];
                        const weekStart = new Date(weekKey);
                        const weekRange = formatWeekRange(weekStart);
                        const sortedDays = Object.keys(weekData).sort((a, b) =>
                          b.localeCompare(a)
                        );
                        const weekId = `${monthKey}-${weekKey}`;

                        return (
                          <div
                            key={weekId}
                            style={{
                              marginBottom: '16px',
                              border: '1px solid rgba(255,255,255,0.02)',
                              borderRadius: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              onClick={() => toggleWeek(weekId)}
                              style={{
                                background: 'rgba(255,255,255,0.01)',
                                padding: '10px 14px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '14px',
                                  color: '#06b6d4',
                                }}
                              >
                                Week: {weekRange}
                              </div>
                              <div
                                style={{
                                  fontSize: '14px',
                                  color: 'rgba(230,238,248,0.65)',
                                  transition: 'transform 0.3s',
                                  transform: expandedWeeks.has(weekId) ? 'rotate(90deg)' : 'rotate(0deg)',
                                }}
                              >
                                ▶
                              </div>
                            </div>

                            {expandedWeeks.has(weekId) && (
                              <div style={{ padding: '12px' }}>
                                {sortedDays.map((dayKey) => {
                                  const dayTrades = weekData[dayKey];
                                  const dayDate = new Date(dayKey);
                                  const dayName = dayDate.toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                  });

                                  return (
                                    <div
                                      key={dayKey}
                                      style={{
                                        marginBottom: '12px',
                                        borderLeftWidth: '3px',
                                        borderLeftStyle: 'solid',
                                        borderLeftColor: '#16a34a',
                                        paddingLeft: '12px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: '14px',
                                          fontWeight: '500',
                                          color: '#00ff88',
                                          marginBottom: '8px',
                                        }}
                                      >
                                        {dayName}
                                      </div>

                                      {dayTrades.map((trade) => (
                                        <div
                                          key={trade.id}
                                          style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            marginBottom: '10px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'center',
                                              gap: '10px',
                                            }}
                                          >
                                            <span style={{ fontWeight: '600' }}>
                                              {trade.symbol}
                                            </span>
                                            {trade.profit !== undefined && (
                                              <span
                                                style={{
                                                  fontWeight: '950',
                                                  letterSpacing: '0.2px',
                                                  color:
                                                    trade.profit >= 0
                                                      ? '#16a34a'
                                                      : '#ef4444',
                                                  textShadow:
                                                    trade.profit >= 0
                                                      ? '0 10px 26px rgba(0,255,0,0.187)'
                                                      : '0 10px 26px rgba(255,0,128,0.153)',
                                                }}
                                              >
                                                {trade.profit >= 0 ? '+' : ''}
                                                {trade.profit.toFixed(2)}
                                              </span>
                                            )}
                                          </div>
                                          <div
                                            style={{
                                              marginTop: '6px',
                                              display: 'flex',
                                              gap: '10px',
                                              flexWrap: 'wrap',
                                            }}
                                          >
                                            <span
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '5px 9px',
                                                borderRadius: '999px',
                                                fontSize: '12px',
                                                border:
                                                  '1px solid rgba(255,255,255,0.06)',
                                                background: 'rgba(255,255,255,0.02)',
                                              }}
                                            >
                                              {trade.direction}
                                            </span>
                                            {trade.notes && (
                                              <span
                                                style={{
                                                  fontSize: '12px',
                                                  color: 'rgba(230,238,248,0.65)',
                                                }}
                                              >
                                                {trade.notes}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
