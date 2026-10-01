import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { 
  MessageSquareText, BarChart3, ShieldCheck, FileText, 
  ArrowRight, Search, Zap, Clock, Shield, AlertTriangle, Lightbulb 
} from 'lucide-react';

export default function Dashboard() {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [schema, setSchema] = useState(null);
  const [quality, setQuality] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!activeDataset) return;
    
    const loadDashboardData = async () => {
      try {
        const [sumData, schemaData, qualData, insData] = await Promise.all([
          api.getDatasetSummary(activeDataset.dataset_id),
          api.getDatasetSchema(activeDataset.dataset_id),
          api.getDataQuality(activeDataset.dataset_id),
          api.getInsights(activeDataset.dataset_id).catch(() => ({ insights: [] }))
        ]);
        
        setSummary(sumData);
        setSchema(schemaData);
        setQuality(qualData);
        setInsights(insData.insights);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. The dataset session may have expired.");
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [activeDataset, navigate]);

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      navigate('/ask', { state: { initialQuestion: question } });
    }
  };

  const handleSuggestionClick = (q) => {
    navigate('/ask', { state: { initialQuestion: q } });
  };

  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <BarChart3 className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Dataset Active</h2>
        <p className="text-secondary-text mb-6 max-w-md">
          Load a dataset from the library to view your dashboard, metrics, and verified insights.
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

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Error Loading Dashboard</h2>
        <p className="text-secondary-text mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium shadow transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  if (loading || !summary || !quality || !schema) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full animate-pulse space-y-8">
        <div className="h-32 bg-surface rounded-xl border border-border"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-surface rounded-xl border border-border"></div>)}
        </div>
        <div className="h-20 bg-surface rounded-xl border border-border"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-2 h-64 bg-surface rounded-xl border border-border"></div>
          <div className="col-span-1 h-64 bg-surface rounded-xl border border-border"></div>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);

  const cols = schema?.columns || [];
  const numCols = cols.filter(c => c.type.includes('int') || c.type.includes('float'));
  const catCols = cols.filter(c => c.type.includes('object') || c.type.includes('string') || c.type.includes('category'));
  const dateCols = cols.filter(c => c.type.includes('datetime'));

  return (
    <div data-page="dashboard" className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* ZONE 1: Dataset Header */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <BarChart3 size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-text">{activeDataset.filename}</h1>
              <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded border border-success/20 flex items-center">
                <Shield size={12} className="mr-1" /> Raw Data Local
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-secondary-text mb-6">
              <span>{summary?.row_count?.toLocaleString()} rows</span>
              <span>•</span>
              <span>{summary?.column_count?.toLocaleString()} columns</span>
              <span>•</span>
              <span className="flex items-center text-success"><span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5"></span>Ready</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => navigate('/visualize')} className="bg-raised border border-border hover:border-strong-border hover:bg-hover text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Visualize
            </button>
            <button onClick={() => navigate('/ask')} className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center">
              <MessageSquareText size={16} className="mr-2" /> Ask Data
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 2: KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Rows", value: summary?.row_count?.toLocaleString() },
          { label: "Columns", value: summary?.column_count },
          { label: "Missing Cells", value: formatNumber(quality.metrics.missing_values) },
          { label: "Duplicates", value: quality.metrics.duplicate_rows },
          { label: "Numeric", value: numCols.length },
          { label: "Health", value: quality.health_score, color: quality.health_score > 80 ? 'text-success' : 'text-warning' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-center shadow-sm hover:border-strong-border transition-colors">
            <div className={`text-2xl font-bold font-mono tracking-tight mb-1 ${kpi.color || 'text-text'}`}>
              {kpi.value}
            </div>
            <div className="text-[11px] text-muted uppercase tracking-wider font-semibold">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ZONE 3: Quick Ask */}
      <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
        <form onSubmit={handleAskSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this dataset..." 
            className="w-full bg-background border border-border rounded-lg pl-12 pr-24 py-4 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner text-lg placeholder:text-secondary-text"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-accent hover:bg-accent-hover text-white px-4 rounded-md font-medium text-sm transition-colors"
          >
            Analyze <span className="ml-1 text-[10px] opacity-70">↵</span>
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Average numeric values?", "Which column has missing data?", "Show me the top 5 rows."].map((s, idx) => (
            <button 
              key={idx}
              onClick={() => handleSuggestionClick(s)}
              className="bg-raised border border-border text-secondary-text hover:text-text hover:border-strong-border px-3 py-1.5 rounded-full text-xs transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* ZONE 5: Verified Insights (Takes 2/3 space) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[300px]">
            <div className="flex items-center space-x-2 mb-6 border-b border-border pb-4">
              <Zap size={18} className="text-warning" />
              <h2 className="text-lg font-bold text-text">Verified Insights</h2>
            </div>
            
            <div className="space-y-4">
              {insights && insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-raised border border-border rounded-lg hover:border-strong-border transition-colors">
                    <div className="flex items-start space-x-3 mb-2 md:mb-0">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb size={14} className="text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-text text-sm mb-1">{insight.title}</div>
                        <div className="text-secondary-text text-xs leading-relaxed max-w-md">{insight.description}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-secondary-text text-sm">
                  Run analyses in Ask Data to generate verified insights.
                </div>
              )}
            </div>
          </div>

          {/* ZONE 4: Dataset Snapshot */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-6 border-b border-border pb-4">Dataset Snapshot</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-3 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Numeric ({numCols.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {numCols.slice(0, 8).map(c => <span key={c.name} className="px-2 py-1 bg-background border border-border rounded text-xs text-secondary-text">{c.name}</span>)}
                  {numCols.length > 8 && <span className="px-2 py-1 text-xs text-muted">+{numCols.length - 8} more</span>}
                </div>
              </div>
              
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-3 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div> Categorical ({catCols.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catCols.slice(0, 8).map(c => <span key={c.name} className="px-2 py-1 bg-background border border-border rounded text-xs text-secondary-text">{c.name}</span>)}
                  {catCols.length > 8 && <span className="px-2 py-1 text-xs text-muted">+{catCols.length - 8} more</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* ZONE 6: Data Health */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-6 border-b border-border pb-4">Data Health</h2>
            
            <div className="flex flex-col items-center mb-8">
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-border)" strokeWidth="8" />
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke={quality.health_score > 80 ? 'var(--color-success)' : 'var(--color-warning)'} strokeWidth="8" strokeDasharray={`${(quality.health_score / 100) * 351} 351`} className="transition-all duration-1000" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-text block leading-none">{quality.health_score}</span>
                </div>
              </div>
              <span className="text-sm font-medium mt-3 text-secondary-text">
                {quality.health_score > 80 ? 'Good Condition' : 'Needs Attention'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary-text">Missing Values</span>
                  <span className="text-text font-medium">{quality.metrics.missing_percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: `${Math.min(100, quality.metrics.missing_percentage)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary-text">Duplicates</span>
                  <span className="text-text font-medium">{quality.metrics.duplicate_rows > 0 ? quality.metrics.duplicate_rows : '0'}</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: quality.metrics.duplicate_rows > 0 ? '10%' : '0%' }}></div>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/quality')} className="w-full mt-6 bg-raised hover:bg-hover border border-border hover:border-strong-border text-sm font-medium py-2.5 rounded-lg transition-colors text-text">
              Open Data Quality
            </button>
          </div>

          {/* ZONE 8: Quick Actions */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-6 border-b border-border pb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/ask')} className="p-3 bg-background border border-border rounded-lg hover:border-accent hover:bg-accent/5 text-left transition-colors group">
                <MessageSquareText size={18} className="text-blue-500 mb-2" />
                <span className="text-xs font-medium text-text group-hover:text-accent">Ask Data</span>
              </button>
              <button onClick={() => navigate('/visualize')} className="p-3 bg-background border border-border rounded-lg hover:border-purple-500 hover:bg-purple-500/5 text-left transition-colors group">
                <BarChart3 size={18} className="text-purple-500 mb-2" />
                <span className="text-xs font-medium text-text group-hover:text-purple-400">Create Chart</span>
              </button>
              <button onClick={() => navigate('/quality')} className="p-3 bg-background border border-border rounded-lg hover:border-orange-500 hover:bg-orange-500/5 text-left transition-colors group">
                <ShieldCheck size={18} className="text-orange-500 mb-2" />
                <span className="text-xs font-medium text-text group-hover:text-orange-400">Check Quality</span>
              </button>
              <button onClick={() => navigate('/reports')} className="p-3 bg-background border border-border rounded-lg hover:border-emerald-500 hover:bg-emerald-500/5 text-left transition-colors group">
                <FileText size={18} className="text-emerald-500 mb-2" />
                <span className="text-xs font-medium text-text group-hover:text-emerald-400">Build Report</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
