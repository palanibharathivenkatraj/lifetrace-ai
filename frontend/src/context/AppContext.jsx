import { createContext, useContext, useState, useCallback } from 'react';
import { loadDemo, uploadCSV, analyzeData, getAnomalies, getSessions } from '../api/client';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [domain, setDomain] = useState('household');
  const [sessionId, setSessionId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [numericalColumns, setNumericalColumns] = useState([]);
  const [dateColumn, setDateColumn] = useState(null);
  const [targetColumn, setTargetColumn] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [anomalyHistory, setAnomalyHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleLoadDemo = useCallback(async (domainId) => {
    setLoading(true);
    setLoadingMessage('Loading demo dataset...');
    setAnalysis(null);
    setDataLoaded(false);
    try {
      const res = await loadDemo(domainId);
      const data = res.data;
      setSessionId(data.session_id);
      setColumns(data.columns);
      setNumericalColumns(data.numerical_columns);
      setDateColumn(data.date_column);
      setTargetColumn(data.numerical_columns[0]);
      setDomain(domainId);
      setDataLoaded(true);
      toast.success(`Demo dataset loaded: ${data.rows} observations`);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load demo dataset');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpload = useCallback(async (file) => {
    setLoading(true);
    setLoadingMessage('Validating and inspecting CSV...');
    setAnalysis(null);
    setDataLoaded(false);
    try {
      const res = await uploadCSV(file);
      const data = res.data;
      setSessionId(data.session_id);
      setColumns(data.columns);
      setNumericalColumns(data.numerical_columns);
      setDateColumn(data.date_column);
      setTargetColumn(data.numerical_columns[0]);
      setDataLoaded(true);
      if (data.warnings?.length > 0) {
        data.warnings.forEach(w => toast(w, { icon: '⚠️' }));
      }
      toast.success(`CSV uploaded: ${data.rows} rows, ${data.columns.length} columns`);
      return data;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail?.errors) {
        detail.errors.forEach(e => toast.error(e));
      } else {
        toast.error(detail || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async (contaminationOverride) => {
    if (!sessionId || !targetColumn) {
      toast.error('Please load a dataset first');
      return;
    }
    setLoading(true);
    setLoadingMessage('Running Isolation Forest anomaly detection...');
    try {
      const contamination = contaminationOverride ?? 0.1;
      const res = await analyzeData(sessionId, targetColumn, domain, contamination);
      setAnalysis(res.data);
      toast.success(`Analysis complete — ${res.data.summary.total_anomalies} anomalies detected`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [sessionId, targetColumn, domain]);

  const fetchAnomalyHistory = useCallback(async () => {
    try {
      const res = await getAnomalies(200);
      setAnomalyHistory(res.data.anomalies);
    } catch {}
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await getSessions();
      setSessions(res.data.sessions);
    } catch {}
  }, []);

  return (
    <AppContext.Provider value={{
      domain, setDomain,
      sessionId, columns, numericalColumns, dateColumn,
      targetColumn, setTargetColumn,
      analysis, loading, loadingMessage,
      anomalyHistory, sessions, selectedAnomaly, setSelectedAnomaly,
      activePage, setActivePage,
      dataLoaded,
      handleLoadDemo, handleUpload, handleAnalyze,
      fetchAnomalyHistory, fetchSessions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
