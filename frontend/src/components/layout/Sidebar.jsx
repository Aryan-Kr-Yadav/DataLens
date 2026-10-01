import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, PieChart, ShieldAlert, FileText, Upload, Book, Shield, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useDataset } from '../../context/DatasetContext';

export default function Sidebar() {
  const location = useLocation();
  const { activeDataset } = useDataset();
  
  // Persist sidebar state
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed.toString());
  }, [collapsed]);

  const links = [
    { href: '/', label: 'Load Dataset', icon: Upload },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ask', label: 'Ask Data', icon: MessageSquare },
    { href: '/visualize', label: 'Visualize', icon: PieChart },
    { href: '/quality', label: 'Data Quality', icon: ShieldAlert },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/schema', label: 'Schema', icon: Book },
    { href: '/privacy', label: 'Privacy', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={clsx(
      "bg-surface border-r border-border h-full flex flex-col transition-all duration-200 z-20 shrink-0",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center font-bold text-white text-xs shrink-0">D</div>
            <span className="font-bold text-[15px] text-text truncate">DataLens AI</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "text-muted hover:text-text transition-colors",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        {links.map(link => {
          const active = location.pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              title={collapsed ? link.label : undefined}
              className={clsx(
                "flex items-center rounded-lg transition-colors group relative",
                collapsed ? "justify-center p-2.5" : "px-3 py-2 space-x-3",
                active 
                  ? "bg-accent/10 text-text" 
                  : "text-secondary-text hover:bg-hover hover:text-text"
              )}
            >
              <Icon size={18} className={clsx(
                active ? "text-accent" : "text-secondary-text group-hover:text-text"
              )} />
              {!collapsed && (
                <span className={clsx("text-sm", active ? "font-semibold" : "font-medium")}>
                  {link.label}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-secondary-card text-text text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dataset / Status Area */}
      <div className="p-4 border-t border-border shrink-0 bg-raised/50">
        {activeDataset ? (
          collapsed ? (
            <div className="flex flex-col items-center space-y-3" title={`${activeDataset.filename}\n${activeDataset.rows || 0} rows\nReady`}>
              <div className="w-2 h-2 rounded-full bg-success"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Active Dataset</div>
                <div className="text-sm text-text font-medium truncate" title={activeDataset.filename}>
                  {activeDataset.filename}
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span className="text-secondary-text">Local · Ready</span>
              </div>
            </div>
          )
        ) : (
          !collapsed && <div className="text-xs text-muted">No dataset loaded</div>
        )}

        {/* System Status */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-[11px] text-muted font-medium">
            <div className="flex items-center justify-between">
              <span>Backend</span>
              <div className="flex items-center space-x-1.5 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Groq AI</span>
              <div className="flex items-center space-x-1.5 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
