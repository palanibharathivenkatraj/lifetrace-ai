import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState, Card, SectionTitle } from '../components/UI';
import { Database, FileText, Clock, BarChart2 } from 'lucide-react';

export default function Datasets() {
  const { sessions, fetchSessions, handleLoadDemo, domain } = useApp();

  useEffect(() => { fetchSessions(); }, []);

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          Datasets & Sessions
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          All analysis sessions with their dataset info.
        </p>
      </div>

      {/* Demo datasets */}
      <Card style={{ marginBottom: '24px' }}>
        <SectionTitle subtitle="Click to load a pre-built demo dataset for any domain">
          🎯 Available Demo Datasets
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { id: 'household', icon: '🏠', label: 'Household', metrics: 'Electricity, Water, Expense', rows: 180 },
            { id: 'vehicle', icon: '🚗', label: 'Vehicle', metrics: 'Distance, Fuel, Engine Temp', rows: 180 },
            { id: 'business', icon: '💼', label: 'Business', metrics: 'Sales, Orders, Revenue', rows: 180 },
            { id: 'agriculture', icon: '🌿', label: 'Agriculture', metrics: 'Soil, Temp, Humidity, Water', rows: 180 },
            { id: 'industry', icon: '🏭', label: 'Industry', metrics: 'Temp, Vibration, Pressure, Energy', rows: 180 },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => handleLoadDemo(d.id)}
              style={{
                background: domain === d.id ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
                border: `1px solid ${domain === d.id ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                borderRadius: '12px', padding: '16px', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{d.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{d.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{d.metrics}</div>
              <div style={{ fontSize: '11px', color: '#3b82f6' }}>{d.rows} rows • injected anomalies</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Session history */}
      {sessions.length === 0 ? (
        <div className="glass" style={{ borderRadius: '16px' }}>
          <EmptyState icon="🗄️" title="No Sessions Yet" description="Run an analysis to create a session." />
        </div>
      ) : (
        <Card>
          <SectionTitle subtitle={`${sessions.length} analysis sessions`}>Session History</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessions.map((s, i) => (
              <div key={i} className="card-hover" style={{
                background: 'var(--bg-card)', borderRadius: '10px', padding: '14px 16px',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={18} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {s.filename || `${s.domain} demo`}
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({s.source})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Domain: {s.domain} · Target: {s.target_column} · {s.total_rows} rows
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: s.critical_count > 0 ? '#ef4444' : '#f59e0b' }}>
                    {s.anomaly_count} anomalies
                  </div>
                  {s.critical_count > 0 && (
                    <div style={{ fontSize: '11px', color: '#ef4444' }}>{s.critical_count} critical</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {s.created_at?.slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
