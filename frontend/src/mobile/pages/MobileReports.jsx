import { useEffect, useState } from 'react';
import api from '../../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MobileMonthly() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setLoading(true);
    api.get(`/trades/month/${new Date().getFullYear()}/${selMonth}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [selMonth]);

  return (
    <div>
      <div className="m-page-hd">
        <h1>Monthly Analysis</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20 }}>
        {MONTHS.map((m, i) => (
          <button 
            key={m} 
            className={`m-nav-item ${selMonth === i + 1 ? 'active' : ''}`}
            style={{ padding: '8px 12px' }}
            onClick={() => setSelMonth(i + 1)}
          >
            {m}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Crunching data…</div>
      ) : !data || data.trades.length === 0 ? (
        <div className="empty">No entries for this month.</div>
      ) : (
        <>
          <div className="m-stat-grid">
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.totalTrades}</span><span className="m-stat-lbl">Trades</span></div>
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.winRate}%</span><span className="m-stat-lbl">Win rate</span></div>
            <div className="m-stat-card"><span className="m-stat-val" style={{ color: data.stats.netPNL > 0 ? '#10b981' : '#ef4444' }}>{data.stats.netPNL}%</span><span className="m-stat-lbl">Net PNL</span></div>
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.maxLossStreak}</span><span className="m-stat-lbl">Loss streak</span></div>
          </div>

          <div className="m-tbl-wrap">
            <table className="m-tbl">
              <thead><tr><th>Pair</th><th>Risk</th><th>PNL</th><th>Result</th></tr></thead>
              <tbody>
                {data.trades.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.pair}</strong></td>
                    <td>{t.risk_percent}%</td>
                    <td className={t.pnl_percentage > 0 ? 'rp' : 'rn'}>{t.pnl_percentage}%</td>
                    <td>{t.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileYearly() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/trades/year/${new Date().getFullYear()}`)
      .then(r => setData(r.data));
  }, []);

  return (
    <div>
      <div className="m-page-hd">
        <h1>Yearly Statistics</h1>
      </div>

      {!data ? <div>Loading yearly summary…</div> : (
        <>
          <div className="m-stat-grid" style={{ marginBottom: 32 }}>
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.totalTrades}</span><span className="m-stat-lbl">Volume</span></div>
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.winRate}%</span><span className="m-stat-lbl">W/L ratio</span></div>
            <div className="m-stat-card"><span className="m-stat-val">{data.stats.netPNL}%</span><span className="m-stat-lbl">Annual PNL</span></div>
          </div>

          <div className="m-page-hd"><h2>Monthly Breakdown</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {data.stats.monthlyBreakdown.map(m => (
              <div key={m.month} className="m-stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="m-stat-lbl">{MONTHS[m.month-1]}</span>
                <span className={m.pnl > 0 ? 'rp' : 'rn'} style={{ fontWeight: 800 }}>{m.pnl}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
