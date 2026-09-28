import { useApp } from '../context/AppContext';
import { KpiCard, LoadingSpinner, EmptyState } from '../components/UI';
import { TimeSeriesChart, AnomalyScoreChart, BaselineChart } from '../components/Charts';
import AnomalyDetail from '../components/AnomalyDetail';
import DataLoader from '../components/DataLoader';
import { StatusBadge, ScoreGauge } from '../components/UI';
import { STATUS_CONFIG } from '../utils/constants';

export default function Dashboard() {
  const { analysis, loading, loadingMessage, selectedAnomaly, setSelectedAnomaly } = useApp();

  const summary = analysis?.summary;
  const obs = analysis?.observations || [];

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Anomaly Detection Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Select a domain, load data, and let the model learn what's normal.
        </p>
      </div>

      {/* Data Loader */}
      <div style={{ marginBottom: '24px' }}>
        <DataLoader />
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass animate-fade-in" style={{ borderRadius: '16px', marginBottom: '24px' }}>
          <LoadingSpinner message={loadingMessage} />
        </div>
      )}

      {/* Results */}
      {!loading && analysis && (
        <div className="animate-fade-in">
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <KpiCard
              title="Current Value"
              value={summary.current_value.toLocaleString()}
              subtitle={analysis.target_column}
              icon="📊"
              color="#3b82f6"
              trend={summary.current_anomaly_score > 40 ? "Elevated" : "Normal"}
            />
            <KpiCard
              title="Learned Baseline"
              value={summary.learned_baseline.toLocaleString()}
              subtitle="Rolling historical mean"
              icon="🧠"
              color="#8b5cf6"
            />
            <div className="glass card-hover animate-fade-in" style={{ borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', alignSelf: 'flex-start' }}>
                Anomaly Score
              </div>
              <ScoreGauge score={summary.current_anomaly_score} size={90} />
            </div>
            <div className="glass card-hover animate-fade-in" style={{ borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Current Status</div>
              <div style={{ marginBottom: '10px' }}>
                <StatusBadge status={summary.current_status} size="lg" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {summary.total_anomalies} / {summary.total_observations} flagged ({summary.anomaly_rate}%)
              </div>
            </div>
          </div>

          {/* Charts */}
          <TimeSeriesChart observations={obs} targetCol={analysis.target_column} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <AnomalyScoreChart observations={obs} />
            <BaselineChart observations={obs} />
          </div>

          {/* Recent Observations Table */}
          <div className="glass" style={{ borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Observations</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'Value', 'Baseline', 'Deviation', 'Score', 'Status', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {obs.slice(-20).reverse().map((row, i) => (
                    <tr key={i}
                      style={{ borderBottom: '1px solid rgba(30,45,74,0.5)', cursor: row.is_anomaly ? 'pointer' : 'default',
                        background: row.is_anomaly ? `${STATUS_CONFIG[row.status]?.bg}` : 'transparent',
                        transition: 'background 0.15s' }}
                      onClick={() => row.is_anomaly && setSelectedAnomaly(row)}
                    >
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.date || `#${row.index + 1}`}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.value.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: '#8b5cf6' }}>{row.baseline.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', color: Math.abs(row.deviation_pct) > 20 ? STATUS_CONFIG[row.status]?.color : 'var(--text-secondary)' }}>
                        {row.deviation_pct >= 0 ? '+' : ''}{row.deviation_pct.toFixed(1)}%
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                          background: `${STATUS_CONFIG[row.status]?.bg}`, fontSize: '12px', fontWeight: 700,
                          color: STATUS_CONFIG[row.status]?.color
                        }}>
                          {row.anomaly_score.toFixed(0)}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={row.status} size="sm" /></td>
                      <td style={{ padding: '10px 12px' }}>
                        {row.is_anomaly && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedAnomaly(row); }}
                            style={{
                              padding: '4px 10px', borderRadius: '6px', border: `1px solid ${STATUS_CONFIG[row.status]?.border}`,
                              background: 'transparent', color: STATUS_CONFIG[row.status]?.color,
                              fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !analysis && (
        <div className="glass animate-fade-in" style={{ borderRadius: '16px' }}>
          <EmptyState
            icon="🔍"
            title="No Analysis Yet"
            description="Load a demo dataset or upload your CSV, select a metric, then click 'Run Analysis' to start anomaly detection."
          />
        </div>
      )}

      {/* Detail Modal */}
      {selectedAnomaly && (
        <AnomalyDetail anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
      )}
    </div>
  );
}
