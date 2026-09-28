import { useApp } from '../context/AppContext';
import { Card, SectionTitle, EmptyState } from '../components/UI';

function MetricBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div className="glass" style={{ borderRadius: '14px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{children}</div>
    </div>
  );
}

export default function ModelInfo() {
  const { analysis } = useApp();
  const modelInfo = analysis?.model_info;
  const evaluation = analysis?.evaluation;

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          Model Information
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          How LifeTrace AI detects anomalies and evaluates performance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <InfoCard icon="🌲" title="What is Isolation Forest?">
          <p>Isolation Forest is an unsupervised machine learning algorithm that detects anomalies by isolating observations. Unlike most algorithms that profile normal data, Isolation Forest explicitly identifies anomalies.</p>
          <br />
          <p>It builds a collection of random decision trees. Anomalies are isolated closer to the root of the tree (fewer splits needed), resulting in shorter path lengths. Normal observations require more splits to isolate and have longer path lengths.</p>
          <br />
          <p><strong style={{ color: 'var(--accent-blue)' }}>Key property:</strong> Anomalies are few and different — they're easier to isolate than normal points.</p>
        </InfoCard>

        <InfoCard icon="📈" title="How Baseline is Learned">
          <p>LifeTrace AI computes a rolling baseline from historical observations using an expanding window. As more data accumulates, the baseline becomes more stable and representative.</p>
          <br />
          <p>The baseline includes:</p>
          <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
            <li>Rolling mean (expected value)</li>
            <li>Rolling standard deviation (variability range)</li>
            <li>Upper and lower confidence bands (mean ± 1.5σ)</li>
          </ul>
          <br />
          <p>Early observations use whatever data is available (minimum 3 points).</p>
        </InfoCard>

        <InfoCard icon="🔧" title="Feature Engineering">
          <p>Before training, the system engineers time-series features from raw values:</p>
          <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Lag features:</strong> Previous 1–3 values</li>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Rolling mean:</strong> Short (3-point) & long window</li>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Rolling std:</strong> Variance around mean</li>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Z-score:</strong> Deviation from rolling mean</li>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Pct change:</strong> Rate of change</li>
            <li><strong style={{ color: 'var(--accent-cyan)' }}>Time features:</strong> Day, week, month</li>
          </ul>
          <br />
          <p>All features are normalized before feeding to the model.</p>
        </InfoCard>

        <InfoCard icon="🎯" title="Anomaly Score (0–100)">
          <p>The raw Isolation Forest score is normalized to a 0–100 scale:</p>
          <br />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: '0 – 39', status: 'Normal', color: '#10b981' },
              { label: '40 – 59', status: 'Watch', color: '#f59e0b' },
              { label: '60 – 79', status: 'Anomalous', color: '#f97316' },
              { label: '80 – 100', status: 'Critical', color: '#ef4444' },
            ].map(s => (
              <div key={s.status} style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ fontSize: '12px', color: s.color, fontWeight: 700 }}>{s.status}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p>Thresholds are applied to the model's normalized distribution — not fixed on raw values.</p>
        </InfoCard>
      </div>

      {/* Evaluation metrics (shown when analysis done) */}
      {evaluation ? (
        <Card style={{ marginBottom: '24px' }}>
          <SectionTitle subtitle={evaluation.note}>📊 Model Evaluation Metrics</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Precision', value: evaluation.precision, color: '#3b82f6' },
              { label: 'Recall', value: evaluation.recall, color: '#8b5cf6' },
              { label: 'F1 Score', value: evaluation.f1_score, color: '#06b6d4' },
              { label: 'Accuracy', value: evaluation.accuracy, color: '#10b981' },
            ].map(m => (
              <div key={m.label} className="glass" style={{ borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: m.color, marginBottom: '4px' }}>
                  {(m.value * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'True Positives', value: evaluation.true_positives, color: '#10b981' },
              { label: 'False Positives', value: evaluation.false_positives, color: '#f97316' },
              { label: 'False Negatives', value: evaluation.false_negatives, color: '#ef4444' },
              { label: 'True Negatives', value: evaluation.true_negatives, color: '#3b82f6' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="glass animate-fade-in" style={{ borderRadius: '16px', marginBottom: '24px' }}>
          <EmptyState
            icon="📐"
            title="No Evaluation Data Yet"
            description="Run an analysis to compute model evaluation metrics on the active dataset."
          />
        </div>
      )}

      {/* Model params */}
      {modelInfo && (
        <Card style={{ marginBottom: '24px' }}>
          <SectionTitle>⚙️ Model Configuration</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Algorithm', value: 'Isolation Forest' },
              { label: 'Estimators', value: modelInfo.n_estimators },
              { label: 'Contamination', value: `${(modelInfo.contamination * 100).toFixed(0)}%` },
              { label: 'Features Used', value: modelInfo.feature_count },
              { label: 'Total Obs.', value: modelInfo.total_observations },
              { label: 'Anomalies Found', value: modelInfo.anomalies_detected },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-blue)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Features used by the model:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {modelInfo.features_used?.map(f => (
                <span key={f} style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  color: 'var(--accent-blue)', fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Limitations */}
      <InfoCard icon="⚠️" title="Limitations & Safety Note">
        <ul style={{ paddingLeft: '16px' }}>
          <li>LifeTrace AI is a <strong>statistical decision-support tool</strong>, not a diagnostic system.</li>
          <li>An anomaly score is a signal — not proof of a physical fault or medical condition.</li>
          <li>The model learns from whatever data you provide. Poor quality data leads to unreliable results.</li>
          <li>With fewer than 30 observations, the baseline may be unstable.</li>
          <li>Always verify anomalies using domain-specific expertise before taking action.</li>
          <li>Isolation Forest is effective for point anomalies but may miss slow drift patterns.</li>
        </ul>
      </InfoCard>
    </div>
  );
}
