import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, ComposedChart, Scatter
} from 'recharts';
import { CHART_COLORS, STATUS_CONFIG } from '../utils/constants';
import { Card, SectionTitle } from './UI';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass" style={{ borderRadius: '10px', padding: '12px 16px', fontSize: '12px', minWidth: '160px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnomalyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const status = d?.status || 'Normal';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
  return (
    <div className="glass" style={{ borderRadius: '10px', padding: '12px 16px', fontSize: '12px', border: `1px solid ${cfg.border}` }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <span style={{ color: CHART_COLORS.value }}>Value</span>
        <span style={{ fontWeight: 700 }}>{d?.value?.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <span style={{ color: '#8b5cf6' }}>Baseline</span>
        <span>{d?.baseline?.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <span>Score</span>
        <span style={{ color: cfg.color, fontWeight: 700 }}>{d?.anomaly_score?.toFixed(0)}/100</span>
      </div>
      <div style={{ marginTop: '6px' }}>
        <span style={{ ...cfg, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, border: `1px solid ${cfg.border}` }}>
          {status}
        </span>
      </div>
    </div>
  );
};

function buildChartData(observations, targetCol) {
  return observations.map((obs, i) => ({
    label: obs.date || `#${i + 1}`,
    value: obs.value,
    baseline: obs.baseline,
    baseline_lower: obs.baseline_lower,
    baseline_upper: obs.baseline_upper,
    anomaly_score: obs.anomaly_score,
    deviation_pct: obs.deviation_pct,
    is_anomaly: obs.is_anomaly,
    status: obs.status,
    dot: obs.is_anomaly ? obs.value : null,
  }));
}

export function TimeSeriesChart({ observations, targetCol }) {
  const data = buildChartData(observations, targetCol);

  return (
    <Card style={{ marginBottom: '16px' }}>
      <SectionTitle subtitle="Observed values with detected anomaly markers">
        📈 Time Series — {targetCol}
      </SectionTitle>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip content={<AnomalyTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />

          {/* Normal range band */}
          <Area dataKey="baseline_upper" stroke="none" fill="rgba(139,92,246,0.08)" name="Upper bound" legendType="none" />
          <Area dataKey="baseline_lower" stroke="none" fill="var(--bg-primary)" name="Lower bound" legendType="none" />

          {/* Baseline */}
          <Line dataKey="baseline" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Baseline" />

          {/* Value */}
          <Line
            dataKey="value"
            stroke={CHART_COLORS.value}
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload.is_anomaly) return <circle key={cx} cx={cx} cy={cy} r={0} />;
              const cfg = STATUS_CONFIG[payload.status] || STATUS_CONFIG.Critical;
              return (
                <circle key={cx} cx={cx} cy={cy} r={5} fill={cfg.color}
                  stroke={cfg.color} strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 4px ${cfg.color})` }} />
              );
            }}
            activeDot={{ r: 5 }}
            name="Observed"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function AnomalyScoreChart({ observations }) {
  const data = buildChartData(observations);

  return (
    <Card style={{ marginBottom: '16px' }}>
      <SectionTitle subtitle="Normalized anomaly score (0–100). Above 60 = flagged.">
        🎯 Anomaly Score Timeline
      </SectionTitle>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Watch', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          <ReferenceLine y={60} stroke="#f97316" strokeDasharray="4 2" label={{ value: 'Anomalous', position: 'right', fontSize: 10, fill: '#f97316' }} />
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Critical', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          <Bar dataKey="anomaly_score" name="Anomaly Score"
            fill="#f59e0b"
            radius={[3, 3, 0, 0]}
            cell={(entry) => {
              const score = entry.anomaly_score || 0;
              const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#f59e0b' : '#10b981';
              return <rect fill={color} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function BaselineChart({ observations }) {
  const data = buildChartData(observations);
  return (
    <Card style={{ marginBottom: '16px' }}>
      <SectionTitle subtitle="Learned normal range vs. observed deviation">
        📊 Baseline & Normal Range
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
          <Area dataKey="baseline_upper" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} name="Upper" />
          <Area dataKey="baseline_lower" fill="var(--bg-primary)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} name="Lower" />
          <Line dataKey="baseline" stroke="#3b82f6" strokeWidth={2} dot={false} name="Baseline" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
