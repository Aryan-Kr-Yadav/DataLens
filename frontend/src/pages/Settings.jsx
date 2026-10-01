import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Cpu, Shield, HardDrive, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [privacy, setPrivacy] = useState({
    columnNames: true,
    dataTypes: true,
    descriptions: true,
    sampleValues: false
  });

  const togglePrivacy = (key) => setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-surface border-b border-border sticky top-0 z-10 px-6 pt-6 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <SettingsIcon className="text-secondary-text" size={24} />
            <h1 className="text-2xl font-bold text-text">Settings</h1>
          </div>
          <p className="text-sm text-secondary-text mb-6">Manage application preferences, AI connectivity, and data privacy policies.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-10">
        
        {/* Appearance */}
        <section>
          <h2 className="flex items-center text-sm font-bold text-muted uppercase tracking-wider mb-4">
            <Palette size={16} className="mr-2" /> Appearance
          </h2>
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {['Dark', 'Light', 'System'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t.toLowerCase())}
                  className={clsx(
                    "py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    theme === t.toLowerCase() ? "bg-accent/10 border-accent text-accent" : "bg-background border-border text-secondary-text hover:border-strong-border hover:text-text"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {theme === 'system' && (
              <p className="mt-4 text-xs text-muted">
                System mode currently resolves to: <span className="font-bold uppercase">{resolvedTheme}</span>
              </p>
            )}
          </div>
        </section>

        {/* AI Configuration */}
        <section>
          <h2 className="flex items-center text-sm font-bold text-muted uppercase tracking-wider mb-4">
            <Cpu size={16} className="mr-2" /> AI Configuration
          </h2>
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Provider</label>
                <div className="bg-background border border-border rounded-lg px-4 py-2.5 text-text font-medium">Groq</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Model</label>
                <div className="bg-background border border-border rounded-lg px-4 py-2.5 text-text font-medium font-mono text-sm">openai/gpt-oss-120b</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Status</label>
                <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2.5 text-success font-medium flex items-center">
                  <span className="w-2 h-2 rounded-full bg-success mr-2"></span> Connected
                </div>
              </div>
            </div>
            <div className="p-6 bg-secondary-card">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">API Key</label>
              <input type="password" value="****************************************" disabled className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none opacity-70 cursor-not-allowed font-mono text-sm" />
              <p className="text-xs text-secondary-text mt-2">API key is managed securely via backend environment variables.</p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="flex items-center text-sm font-bold text-muted uppercase tracking-wider mb-4">
            <Shield size={16} className="mr-2" /> Privacy Policies
          </h2>
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 space-y-6">
            {[
              { id: 'columnNames', label: 'Share Column Names', desc: 'Allow the LLM to read the exact names of your columns to write accurate Pandas queries.' },
              { id: 'dataTypes', label: 'Share Data Types', desc: 'Allow the LLM to know the inferred data types (e.g. numeric, string) of each column.' },
              { id: 'descriptions', label: 'Share Descriptions', desc: 'Include your custom column descriptions in the LLM prompt for better context.' },
              { id: 'sampleValues', label: 'Share Sample Values', desc: 'Send 3-5 rows of raw data to the LLM. WARNING: This exposes actual dataset content.' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="pr-8">
                  <div className="text-sm font-medium text-text mb-1">{item.label}</div>
                  <div className="text-xs text-secondary-text">{item.desc}</div>
                </div>
                <button 
                  onClick={() => togglePrivacy(item.id)}
                  className={clsx(
                    "w-12 h-6 rounded-full relative inline-flex items-center transition-colors focus:outline-none shrink-0",
                    privacy[item.id] ? "bg-accent" : "bg-border"
                  )}
                >
                  <span className={clsx(
                    "inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm",
                    privacy[item.id] ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Local Data */}
        <section className="pb-12">
          <h2 className="flex items-center text-sm font-bold text-muted uppercase tracking-wider mb-4">
            <HardDrive size={16} className="mr-2" /> Local Data
          </h2>
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text mb-1">Local Dataset Folder</div>
              <div className="font-mono text-xs text-secondary-text bg-background border border-border px-2 py-1 rounded inline-block">backend/local_data</div>
            </div>
            <button className="flex items-center space-x-2 bg-raised hover:bg-hover border border-border text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <RefreshCw size={14} /> <span>Refresh</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
