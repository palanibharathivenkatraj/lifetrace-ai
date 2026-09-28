import { useApp } from '../context/AppContext';
import { Card, SectionTitle } from '../components/UI';
import { TimeSeriesChart, AnomalyScoreChart, BaselineChart } from '../components/Charts';
import AnomalyDetail from '../components/AnomalyDetail';
import { EmptyState, StatusBadge, ScoreGauge } from '../components/UI';
import DataLoader from '../components/DataLoader';

export default function Analysis() {
  const { analysis, loading, loadingMessage, selectedAnomaly, setSelectedAnomaly } = useApp();
  const obs = analysis?.observations || [];
  const anomalies = obs.filter(o => o.is_anomaly);

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          Detailed Analysis
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Deep-dive into the anomaly detection results.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}><DataLoader /></div>

      {!analysis ? (
        <div className="glass" style={{ borderRadius: '16px' }}>
          <EmptyState icon="🔬" title="No Analysis Results" description="Load data and run analysis from the data loader above." />
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Observations', value: analysis.summary.total_observations, color: '#3b82f6' },
              { label: 'Anomalies Detected', value: analysis.summary.total_anomalies, color: '#f59e0b' },
              { label: 'Critical', value: analysis.summary.status_distribution?.Critical || 0, color: '#ef4444' },
              { label: 'Anomaly Rate', value: `${analysis.summary.anomaly_rate}%`, color: '#f97316' },
            ].map(m => (
              <div key={m.label} className="glass card-hover" style={{ borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{m.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <TimeSeriesChart observations={obs} targetCol={analysis.target_column} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <AnomalyScoreChart observations={obs} />
            <BaselineChart observations={obs} />
          </div>

          {/* Flagged anomalies */}
          <Card>
            <SectionTitle subtitle={`${anomalies.length} observations flagged as anomalous`}>
              🚨 Flagged Anomalies
            </SectionTitle>
            {anomalies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                ✅ No anomalies detected in this dataset
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {anomalies.map((a, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedAnomaly(a)}
                    style={{
                      background: 'var(--bg-card)', borderRadius: '12px', padding: '14px 16px',
                      border: `1px solid ${a.status === 'Critical' ? 'rgba(239,68,68,0.3)' : a.status === 'Anomalous' ? 'rgba(249,115,22,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <ScoreGauge score={a.anomaly_score} size={64} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {a.date || `Observation #${a.index + 1}`}
                        <span style={{ marginLeft: '8px' }}><StatusBadge status={a.status} size="sm" /></span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Value: <strong style={{ color: 'var(--text-primary)' }}>{a.value.toFixed(2)}</strong>
                        {' · '}
                        Baseline: <strong style={{ color: '#8b5cf6' }}>{a.baseline.toFixed(2)}</strong>
                        {' · '}
                        Deviation: <strong style={{ color: a.deviation_pct > 0 ? '#f97316' : '#3b82f6' }}>
                          {a.deviation_pct >= 0 ? '+' : ''}{a.deviation_pct.toFixed(1)}%
                        </strong>
                      </div>
                      {a.explanation?.explanation_summary && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{a.explanation.explanation_summary.slice(0, 100)}{a.explanation.explanation_summary.length > 100 ? '...' : ''}"
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Click for details →</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {selectedAnomaly && <AnomalyDetail anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />}
    </div>
  );
}
