import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, EmptyState, ScoreGauge, Card, SectionTitle } from '../components/UI';
import AnomalyDetail from '../components/AnomalyDetail';
import { STATUS_CONFIG } from '../utils/constants';

export default function AnomalyHistory() {
  const { anomalyHistory, fetchAnomalyHistory, selectedAnomaly, setSelectedAnomaly } = useApp();

  useEffect(() => { fetchAnomalyHistory(); }, []);

  const grouped = anomalyHistory.reduce((acc, a) => {
    const status = a.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(a);
    return acc;
  }, {});

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          Anomaly History
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          All detected anomalies across analysis sessions.
        </p>
      </div>

      {/* Status summary */}
      {anomalyHistory.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {['Critical', 'Anomalous', 'Watch', 'Normal'].map(s => {
            const cnt = grouped[s]?.length || 0;
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="glass card-hover" style={{ borderRadius: '12px', padding: '16px', borderColor: cfg.border }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: cfg.color }}>{cnt}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>observations</div>
              </div>
            );
          })}
        </div>
      )}

      {anomalyHistory.length === 0 ? (
        <div className="glass" style={{ borderRadius: '16px' }}>
          <EmptyState
            icon="📭"
            title="No Anomaly History"
            description="Run an analysis from the Dashboard to populate the anomaly history."
          />
        </div>
      ) : (
        <Card>
          <SectionTitle subtitle={`${anomalyHistory.length} total anomalies recorded`}>All Anomalies</SectionTitle>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Session', 'Date', 'Value', 'Baseline', 'Deviation', 'Score', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalyHistory.map((a, i) => {
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.Normal;
                  return (
                    <tr key={i}
                      style={{ borderBottom: '1px solid rgba(30,45,74,0.5)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedAnomaly(a)}
                      onMouseEnter={e => e.currentTarget.style.background = cfg.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                        {a.session_id?.slice(0, 8)}...
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{a.observation_date || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.observed_value?.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: '#8b5cf6' }}>{a.baseline_value?.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: Math.abs(a.deviation_pct) > 20 ? cfg.color : 'var(--text-secondary)' }}>
                        {a.deviation_pct >= 0 ? '+' : ''}{a.deviation_pct?.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: cfg.bg, fontSize: '12px', fontWeight: 700, color: cfg.color }}>
                          {a.anomaly_score?.toFixed(0)}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={a.status} size="sm" /></td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedAnomaly(a); }}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', border: `1px solid ${cfg.border}`,
                            background: 'transparent', color: cfg.color,
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedAnomaly && <AnomalyDetail anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />}
    </div>
  );
}
