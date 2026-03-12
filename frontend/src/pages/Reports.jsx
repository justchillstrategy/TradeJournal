import { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils/dateHelper';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS = [2024, 2025, 2026, 2027];

function StatBadge({ label, value, cls='' }) {
  return (
    <div className="m-stat-card">
      <div className="m-stat-label">{label}</div>
      <div className={`m-stat-val ${cls === 'rp' ? 'svG' : cls === 'rn' ? 'svR' : ''}`}>{value != null ? value : '—'}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="m-card" style={{ padding: '8px 12px', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--m-sub)' }}>{`Trade ${label}`}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--m-primary)' }}>{`${payload[0].value}% Equity`}</p>
      </div>
    );
  }
  return null;
}

export function MonthlyReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true); setErr('');
    api.get(`/trades/month/${year}/${month}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e.message||'Failed to load'))
      .finally(() => setLoading(false));
  }, [year, month]);

  const exportPDF = async () => {
    setExporting(true); setErr('');
    try {
      const url = `/api/export/month/${year}/${month}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('tjp_token')}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.download = `monthly-report-${year}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objUrl);
    } catch(ex) { setErr('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="m-page-fade">
      {/* Desktop Header */}
      <div className="page-hd m-hide">
        <h1>Monthly Report · {MONTHS[month-1]} {year}</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <select className="fsel" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select className="fsel" value={month} onChange={e=>setMonth(Number(e.target.value))}>
            {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
          </select>
          <button className="btn btn-primary" onClick={exportPDF} disabled={exporting}>
            {exporting?'...':'Export PDF'}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="page-hd d-hide">
        <h1>Monthly Report</h1>
        <button className="m-glass-btn btn-sm" onClick={exportPDF} disabled={exporting}>
          {exporting ? '...' : '⬇ PDF'}
        </button>
      </div>

      {/* Mobile Filter */}
      <div className="m-card d-hide" style={{ padding: '12px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="fsel" style={{ flex: 1, background: 'transparent', color: '#fff', border: 'none' }} value={year} onChange={e=>setYear(Number(e.target.value))}>
            {YEARS.map(y=><option key={y} value={y} style={{ background: '#1e293b' }}>{y}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 2 }}>
            {MONTHS.map((m,i)=>{
              const isSel = month === (i+1);
              return (
                <button 
                  key={m} 
                  className="m-glass-btn" 
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '11px', 
                    background: isSel ? 'var(--m-primary)' : 'transparent',
                    borderColor: isSel ? 'var(--m-primary)' : 'var(--m-border)'
                  }} 
                  onClick={()=>setMonth(i+1)}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {err && <div className="err-box">{err}</div>}
      
      {loading ? <div className="loading">Generating report…</div> : !data || data.trades.length===0 ? <div className="m-card" style={{ textAlign: 'center' }}>No trades for this period.</div> : (
        <>
          {/* Desktop Stats */}
          <div className="m-hide" style={{ marginBottom: 24 }}>
            <div className="sg">
              <div className="sb">
                <div className="sl">Trades</div>
                <div className="sv">{data.stats.totalTrades}</div>
              </div>
              <div className="sb">
                <div className="sl">Wins</div>
                <div className="sv svG">{data.stats.wins}</div>
              </div>
              <div className="sb">
                <div className="sl">Win Rate</div>
                <div className="sv">{data.stats.winRate}%</div>
              </div>
              <div className="sb">
                <div className="sl">Net PNL</div>
                <div className={`sv ${data.stats.netPNL>=0?'svG':'svR'}`}>{data.stats.netPNL}%</div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="d-hide">
            <div className="m-stat-grid">
              <StatBadge label="Trades" value={data.stats.totalTrades}/>
              <StatBadge label="Wins" value={data.stats.wins} cls="rp"/>
              <StatBadge label="Losses" value={data.stats.losses} cls="rn"/>
              <StatBadge label="Win Rate" value={`${data.stats.winRate}%`} cls={data.stats.winRate > 50 ? 'rp' : ''}/>
              <StatBadge label="Net PNL" value={`${data.stats.netPNL>=0?'+':''}${data.stats.netPNL}%`} cls={data.stats.netPNL > 0 ? 'rp' : 'rn'}/>
              <StatBadge label="Max Loss" value={data.stats.maxLossStreak} cls="rn"/>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="m-hide">
             <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pair</th>
                  <th>Direction</th>
                  <th>Risk</th>
                  <th>Outcome</th>
                  <th>PNL %</th>
                  <th>R Multiple</th>
                </tr>
              </thead>
              <tbody>
                {data.trades.map(t=>(
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td><span className="mono">{t.pair}</span></td>
                    <td><span className={`dir ${t.direction?.toLowerCase()}`}>{t.direction}</span></td>
                    <td>{t.risk_percent}%</td>
                    <td>
                      {t.result && <span className={`res-p res-${t.result?.toLowerCase()}`}>{t.result}</span>}
                    </td>
                    <td className={`mono ${t.pnl_percentage > 0 ? 'svG' : t.pnl_percentage < 0 ? 'svR' : ''}`}>
                      {t.pnl_percentage != null ? `${t.pnl_percentage >= 0 ? '+' : ''}${parseFloat(t.pnl_percentage).toFixed(2)}%` : '—'}
                    </td>
                    <td className="mono">{t.r_multiple?`${parseFloat(t.r_multiple).toFixed(2)}R`:'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="d-hide" style={{ marginTop: 24 }}>
            {data.trades.map(t=>(
              <div key={t.id} className="m-card m-trade-card">
                <div className="m-trade-info">
                  <div className="m-trade-pair">{t.pair}</div>
                  <div className="m-trade-date">
                    {formatDate(t.date)} • {t.direction} • {t.risk_percent}% Risk
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`m-pill ${t.grade==='A+'?'m-pill-win':t.grade==='A'?'m-pill-be':'m-pill-loss'}`} style={{ fontSize: '10px' }}>{t.grade}</span>
                  </div>
                </div>
                <div className="m-trade-result">
                  <div className={`m-trade-profit ${t.pnl_percentage > 0 ? 'svG' : t.pnl_percentage < 0 ? 'svR' : ''}`}>
                    {t.pnl_percentage != null ? `${t.pnl_percentage >= 0 ? '+' : ''}${parseFloat(t.pnl_percentage).toFixed(2)}%` : '—'}
                  </div>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--m-sub)' }}>{t.r_multiple?`${parseFloat(t.r_multiple).toFixed(2)}R`:'—'}</div>
                  {t.result && <span className={`m-pill ${t.result==='Win'?'m-pill-win':t.result==='Loss'?'m-pill-loss':'m-pill-be'}`} style={{ fontSize: '10px' }}>{t.result}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function YearlyReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true); setErr('');
    api.get(`/trades/year/${year}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e.message||'Failed to load'))
      .finally(() => setLoading(false));
  }, [year]);

  const exportPDF = async () => {
    setExporting(true); setErr('');
    try {
      const url = `/api/export/year/${year}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('tjp_token')}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objUrl;
      link.download = `yearly-report-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objUrl);
    } catch(ex) { setErr('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div className="m-page-fade">
      {/* Desktop Header */}
      <div className="page-hd m-hide">
        <h1>Yearly Performance · {year}</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <select className="fsel" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={exportPDF} disabled={exporting}>
            {exporting?'...':'Export PDF'}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="page-hd d-hide">
        <h1>Yearly Report</h1>
        <button className="m-glass-btn btn-sm" onClick={exportPDF} disabled={exporting}>
          {exporting ? '...' : '⬇ PDF'}
        </button>
      </div>

      {/* Mobile Filter */}
      <div className="m-card d-hide" style={{ marginBottom: 24 }}>
        <select className="fsel" style={{ width: '100%', background: 'transparent', color: '#fff', border: 'none' }} value={year} onChange={e=>setYear(Number(e.target.value))}>
          {YEARS.map(y=><option key={y} value={y} style={{ background: '#1e293b' }}>{y}</option>)}
        </select>
      </div>

      {err && <div className="err-box">{err}</div>}
      {loading ? <div className="loading">Processing year…</div> : !data || data.trades.length===0 ? <div className="m-card" style={{ textAlign: 'center' }}>No historical data for {year}.</div> : (
        <>
          {/* Desktop Stats */}
          <div className="m-hide" style={{ marginBottom: 24 }}>
            <div className="sg">
              <div className="sb">
                <div className="sl">Trades</div>
                <div className="sv">{data.stats.totalTrades}</div>
              </div>
              <div className="sb">
                <div className="sl">Wins</div>
                <div className="sv svG">{data.stats.wins}</div>
              </div>
              <div className="sb">
                <div className="sl">Win Rate</div>
                <div className="sv">{data.stats.winRate}%</div>
              </div>
              <div className="sb">
                <div className="sl">Net PNL</div>
                <div className={`sv ${data.stats.netPNL>=0?'svG':'svR'}`}>{data.stats.netPNL}%</div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="d-hide">
            <div className="m-stat-grid">
              <StatBadge label="Trades" value={data.stats.totalTrades}/>
              <StatBadge label="Wins" value={data.stats.wins} cls="rp"/>
              <StatBadge label="Losses" value={data.stats.losses} cls="rn"/>
              <StatBadge label="Win Rate" value={`${data.stats.winRate}%`} cls={data.stats.winRate > 50 ? 'rp' : ''}/>
              <StatBadge label="Net PNL" value={`${data.stats.netPNL>=0?'+':''}${data.stats.netPNL}%`} cls={data.stats.netPNL > 0 ? 'rp' : 'rn'}/>
              <StatBadge label="Max Loss Streak" value={data.stats.maxLossStreak} cls="rn"/>
            </div>
          </div>

          {/* Desktop Breakdown Grid */}
          <div className="m-hide card" style={{ marginBottom: 24 }}>
            <div className="form-sec" style={{ marginBottom: 16 }}>Monthly Performance</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:16}}>
              {data.stats.monthlyBreakdown.map(m=>(
                <div key={m.month} style={{textAlign:'center',padding:'16px',borderRadius:12,backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#64748b',marginBottom:4}}>{MONTHS[m.month-1]}</div>
                  <div style={{fontSize:16,fontWeight:700}} className={m.pnl>0?'svG':m.pnl<0?'svR':''}>
                    {m.pnl>0?'+':''}{m.pnl}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Breakdown */}
          <div className="m-card d-hide">
            <h3 style={{ fontSize: '14px', marginBottom: 16, color: 'var(--m-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Breakdown</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:8}}>
              {data.stats.monthlyBreakdown.map(m=>(
                <div key={m.month} style={{textAlign:'center',padding:'12px 4px',borderRadius:16,backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid var(--m-border)'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--m-sub)',marginBottom:4}}>{MONTHS[m.month-1]}</div>
                  <div style={{fontSize:13,fontWeight:800,fontFamily:'Outfit'}} className={m.pnl>0?'svG':m.pnl<0?'svR':''}>
                    {m.pnl>0?'+':''}{m.pnl}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="m-hide" style={{ marginTop: 24 }}>
            <div className="form-sec" style={{ marginBottom: 16 }}>Historical Trades</div>
             <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pair</th>
                  <th>PNL %</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {data.trades.slice(0, 50).map(t=>(
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td><span className="mono">{t.pair}</span></td>
                    <td className={`mono ${t.pnl_percentage > 0 ? 'svG' : t.pnl_percentage < 0 ? 'svR' : ''}`}>
                      {t.pnl_percentage != null ? `${t.pnl_percentage >= 0 ? '+' : ''}${parseFloat(t.pnl_percentage).toFixed(2)}%` : '—'}
                    </td>
                    <td>
                      {t.result && <span className={`res-p res-${t.result?.toLowerCase()}`}>{t.result}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile History */}
          <div className="d-hide" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: '16px', fontWeight: 700 }}>Full History</h3>
            {data.trades.slice(0, 20).map(t=>(
              <div key={t.id} className="m-card m-trade-card">
                <div className="m-trade-info">
                  <div className="m-trade-pair">{t.pair}</div>
                  <div className="m-trade-date">{formatDate(t.date)}</div>
                </div>
                <div className="m-trade-result">
                  <div className={`m-trade-profit ${t.pnl_percentage > 0 ? 'svG' : t.pnl_percentage < 0 ? 'svR' : ''}`}>
                    {t.pnl_percentage != null ? `${t.pnl_percentage >= 0 ? '+' : ''}${parseFloat(t.pnl_percentage).toFixed(2)}%` : '—'}
                  </div>
                  {t.result && <span className={`m-pill ${t.result==='Win'?'m-pill-win':t.result==='Loss'?'m-pill-loss':'m-pill-be'}`} style={{ fontSize: '10px' }}>{t.result}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
