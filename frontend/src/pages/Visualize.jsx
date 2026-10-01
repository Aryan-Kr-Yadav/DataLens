import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Baseline, Download, Maximize, Settings2, Sparkles, Filter } from 'lucide-react';
import { clsx } from 'clsx';

const COLORS = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-info)', 'var(--color-accent-hover)'];

export default function Visualize() {
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [aggregation, setAggregation] = useState('mean');
  const [chartType, setChartType] = useState('bar');
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (!activeDataset) return;
    api.getDatasetSchema(activeDataset.dataset_id).then(setSchema).catch(console.error);
  }, [activeDataset, navigate]);

  const handleVisualize = async () => {
    if (!xAxis) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.createVisualization(activeDataset.dataset_id, {
        x_axis: xAxis,
        y_axis: yAxis,
        aggregation: chartType === 'histogram' ? 'none' : aggregation,
        chart_type: chartType
      });
      setChartData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendation = () => {
    if (schema?.columns) {
      const catCol = schema.columns.find(c => c.type.includes('object') || c.type.includes('string'));
      const numCol = schema.columns.find(c => c.type.includes('int') || c.type.includes('float'));
      if (catCol && numCol) {
        setXAxis(catCol.name);
        setYAxis(numCol.name);
        setChartType('bar');
        setAggregation('sum');
      }
    }
  };

  const renderChart = () => {
    if (loading) return (
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4"></div>
        <div className="text-accent font-medium animate-pulse">Building Visualization...</div>
      </div>
    );
    
    if (chartData.length === 0) return (
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl">
        <div className="w-16 h-16 bg-secondary-card rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={24} className="text-muted" />
        </div>
        <div className="text-text font-semibold mb-2">Create your first visualization.</div>
        <p className="text-sm text-muted max-w-sm">Configure the chart on the left or use a smart recommendation to begin exploring.</p>
      </div>
    );

    const keyY = chartType === 'histogram' ? 'count' : yAxis;
    const formatValue = (val) => typeof val === 'number' ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val) : val;

    return (
      <div className="flex-1 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-text capitalize">{chartType} Chart</h2>
            <p className="text-sm text-secondary-text">
              {chartType === 'histogram' ? `Distribution of ${xAxis}` : `${aggregation} of ${yAxis} grouped by ${xAxis}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-raised hover:bg-hover border border-border rounded-lg text-secondary-text hover:text-text transition-colors">
              <Download size={16} />
            </button>
            <button className="p-2 bg-raised hover:bg-hover border border-border rounded-lg text-secondary-text hover:text-text transition-colors">
              <Maximize size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' || chartType === 'histogram' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />}
                <XAxis dataKey={xAxis} stroke="var(--color-secondary-text)" tick={{fill: 'var(--color-secondary-text)', fontSize: 11}} tickLine={false} axisLine={{stroke: 'var(--color-strong-border)'}} />
                <YAxis stroke="var(--color-secondary-text)" tick={{fill: 'var(--color-secondary-text)', fontSize: 11}} tickLine={false} axisLine={false} tickFormatter={formatValue} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary-card)', borderColor: 'var(--color-strong-border)', borderRadius: '8px', color: 'var(--color-text)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: 'var(--color-accent)' }} cursor={{fill: 'var(--color-hover)'}} />
                <Bar dataKey={keyY} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />}
                <XAxis dataKey={xAxis} stroke="var(--color-secondary-text)" tick={{fill: 'var(--color-secondary-text)', fontSize: 11}} tickLine={false} axisLine={{stroke: 'var(--color-strong-border)'}} />
                <YAxis stroke="var(--color-secondary-text)" tick={{fill: 'var(--color-secondary-text)', fontSize: 11}} tickLine={false} axisLine={false} tickFormatter={formatValue} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary-card)', borderColor: 'var(--color-strong-border)', borderRadius: '8px', color: 'var(--color-text)' }} itemStyle={{ color: 'var(--color-accent)' }} />
                <Line type="monotone" dataKey={keyY} stroke="var(--color-accent)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-background)', stroke: 'var(--color-accent)', strokeWidth: 2}} activeDot={{r: 6, fill: 'var(--color-accent)', stroke: '#fff', strokeWidth: 2}} />
              </LineChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie data={chartData} dataKey={keyY} nameKey={xAxis} cx="50%" cy="50%" outerRadius={160} innerRadius={100} paddingAngle={2} stroke="none">
                  {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-secondary-card)', borderColor: 'var(--color-strong-border)', borderRadius: '8px', color: 'var(--color-text)' }} itemStyle={{ color: 'var(--color-text)' }} />
              </PieChart>
            ) : null}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (chartData.length === 0 || chartType === 'histogram') return null;
    
    const keyY = yAxis;
    const sorted = [...chartData].sort((a, b) => b[keyY] - a[keyY]);
    const max = sorted[0];
    const min = sorted[sorted.length - 1];
    
    const total = chartData.reduce((acc, curr) => acc + (curr[keyY] || 0), 0);
    const avg = total / chartData.length;

    const format = (v) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(v);

    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mt-6 xl:mt-0 xl:w-64 shrink-0 flex flex-col space-y-6">
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Highest</div>
          <div className="bg-background border border-border rounded-lg p-3">
            <div className="font-semibold text-text truncate" title={max[xAxis]}>{max[xAxis]}</div>
            <div className="text-xl font-bold text-accent mt-1">{format(max[keyY])}</div>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Lowest</div>
          <div className="bg-background border border-border rounded-lg p-3">
            <div className="font-semibold text-text truncate" title={min[xAxis]}>{min[xAxis]}</div>
            <div className="text-lg font-bold text-secondary-text mt-1">{format(min[keyY])}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary-text">Average</span>
            <span className="font-semibold text-text">{format(avg)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-text">Groups</span>
            <span className="font-semibold text-text">{chartData.length}</span>
          </div>
        </div>
      </div>
    );
  };

  if (!activeDataset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[calc(100vh-10rem)] bg-background">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <PieIcon className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Dataset Active</h2>
        <p className="text-secondary-text mb-6 max-w-md">
          Load a dataset from the library to configure and build interactive charts.
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
    <div data-page="visualize" className="flex flex-col h-full bg-background p-6 md:p-8">
      
      {/* Smart Recommendations */}
      <div className="mb-6 bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text">Recommended for this data</div>
            <div className="text-[13px] text-secondary-text">Bar Chart comparing categories and totals.</div>
          </div>
        </div>
        <button onClick={handleRecommendation} className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow">
          Use Recommendation
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: Config Panel */}
        <div className="w-full xl:w-72 shrink-0 bg-surface border border-border rounded-xl shadow-sm p-5 flex flex-col space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-border pb-4">
            <Settings2 size={18} className="text-secondary-text" />
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Chart Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bar', icon: BarChart3 },
                  { id: 'line', icon: LineIcon },
                  { id: 'pie', icon: PieIcon },
                  { id: 'histogram', icon: Baseline },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={clsx(
                      "flex items-center justify-center py-2.5 rounded-lg border transition-colors",
                      chartType === type.id ? "bg-accent/10 border-accent text-accent" : "bg-background border-border text-secondary-text hover:border-strong-border hover:text-text"
                    )}
                    title={type.id}
                  >
                    <type.icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">X-Axis</label>
              <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent">
                <option value="">Select column...</option>
                {(schema?.columns || []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            
            {chartType !== 'histogram' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Y-Axis</label>
                  <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent">
                    <option value="">Select column...</option>
                    {(schema?.columns || []).filter(c => c.type.includes('int') || c.type.includes('float')).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Aggregation</label>
                  <select value={aggregation} onChange={e => setAggregation(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent">
                    <option value="mean">Average</option>
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                  </select>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-border">
              <label className="flex items-center space-x-2 text-sm text-secondary-text cursor-pointer">
                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="rounded border-border bg-background text-accent focus:ring-accent" />
                <span>Show Grid Lines</span>
              </label>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button 
              onClick={handleVisualize} 
              disabled={loading || !xAxis} 
              className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              Update Chart
            </button>
            {error && <div className="mt-3 text-xs text-error bg-error/10 p-2 rounded">{error}</div>}
          </div>
        </div>

        {/* CENTER: Chart Canvas */}
        <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col min-w-0">
          {renderChart()}
        </div>

        {/* RIGHT: Insights / Summary */}
        {renderSummary()}
      </div>
    </div>
  );
}
