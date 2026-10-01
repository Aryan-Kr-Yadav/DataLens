import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { Search, Edit3, Shield, Info, Check } from 'lucide-react';
import { clsx } from 'clsx';

export default function Schema() {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const [schemaData, setSchemaData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (!activeDataset) return;
    
    const loadData = async () => {
      try {
        const [schemaRes, qualityRes] = await Promise.all([
          api.getDatasetSchema(activeDataset.dataset_id),
          api.getDataQuality(activeDataset.dataset_id).catch(() => null) // Fallback if quality fails
        ]);
        
        const cols = schemaRes?.columns || [];
        const merged = cols.map(col => {
          const qCol = qualityRes?.columns?.find(q => q.column === col.name);
          return {
            ...col,
            missing: qCol ? qCol.missing : 0,
            unique: qCol ? qCol.unique : 0,
            shared_with_ai: true // mock state
          };
        });
        
        setSchemaData(merged);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeDataset, navigate]);

  const toggleShare = (name) => {
    setSchemaData(prev => prev.map(c => c.name === name ? { ...c, shared_with_ai: !c.shared_with_ai } : c));
  };

  const handleDescriptionChange = (name, val) => {
    setSchemaData(prev => prev.map(c => c.name === name ? { ...c, description: val } : c));
  };

  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)]">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Info className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Dataset Active</h2>
        <p className="text-secondary-text mb-6 max-w-md">
          Load a dataset from the library to view its data dictionary and schema.
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
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4"></div>
      <div className="text-accent font-medium animate-pulse">Loading data dictionary...</div>
    </div>
  );
  if (!schemaData.length) return <div className="p-8 max-w-7xl mx-auto text-error">Failed to load schema.</div>;

  const getTypeCategory = (type) => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('float') || t.includes('numeric')) return 'Numeric';
    if (t.includes('datetime') || t.includes('date')) return 'Date';
    if (t.includes('bool')) return 'Boolean';
    return 'Text';
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const filteredData = schemaData.filter(col => {
    const matchesSearch = col.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filterType === 'Shared with AI') return col.shared_with_ai;
    if (filterType === 'Hidden') return !col.shared_with_ai;
    if (filterType !== 'All') return getTypeCategory(col.type) === filterType;
    return true;
  });

  return (
    <div data-page="schema" className="flex flex-col h-full overflow-y-auto">
      <div className="bg-surface border-b border-border sticky top-0 z-10 px-6 pt-6 shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-text mb-2">Data Dictionary</h1>
          <p className="text-sm text-secondary-text mb-6">Review column definitions, data types, and manage AI access at the column level.</p>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {['All', 'Numeric', 'Text', 'Date', 'Boolean', 'Shared with AI', 'Hidden'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={clsx(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    filterType === f ? "bg-accent text-white" : "bg-raised border border-border text-secondary-text hover:text-text hover:border-strong-border"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search columns..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary-card border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Column</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Type</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Missing</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Unique</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text w-1/3">Description</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text text-center">AI Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted">No columns found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredData.map((col, idx) => (
                    <tr key={idx} className="hover:bg-hover transition-colors group">
                      <td className="px-6 py-4 font-medium text-text">
                        <div className="flex items-center space-x-2">
                          <span>{col.name}</span>
                          {col.role === 'identifier' && (
                            <span title="Potential Identifier" className="text-warning">
                              <Shield size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-background border border-border text-secondary-text font-mono text-[10px] rounded">
                          {col.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text">{formatNumber(col.missing)}</td>
                      <td className="px-6 py-4 text-text">{formatNumber(col.unique)}</td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center">
                          <input 
                            type="text" 
                            value={col.description}
                            onChange={(e) => handleDescriptionChange(col.name, e.target.value)}
                            className="w-full bg-transparent border border-transparent hover:border-border focus:border-accent focus:bg-background rounded px-2 py-1 text-sm text-secondary-text focus:text-text transition-all outline-none"
                            placeholder="Add description..."
                          />
                          <Edit3 size={12} className="absolute right-2 text-muted opacity-0 group-hover:opacity-100 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleShare(col.name)}
                          className={clsx(
                            "w-10 h-5 rounded-full relative inline-flex items-center transition-colors focus:outline-none",
                            col.shared_with_ai ? "bg-accent" : "bg-border"
                          )}
                        >
                          <span className={clsx(
                            "inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform shadow-sm",
                            col.shared_with_ai ? "translate-x-5.5" : "translate-x-1"
                          )} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
