import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, Database } from 'lucide-react';
import { clsx } from 'clsx';

export default function DataQuality() {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!activeDataset) return;
    api.getDataQuality(activeDataset.dataset_id)
       .then(setQuality)
       .catch(err => {
         console.error(err);
         setError("Failed to analyze data quality. The dataset session may have expired.");
       })
       .finally(() => setLoading(false));
  }, [activeDataset, navigate]);

  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Dataset Active</h2>
        <p className="text-secondary-text mb-6 max-w-md">
          Load a dataset from the library to inspect its quality and missing values.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium shadow transition-colors"
        >
          Go to Dataset Library
        </button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-10 h-10 border-4 border-warning/20 border-t-warning rounded-full animate-spin mb-4"></div>
      <div className="text-warning font-medium animate-pulse">Inspecting dataset quality...</div>
    </div>
  );

  if (error || !quality) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Error Analyzing Quality</h2>
        <p className="text-secondary-text mb-6 max-w-md">{error || "Failed to analyze data quality."}</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium shadow transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const getHealthColor = (score) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'missing', label: 'Missing Data' },
    { id: 'issues', label: 'Issues & Warnings' }
  ];

  return (
    <div data-page="quality" className="flex flex-col h-full overflow-y-auto">
      <div className="bg-surface border-b border-border sticky top-0 z-10 px-6 pt-6 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldCheck className="text-success" size={24} />
            <h1 className="text-2xl font-bold text-text">Data Quality</h1>
          </div>
          <p className="text-sm text-secondary-text mb-6">A heuristic overview of completeness, consistency and potential issues.</p>
          
          <div className="flex space-x-6">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={clsx(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === t.id ? "border-accent text-accent" : "border-transparent text-secondary-text hover:text-text hover:border-strong-border"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Health Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="72" fill="transparent" stroke="var(--color-border)" strokeWidth="8" />
                    <circle 
                      cx="80" cy="80" r="72" 
                      fill="transparent" 
                      stroke={getHealthColor(quality.health_score)} 
                      strokeWidth="8" 
                      strokeDasharray={`${(quality.health_score / 100) * 452} 452`} 
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-text block leading-none">{quality.health_score}</span>
                    <span className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">/ 100</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text">Dataset Health</h3>
                <span className="text-sm font-medium text-secondary-text mt-1">
                  {quality.health_score >= 90 ? 'Excellent' : quality.health_score >= 70 ? 'Needs Attention' : 'Critical Issues'}
                </span>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center">
                    <Database size={14} className="mr-2" /> Completeness
                  </div>
                  <div className="text-3xl font-extrabold text-text mb-1">
                    {(100 - quality.metrics.missing_percentage).toFixed(1)}%
                  </div>
                  <div className="text-sm text-secondary-text">
                    {formatNumber(quality.metrics.missing_values)} missing cells overall
                  </div>
                </div>
                
                <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center">
                    <AlertTriangle size={14} className="mr-2" /> Duplicates
                  </div>
                  <div className="text-3xl font-extrabold text-text mb-1">
                    {formatNumber(quality.metrics.duplicate_rows)}
                  </div>
                  <div className="text-sm text-secondary-text">
                    identical rows detected
                  </div>
                </div>

                <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center">
                    <AlertCircle size={14} className="mr-2" /> Issue Columns
                  </div>
                  <div className="text-3xl font-extrabold text-text mb-1">
                    {quality.columns.filter(c => c.issues.length > 0).length}
                  </div>
                  <div className="text-sm text-secondary-text">
                    columns have warnings
                  </div>
                </div>
                
                <div className="bg-surface border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2 flex items-center">
                    <Info size={14} className="mr-2" /> Recommendations
                  </div>
                  <div className="text-3xl font-extrabold text-text mb-1">
                    {quality.recommendations.length}
                  </div>
                  <div className="text-sm text-secondary-text">
                    suggested actions
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {quality.recommendations.length > 0 && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-accent mb-4 flex items-center">
                  <AlertCircle size={18} className="mr-2" /> Actionable Recommendations
                </h3>
                <ul className="space-y-3">
                  {quality.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start text-sm text-text">
                      <span className="text-accent mr-3 mt-1">•</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'missing' && (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary-card border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Column</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Missing Count</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text w-1/3">Missing %</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quality.columns.sort((a,b) => b.missing - a.missing).map((col, idx) => {
                  // Assuming backend doesn't explicitly return missing % per column, estimate if not there.
                  // Wait, quality.metrics.missing_percentage is overall. Let's assume total rows from elsewhere or just show relative.
                  // If we don't have total rows easily accessible here, we'll just show the raw count and a relative bar based on the max missing.
                  const maxMissing = Math.max(...quality.columns.map(c => c.missing));
                  const relativePct = maxMissing > 0 ? (col.missing / maxMissing) * 100 : 0;
                  
                  return (
                    <tr key={idx} className="hover:bg-hover transition-colors">
                      <td className="px-6 py-4 font-medium text-text">{col.column}</td>
                      <td className="px-6 py-4 text-text">{col.missing > 0 ? formatNumber(col.missing) : 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center w-full max-w-xs space-x-3">
                          <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-error rounded-full" style={{ width: `${relativePct}%` }}></div>
                          </div>
                          <span className="text-xs text-secondary-text min-w-[3ch]">
                            {col.missing > 0 ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {col.missing > 0 ? (
                          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-error/10 text-error rounded border border-error/20">
                            Warning
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-success/10 text-success rounded border border-success/20">
                            Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary-card border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Column</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Data Type</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Unique Values</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Detected Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quality.columns.filter(c => c.issues.length > 0).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted">No specific column issues detected.</td>
                  </tr>
                ) : (
                  quality.columns.filter(c => c.issues.length > 0).map((col, idx) => (
                    <tr key={idx} className="hover:bg-hover transition-colors">
                      <td className="px-6 py-4 font-medium text-text">{col.column}</td>
                      <td className="px-6 py-4 font-mono text-xs text-secondary-text">{col.type}</td>
                      <td className="px-6 py-4 text-text">{formatNumber(col.unique)}</td>
                      <td className="px-6 py-4 text-warning font-medium">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle size={14} />
                          <span>{col.issues.join(', ')}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
