import { useApp } from '../context/AppContext';
import { DOMAINS } from '../utils/constants';
import {
  LayoutDashboard, BarChart2, AlertTriangle, Database,
  Info, Settings, Activity, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'anomalies', label: 'Anomaly History', icon: AlertTriangle },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'model', label: 'Model Info', icon: Info },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activePage, setActivePage, domain, analysis } = useApp();

  const domainInfo = DOMAINS.find(d => d.id === domain);

  return (
    <aside style={{
      width: '240px', minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }} className="gradient-text">
              LifeTrace AI
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Anomaly Detection
            </div>
          </div>
        </div>
      </div>

      {/* Domain Badge */}
      {domainInfo && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Domain
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '8px', padding: '8px 10px'
          }}>
            <span style={{ fontSize: '18px' }}>{domainInfo.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{domainInfo.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{domainInfo.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* ML Status */}
      {analysis && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>Model Active</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {analysis.summary.total_anomalies} anomalies in {analysis.summary.total_observations} obs.
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item${isActive ? ' active' : ''}`}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', marginBottom: '2px', background: 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={18} />
              {item.label}
              {item.id === 'anomalies' && analysis?.summary.total_anomalies > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent-red)',
                  color: 'white', fontSize: '10px', borderRadius: '10px',
                  padding: '1px 6px', fontWeight: 700
                }}>
                  {analysis.summary.total_anomalies}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-muted)'
        }}>
          <Zap size={12} />
          Isolation Forest v1.9
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Statistical anomaly detection
        </div>
      </div>
    </aside>
  );
}
