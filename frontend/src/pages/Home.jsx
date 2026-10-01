import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Folder, Search, CheckCircle2, ChevronRight, HardDrive } from 'lucide-react';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { clsx } from 'clsx';

export default function Home() {
  const [localFiles, setLocalFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { setActiveDataset } = useDataset();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocalFiles();
  }, []);

  const fetchLocalFiles = async () => {
    try {
      const data = await api.listLocalDatasets();
      setLocalFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadDataset(file);
      setActiveDataset(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalFileLoad = async (filename) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.loadLocalDataset(filename);
      setActiveDataset(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load local file");
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = localFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-full">
      <div className="mb-10 mt-6">
        <h1 className="text-3xl font-semibold mb-2 text-text">Datasets</h1>
        <p className="text-muted text-sm">Securely load and manage your local CSV datasets.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-8 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
          <div className="text-accent font-medium animate-pulse">Reading CSV and extracting schema locally...</div>
        </div>
      )}

      {!loading && (
        <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col min-h-[400px]">
          <div className="flex border-b border-border px-4">
            <button
              onClick={() => setActiveTab('local')}
              className={clsx(
                "px-5 py-3.5 text-sm font-medium border-b-2 transition-colors flex items-center",
                activeTab === 'local' ? "border-accent text-accent" : "border-transparent text-secondary-text hover:text-text"
              )}
            >
              <HardDrive size={16} className="mr-2" />
              Local Files
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "px-5 py-3.5 text-sm font-medium border-b-2 transition-colors flex items-center",
                activeTab === 'upload' ? "border-accent text-accent" : "border-transparent text-secondary-text hover:text-text"
              )}
            >
              <Upload size={16} className="mr-2" />
              Upload New
            </button>
          </div>

          <div className="flex-1 p-6">
            {activeTab === 'local' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search datasets..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="border border-border rounded-lg overflow-hidden bg-background">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary-card border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-medium text-secondary-text">Filename</th>
                        <th className="px-6 py-3 font-medium text-secondary-text">Size</th>
                        <th className="px-6 py-3 font-medium text-secondary-text">Status</th>
                        <th className="px-6 py-3 font-medium text-secondary-text text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFiles.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-muted">
                            No local files found in local_data directory.
                          </td>
                        </tr>
                      ) : (
                        filteredFiles.map(file => (
                          <tr key={file.name} className="hover:bg-hover transition-colors group">
                            <td className="px-6 py-4 font-medium text-text flex items-center">
                              <Folder size={16} className="text-blue-500 mr-3" />
                              {file.name}
                            </td>
                            <td className="px-6 py-4 text-secondary-text">
                              {(file.size / 1024).toFixed(1)} KB
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-xs text-success bg-success/10 px-2 py-1 rounded w-fit">
                                <CheckCircle2 size={12} className="mr-1" />
                                Ready
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleLocalFileLoad(file.name)}
                                className="text-sm font-medium text-accent hover:text-accent-hover opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end w-full"
                              >
                                Load <ChevronRight size={16} className="ml-1" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-border rounded-xl bg-background/50 hover:bg-hover/30 transition-colors">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-medium text-text mb-1">Upload a CSV file</h3>
                <p className="text-sm text-muted mb-6 text-center max-w-sm">
                  Drag and drop a file here, or click to browse. The dataset will remain locally on your machine.
                </p>
                <label className="bg-accent text-white hover:bg-accent-hover px-5 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-sm shadow">
                  <span>Browse Files</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
