import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateHelper';

export default function MobileDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/trades?status=final'),
    ]).then(([s, t]) => {
      setStats(s.data);
      setRecent(t.data.trades.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Refreshing records…</div>;

  const s = stats || {};
  const cards = [
    { label: 'Total trades', val: s.finalTrades || 0 },
    { label: 'Win rate', val: s.winRate != null ? `${s.winRate}%` : '--' },
    { label: 'Net P&L', val: s.netPNL != null ? `${s.netPNL}%` : '--' },
    { label: 'Avg RR', val: s.avgRR || '--' },
  ];

  return (
    <div>
      <div className="m-page-hd">
        <h1>Overview</h1>
      </div>

      <div className="m-stat-grid">
        {cards.map(c => (
          <div key={c.label} className="m-stat-card">
            <span className="m-stat-val">{c.val}</span>
            <span className="m-stat-lbl">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="m-page-hd" style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Activity</h2>
      </div>

      {recent.map(t => (
        <div key={t.id} className="m-trade-card">
          <div className="m-tc-header">
            <span style={{ fontWeight: 800 }}>{t.pair}</span>
            <span className={`pill ${t.result === 'Win' ? 'pWin' : 'pLoss'}`}>{t.result || 'Pending'}</span>
          </div>
          <div className="m-tc-details">
            <div>
              <div className="m-stat-lbl">Date</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(t.date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="m-stat-lbl">PNL</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{t.pnl_percentage}%</div>
            </div>
          </div>
        </div>
      ))}

      {recent.length === 0 && <div style={{ padding: 24, textAlign: 'center', opacity: 0.5 }}>No trades yet.</div>}
    </div>
  );
}
