import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DOMAINS } from '../utils/constants';

export default function DataLoader() {
  const { domain, setDomain, handleLoadDemo, handleUpload, loading, dataLoaded, targetColumn, setTargetColumn, numericalColumns, handleAnalyze } = useApp();
  const [file, setFile] = useState(null);
  const [contamination, setContamination] = useState(0.1);

  const onDrop = useCallback(async (accepted) => {
    if (accepted.length === 0) return;
    const f = accepted[0];
    setFile(f);
    await handleUpload(f);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, multiple: false
  });

  const clearFile = () => { setFile(null); };

  return (
    <div className="glass" style={{ borderRadius: '16px', padding: '24px' }}>
      {/* Domain Selector */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Select Domain
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => setDomain(d.id)}
              className={`domain-badge${domain === d.id ? ' selected' : ''}`}
              style={{
                padding: '12px 8px', textAlign: 'center', background: 'transparent',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{d.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: domain === d.id ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>{d.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Demo Button */}
        <button
          onClick={() => handleLoadDemo(domain)}
          disabled={loading}
          style={{
            flex: 1, minWidth: '140px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', borderRadius: '10px', color: 'white',
            fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          ⚡ Load Demo Dataset
        </button>

        {/* CSV Drop Zone */}
        <div
          {...getRootProps()}
          className={`upload-zone${isDragActive ? ' drag-over' : ''}`}
          style={{
            flex: 2, minWidth: '200px', borderRadius: '10px',
            padding: '12px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); clearFile(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {isDragActive ? 'Drop CSV here' : 'Upload CSV or drag & drop'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Analysis Config (shown after data loaded) */}
      {dataLoaded && (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Target column */}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Target Metric</label>
            <select
              value={targetColumn || ''}
              onChange={e => setTargetColumn(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                cursor: 'pointer'
              }}
            >
              {numericalColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Contamination */}
          <div style={{ minWidth: '160px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Sensitivity: {(contamination * 100).toFixed(0)}%
            </label>
            <input
              type="range" min="0.01" max="0.4" step="0.01"
              value={contamination}
              onChange={e => setContamination(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          {/* Run button */}
          <button
            onClick={() => handleAnalyze(contamination)}
            disabled={loading}
            style={{
              padding: '10px 24px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', color: 'white', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '⏳ Running...' : '🔍 Run Analysis'}
          </button>
        </div>
      )}
    </div>
  );
}
