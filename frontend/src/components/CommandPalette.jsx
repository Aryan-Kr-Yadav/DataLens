import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, MessageSquare, PieChart, ShieldAlert, FileText, Upload, Book, Shield, Settings, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const COMMANDS = [
  { id: 'load', title: 'Load Dataset', icon: Upload, path: '/' },
  { id: 'dashboard', title: 'Open Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ask', title: 'Ask Data', icon: MessageSquare, path: '/ask' },
  { id: 'visualize', title: 'Visualize Data', icon: PieChart, path: '/visualize' },
  { id: 'quality', title: 'Open Data Quality', icon: ShieldAlert, path: '/quality' },
  { id: 'report', title: 'Generate Report', icon: FileText, path: '/reports' },
  { id: 'schema', title: 'View Schema', icon: Book, path: '/schema' },
  { id: 'privacy', title: 'View Privacy', icon: Shield, path: '/privacy' },
  { id: 'settings', title: 'Settings', icon: Settings, path: '/settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const openEvent = () => setIsOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', openEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', openEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (cmd) => {
    if (cmd.path) navigate(cmd.path);
    setIsOpen(false);
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div 
        className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleListKeyDown}
      >
        <div className="flex items-center px-4 py-4 border-b border-border">
          <Search size={20} className="text-secondary-text mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent border-none text-text text-lg focus:outline-none focus:ring-0 placeholder:text-muted"
          />
          <div className="flex space-x-1.5 opacity-50 ml-3">
            <span className="text-[10px] bg-secondary-card px-1.5 py-1 rounded border border-strong-border">ESC</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-secondary-text text-sm">
              No commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const selected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    "w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors",
                    selected ? "bg-accent/10 text-text" : "text-secondary-text hover:bg-hover hover:text-text"
                  )}
                >
                  <Icon size={18} className={clsx("mr-3", selected ? "text-accent" : "text-secondary-text")} />
                  <span className="font-medium text-sm">{cmd.title}</span>
                  {selected && (
                    <span className="ml-auto text-[10px] text-accent tracking-widest uppercase font-semibold">
                      Enter
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
