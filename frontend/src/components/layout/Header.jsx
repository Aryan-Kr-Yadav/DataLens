import { useLocation } from 'react-router-dom';
import { useDataset } from '../../context/DatasetContext';
import { Shield, Search, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const PAGE_DETAILS = {
  '/': { title: 'Dataset Library', desc: 'Securely load or manage your local CSV datasets.' },
  '/dashboard': { title: 'Dashboard', desc: 'High-level overview and insights from your dataset.' },
  '/ask': { title: 'Ask Data', desc: 'Ask questions and analyze your dataset.' },
  '/visualize': { title: 'Visualize', desc: 'Explore patterns through interactive charts.' },
  '/quality': { title: 'Data Quality', desc: 'Inspect missing values, duplicates, and anomalies.' },
  '/reports': { title: 'Reports', desc: 'Generate exportable comprehensive analysis summaries.' },
  '/schema': { title: 'Schema', desc: 'Data dictionary and column inference.' },
  '/privacy': { title: 'Privacy Architecture', desc: 'Review data handling and security protocols.' },
  '/settings': { title: 'Settings', desc: 'Configure application preferences and AI connectivity.' },
};

export default function Header() {
  const location = useLocation();
  const { activeDataset } = useDataset();
  
  const current = PAGE_DETAILS[location.pathname] || { title: 'DataLens', desc: '' };

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between shrink-0">
      <div className="flex flex-col justify-center">
        <h1 className="text-base font-semibold text-text leading-snug">{current.title}</h1>
        <p className="text-[13px] text-muted leading-tight">{current.desc}</p>
      </div>

      <div className="flex items-center space-x-5">
        <button 
          onClick={openPalette}
          className="flex items-center space-x-3 bg-raised border border-border px-3 py-1.5 rounded-lg text-secondary-text hover:text-text hover:border-strong-border transition-colors text-sm"
        >
          <Search size={14} />
          <span>Search...</span>
          <div className="flex items-center space-x-0.5 opacity-60 font-mono text-[10px] bg-secondary-card px-1.5 py-0.5 rounded border border-strong-border">
            <span>Ctrl</span><span>K</span>
          </div>
        </button>

        <div className="h-6 w-px bg-border"></div>

        <div className="flex items-center space-x-3 text-[13px]">
          {activeDataset && (
            <div className="flex flex-col items-end mr-2">
              <span className="font-medium text-text max-w-[150px] truncate">{activeDataset.filename}</span>
              <span className="text-[11px] text-muted">Ready</span>
            </div>
          )}

          <div className="flex items-center space-x-1.5 px-2 py-1 bg-success/10 text-success rounded-md border border-success/20" title="Your raw dataset is stored and processed exclusively on your local machine.">
            <Shield size={14} />
            <span className="font-medium">Local Data</span>
          </div>
          
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-accent/10 text-accent rounded-md border border-accent/20">
            <Sparkles size={14} />
            <span className="font-medium">AI Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
