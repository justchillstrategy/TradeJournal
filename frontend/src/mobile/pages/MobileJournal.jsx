import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatDate } from '../../utils/dateHelper';

export default function MobileJournal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ model: 'All', result: 'All' });
  const nav = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filter.model !== 'All') q.set('model', filter.model);
    if (filter.result !== 'All') q.set('result', filter.result);
    api.get(`/trades?${q}`)
      .then(r => setTrades(r.data.trades))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="m-page-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Journal</h1>
        <button className="m-menu-btn" style={{ background: 'var(--m-primary)', color: 'white', fontSize: '1.2rem', borderRadius: 8 }} onClick={() => nav('/new-trade')}>+</button>
      </div>

      {/* Simplified Mobile Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 8 }}>
        {['All', 'Model 1', 'Model 2'].map(m => (
          <button 
            key={m} 
            className={`m-nav-item ${filter.model === m ? 'active' : ''}`}
            style={{ padding: '8px 16px', whiteSpace: 'nowrap', border: '1px solid var(--m-border)' }}
            onClick={() => setFilter(p => ({ ...p, model: m }))}
          >
            {m}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 20 }}>Syncing trades…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trades.map(t => (
            <div key={t.id} className="m-trade-card">
              <div className="m-tc-header">
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t.pair}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`pill ${t.model === 'Model 2' ? 'pM2' : 'pM1'}`}>{t.model}</span>
                  <div style={{ marginTop: 4 }} className={`pill ${t.result === 'Win' ? 'pWin' : 'pLoss'}`}>{t.result || 'Pending'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--m-border)', paddingTop: 12 }}>
                <div className="mono" style={{ fontWeight: 700 }}>{t.r_multiple != null ? `${t.r_multiple}R` : '--'}</div>
                <div className={t.pnl_percentage > 0 ? 'rp' : 'rn'} style={{ fontWeight: 800 }}>{t.pnl_percentage}%</div>
              </div>
            </div>
          ))}
          {trades.length === 0 && <div className="empty">No journals found matching filters.</div>}
        </div>
      )}
    </div>
  );
}
