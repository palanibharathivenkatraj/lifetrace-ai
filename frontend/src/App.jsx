import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import AnomalyHistory from './pages/AnomalyHistory';
import Datasets from './pages/Datasets';
import ModelInfo from './pages/ModelInfo';
import Settings from './pages/Settings';

function AppContent() {
  const { activePage } = useApp();

  const pages = {
    dashboard: <Dashboard />,
    analysis: <Analysis />,
    anomalies: <AnomalyHistory />,
    datasets: <Datasets />,
    model: <ModelInfo />,
    settings: <Settings />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
        {pages[activePage] || <Dashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />
    </AppProvider>
  );
}
