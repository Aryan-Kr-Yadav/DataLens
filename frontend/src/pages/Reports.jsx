import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { Download, FileText, CheckCircle2, Settings2, Code, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';

export default function Reports() {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportHtml, setReportHtml] = useState(null);
  const [error, setError] = useState(null);
  
  // Fake state for UI since backend generates a fixed report currently
  const [sections, setSections] = useState({
    executive: true,
    overview: true,
    schema: true,
    quality: true,
    charts: true,
    privacy: true
  });

  useEffect(() => {
    // We just remove the redirect. 
    // Wait, the hook was: if (!activeDataset) navigate('/');
    // We remove it entirely.
  }, [activeDataset, navigate]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.generateReport(activeDataset.dataset_id);
      setReportHtml(data.report_html);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reportHtml) return;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datalens_report_${activeDataset.filename || 'dataset'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileText className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Dataset Active</h2>
        <p className="text-secondary-text mb-6 max-w-md">
          Load a dataset from the library to generate a comprehensive analysis report.
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

  return (
    <div data-page="reports" className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center space-x-3">
          <FileText size={20} className="text-emerald-500" />
          <h1 className="text-lg font-bold text-text">Report Builder</h1>
        </div>
        {reportHtml && (
          <div className="flex space-x-3">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-2 text-sm bg-raised border border-border hover:bg-hover text-text px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> <span>Regenerate</span>
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center space-x-2 text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              <Download size={14} /> <span>Download HTML</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        
        {/* LEFT: Sections Panel */}
        <div className="w-64 border-r border-border bg-surface p-5 flex flex-col shrink-0 overflow-y-auto">
          <h2 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-4">Report Sections</h2>
          <div className="space-y-3">
            {[
              { id: 'executive', label: 'Executive Summary' },
              { id: 'overview', label: 'Dataset Overview' },
              { id: 'schema', label: 'Schema Dictionary' },
              { id: 'quality', label: 'Data Quality' },
              { id: 'charts', label: 'Analysis Charts' },
              { id: 'privacy', label: 'Privacy Validation' },
            ].map(section => (
              <label key={section.id} className="flex items-center space-x-3 cursor-pointer group">
                <div className={clsx(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  sections[section.id] ? "bg-accent border-accent" : "border-strong-border group-hover:border-accent"
                )}>
                  {sections[section.id] && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-sm text-secondary-text group-hover:text-text transition-colors">{section.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-2">
              <Code size={14} className="text-accent shrink-0 mt-0.5" />
              <p className="text-[11px] text-accent leading-relaxed">
                Currently, the backend generates a fixed comprehensive report containing all sections. Section toggles will be fully supported in the next API update.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Document Preview */}
        <div className="flex-1 bg-background p-6 overflow-y-auto flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full max-w-3xl aspect-[1/1.4] bg-surface border border-border rounded shadow-xl">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <div className="text-emerald-500 font-medium animate-pulse">Compiling Document...</div>
            </div>
          ) : !reportHtml ? (
            <div className="flex flex-col items-center justify-center w-full max-w-3xl aspect-[1/1.4] bg-surface border border-dashed border-border rounded shadow-sm">
              <FileText size={48} className="text-muted mb-4" />
              <div className="text-text font-medium mb-1">No Report Generated</div>
              <p className="text-sm text-secondary-text mb-6">Configure your sections and settings, then generate the document.</p>
              <button
                onClick={handleGenerate}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium shadow transition-colors"
              >
                Generate Report
              </button>
            </div>
          ) : (
            <div className="w-full max-w-[850px] bg-white rounded shadow-2xl overflow-hidden h-[1056px] shrink-0 border border-border/50 flex flex-col">
              <iframe 
                srcDoc={reportHtml} 
                title="Report Preview" 
                className="w-full h-full border-none bg-white"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          )}
          {error && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-error bg-error/10 border border-error/20 p-4 rounded-xl shadow-lg">{error}</div>}
        </div>

        {/* RIGHT: Settings Panel */}
        <div className="w-64 border-l border-border bg-surface p-5 flex flex-col shrink-0 overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-border pb-4 mb-4">
            <Settings2 size={16} className="text-secondary-text" />
            <h2 className="text-[11px] font-bold text-text uppercase tracking-wider">Document Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Report Title</label>
              <input type="text" defaultValue="Dataset Analysis Report" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Subtitle</label>
              <input type="text" defaultValue={`Analysis of ${activeDataset?.filename || 'dataset'}`} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent" />
            </div>
            
            <div className="pt-4 border-t border-border space-y-3">
              <label className="flex items-center space-x-2 text-sm text-secondary-text cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border bg-background text-accent focus:ring-accent" />
                <span>Include Timestamps</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-secondary-text cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border bg-background text-accent focus:ring-accent" />
                <span>Include Methodology</span>
              </label>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              Generate Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
