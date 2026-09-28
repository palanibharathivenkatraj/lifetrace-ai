import { X, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { StatusBadge, ScoreGauge } from './UI';
import { STATUS_CONFIG } from '../utils/constants';

export default function AnomalyDetail({ anomaly, onClose }) {
  if (!anomaly) return null;

  const { status, anomaly_score, value, baseline, deviation_pct, date, explanation } = anomaly;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
  const isUp = deviation_pct >= 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }} onClick={onClose}>
      <div
        className="glass animate-fade-in"
        style={{
          borderRadius: '20px', padding: '28px', maxWidth: '560px', width: '100%',
          borderColor: cfg.border, position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'color 0.2s'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {status === 'Normal' ? <CheckCircle size={22} color={cfg.color} /> : <AlertTriangle size={22} color={cfg.color} />}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: cfg.color }}>
              {status === 'Normal' ? 'Normal Observation' : 'Anomaly Detected'}
            </div>
            {date && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{date}</div>}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={status} size="lg" />
          </div>
        </div>

        {/* Score + Metrics Row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
          <ScoreGauge score={anomaly_score} size={100} />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MetricItem label="Observed" value={value?.toFixed(2)} color="var(--text-primary)" />
            <MetricItem label="Baseline" value={baseline?.toFixed(2)} color="#8b5cf6" />
            <MetricItem
              label="Deviation"
              value={`${isUp ? '+' : ''}${deviation_pct?.toFixed(1)}%`}
              color={Math.abs(deviation_pct) > 30 ? cfg.color : 'var(--text-secondary)'}
              icon={isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            />
            <MetricItem label="Score" value={`${anomaly_score?.toFixed(0)} / 100`} color={cfg.color} />
          </div>
        </div>

        {/* Explanation */}
        {explanation?.reasons?.length > 0 && (
          <div style={{
            background: 'rgba(59,130,246,0.06)', borderRadius: '12px',
            padding: '16px', marginBottom: '16px', border: '1px solid rgba(59,130,246,0.15)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Why was this flagged?
            </div>
            {explanation.reasons.map((r, i) => (
              <p key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '1.6' }}>
                {r}
              </p>
            ))}
          </div>
        )}

        {/* Action */}
        {explanation?.suggested_action && explanation.suggested_action !== 'No action required.' && (
          <div style={{
            background: `${cfg.bg}`, borderRadius: '12px',
            padding: '14px 16px', border: `1px solid ${cfg.border}`, marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Suggested Verification Action
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {explanation.suggested_action}
            </p>
          </div>
        )}

        {/* Safety note */}
        {explanation?.safety_note && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
            ⚠️ {explanation.safety_note}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricItem({ label, value, color, icon }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {icon}{value}
      </div>
    </div>
  );
}
