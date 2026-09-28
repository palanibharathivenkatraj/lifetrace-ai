import { STATUS_CONFIG } from '../utils/constants';

export function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
  const sizes = { sm: { fontSize: '11px', padding: '2px 8px' }, md: { fontSize: '12px', padding: '3px 10px' }, lg: { fontSize: '14px', padding: '5px 14px' } };
  const s = sizes[size] || sizes.md;
  return (
    <span style={{
      ...s, borderRadius: '20px', fontWeight: 600, letterSpacing: '0.3px',
      border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
      display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

export function KpiCard({ title, value, subtitle, icon, color = '#3b82f6', trend, loading }) {
  if (loading) {
    return (
      <div className="glass card-hover" style={{ borderRadius: '14px', padding: '20px' }}>
        <div className="shimmer" style={{ height: '14px', borderRadius: '4px', width: '60%', marginBottom: '12px' }} />
        <div className="shimmer" style={{ height: '32px', borderRadius: '4px', width: '40%', marginBottom: '8px' }} />
        <div className="shimmer" style={{ height: '12px', borderRadius: '4px', width: '80%' }} />
      </div>
    );
  }
  return (
    <div className="glass card-hover animate-fade-in" style={{ borderRadius: '14px', padding: '20px', borderColor: `${color}22` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{title}</span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px'
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {value}
      </div>
      {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</div>}
      {trend !== undefined && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 500 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% from baseline
        </div>
      )}
    </div>
  );
}

export function ScoreGauge({ score, size = 120 }) {
  const cfg = STATUS_CONFIG[
    score >= 80 ? 'Critical' : score >= 60 ? 'Anomalous' : score >= 40 ? 'Watch' : 'Normal'
  ];
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={cfg.color} strokeWidth="8"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${cfg.color})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: size > 100 ? '24px' : '18px', fontWeight: 800, color: cfg.color }}>{score.toFixed(0)}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>/ 100</div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ message = 'Processing...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent-blue)',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{message}</div>
    </div>
  );
}

export function EmptyState({ icon = '📊', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px' }}>{description}</div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, subtitle }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{children}</h2>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}

export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={`glass ${className}`} style={{ borderRadius: '14px', padding: '20px', ...style }}>
      {children}
    </div>
  );
}
