import { useState } from 'react';
import { Card, SectionTitle } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { domain, setDomain } = useApp();
  const [theme, setTheme] = useState('dark');
  const [units, setUnits] = useState('metric');

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Configure your LifeTrace AI experience.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <SectionTitle>General</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                <option value="dark">Dark (Default)</option>
              </select>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Other themes coming soon.</div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>About LifeTrace AI</SectionTitle>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>Version:</strong> 1.0.0</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>ML Engine:</strong> scikit-learn Isolation Forest</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Backend:</strong> FastAPI + Python 3.14</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Frontend:</strong> React + Vite + Tailwind CSS</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Database:</strong> SQLite</p>
            <br />
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              LifeTrace AI is a statistical anomaly detection tool. It does not diagnose medical conditions, guarantee the identification of physical faults, or replace professional expertise.
            </p>
          </div>
        </Card>

        <Card>
          <SectionTitle>CSV Upload Format</SectionTitle>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <p>Your CSV file should follow this structure:</p>
            <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
              <li>First column: date or timestamp (optional)</li>
              <li>Remaining columns: numeric values</li>
              <li>Header row required</li>
              <li>Minimum 5 rows of data</li>
              <li>Missing values are automatically interpolated</li>
            </ul>
            <div style={{ marginTop: '12px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '10px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#10b981' }}>
              date,electricity_kwh,water_liters<br />
              2024-01-01,184,120<br />
              2024-01-02,191,118<br />
              2024-01-03,188,125<br />
              2024-01-04,327,190
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>API Endpoints</SectionTitle>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', lineHeight: '2' }}>
            <div><span style={{ color: '#10b981' }}>GET</span>  /api/health</div>
            <div><span style={{ color: '#3b82f6' }}>POST</span> /api/upload</div>
            <div><span style={{ color: '#3b82f6' }}>POST</span> /api/analyze</div>
            <div><span style={{ color: '#10b981' }}>GET</span>  /api/demo/{'{domain}'}</div>
            <div><span style={{ color: '#10b981' }}>GET</span>  /api/anomalies</div>
            <div><span style={{ color: '#10b981' }}>GET</span>  /api/sessions</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <a href="/docs" target="_blank"
              style={{ fontSize: '13px', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
              📖 View API Documentation →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
