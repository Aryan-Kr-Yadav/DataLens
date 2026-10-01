import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Code2, ChevronDown, MessageSquareText, CheckCircle2, Circle, Paperclip, Loader2, Download, Pin, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useDataset } from '../context/DatasetContext';
import { clsx } from 'clsx';

export default function AskData() {
  const { activeDataset } = useDataset();
  const location = useLocation();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (location.state?.initialQuestion) {
      setQuestion(location.state.initialQuestion);
      // Wait for state to settle then submit
      setTimeout(() => {
        handleSubmit(new Event('submit'), location.state.initialQuestion);
      }, 100);
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const handleSubmit = async (e, forcedQuestion = null) => {
    if (e) e.preventDefault();
    const q = forcedQuestion || question;
    if (!q.trim()) return;

    setQuestion("");
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const datasetId = activeDataset ? activeDataset.dataset_id : "none";
      const result = await api.askDataset(datasetId, q);
      setMessages(prev => [...prev, { role: 'assistant', result }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        error: true,
        content: `Error: ${err.response?.data?.detail || err.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    }
    return num;
  };

  const suggestions = activeDataset ? [
    "Which region has highest sales?",
    "Show monthly revenue trend.",
    "Which columns contain missing values?",
    "Find the strongest correlation.",
    "What is the average profit?"
  ] : [
    "What is DataLens?",
    "What is Pandas?",
    "What is standard deviation?",
    "How does privacy work here?"
  ];

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-[800px] mx-auto space-y-8 pb-32">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-12 md:mt-24">
              <h2 className="text-3xl font-bold text-text mb-4">What would you like to know?</h2>
              <p className="text-muted text-lg mb-10 max-w-lg">
                {activeDataset 
                  ? "Ask about trends, totals, correlations, missing data, categories or anything else in your dataset."
                  : "No dataset is currently loaded. You can still ask me about data analysis concepts or how DataLens works!"}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuestion(s)}
                    className="bg-surface border border-border px-4 py-2.5 rounded-full hover:border-accent/50 hover:bg-accent/5 transition-all text-sm text-secondary-text shadow-sm hover:text-text"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent text-white px-5 py-3 shadow-sm text-[15px] leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-1">
                      <Bot size={18} className="text-accent" />
                    </div>
                    <div className="flex-1 space-y-4">
                      {msg.error ? (
                        <div className="text-error bg-error/10 border border-error/20 p-4 rounded-xl text-[15px]">
                          {msg.content}
                        </div>
                      ) : msg.result && (
                        <div className="space-y-4 pt-1">
                          <div className="text-[15px] leading-relaxed text-text">
                            {msg.result.message}
                          </div>
                          
                          {msg.result.response_type === 'analysis' && msg.result.analysis && (
                            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                              <div className="p-5">
                                {msg.result.analysis.scalar !== null && (
                                  <div className="text-3xl font-extrabold text-text mb-2">
                                    {formatNumber(msg.result.analysis.scalar)}
                                  </div>
                                )}
                                
                                {msg.result.analysis.table && msg.result.analysis.table.length > 0 && (
                                  <div className="overflow-x-auto rounded border border-border bg-background mt-4">
                                    <table className="min-w-full text-sm text-left">
                                      <thead className="bg-secondary-card border-b border-border text-muted">
                                        <tr>
                                          {msg.result.analysis.columns_used?.map(col => <th key={col} className="px-4 py-2.5 font-medium">{col}</th>)}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {msg.result.analysis.table.map((row, idx) => (
                                          <tr key={idx} className="hover:bg-hover">
                                            {msg.result.analysis.columns_used?.map(col => (
                                              <td key={col} className="px-4 py-2.5 text-text">{String(row[col])}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Action Row */}
                              <div className="flex items-center space-x-1 p-3 border-t border-border bg-raised">
                                <details className="relative group">
                                  <summary className="flex items-center text-xs font-medium text-secondary-text hover:text-text cursor-pointer px-3 py-1.5 rounded-md hover:bg-hover transition-colors outline-none list-none [&::-webkit-details-marker]:hidden">
                                    <Code2 size={14} className="mr-1.5" /> Show Calculation
                                  </summary>
                                  <div className="absolute z-10 top-full left-0 mt-2 w-96 bg-surface border border-border shadow-xl rounded-xl p-4 cursor-auto">
                                    <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3">Execution Details</h4>
                                    <div className="space-y-3 text-xs">
                                      <div className="flex justify-between border-b border-border pb-2">
                                        <span className="text-muted">Execution</span>
                                        <span className="text-success font-medium">Local Pandas</span>
                                      </div>
                                      <div className="flex justify-between border-b border-border pb-2">
                                        <span className="text-muted">Raw CSV Shared</span>
                                        <span className="text-text font-medium">No</span>
                                      </div>
                                      <div>
                                        <span className="text-muted block mb-2">Generated Query:</span>
                                        <div className="p-2.5 bg-background border border-border rounded font-mono text-secondary-text overflow-x-auto whitespace-pre-wrap">
                                          {msg.result.pandas_query}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </details>

                                <button className="flex items-center text-xs font-medium text-secondary-text hover:text-text cursor-pointer px-3 py-1.5 rounded-md hover:bg-hover transition-colors">
                                  <Pin size={14} className="mr-1.5" /> Pin
                                </button>
                                <button className="flex items-center text-xs font-medium text-secondary-text hover:text-text cursor-pointer px-3 py-1.5 rounded-md hover:bg-hover transition-colors">
                                  <FileText size={14} className="mr-1.5" /> Add to Report
                                </button>
                                <button className="flex items-center text-xs font-medium text-secondary-text hover:text-text cursor-pointer px-3 py-1.5 rounded-md hover:bg-hover transition-colors">
                                  <Download size={14} className="mr-1.5" /> Export
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-4 w-full max-w-[800px] mx-auto">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-1">
                <Bot size={18} className="text-accent animate-pulse" />
              </div>
              <div className="flex-1 space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-[13px] text-secondary-text">
                  <CheckCircle2 size={14} className="text-success" /> <span>Understanding question</span>
                </div>
                <div className="flex items-center space-x-2 text-[13px] text-secondary-text">
                  <CheckCircle2 size={14} className="text-success" /> <span>Generating Pandas query</span>
                </div>
                <div className="flex items-center space-x-2 text-[13px] text-text font-medium">
                  <Loader2 size={14} className="text-accent animate-spin" /> <span>Executing locally...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Composer Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4">
        <div className="max-w-[800px] mx-auto relative">
          <form onSubmit={handleSubmit} className="relative bg-surface border border-border rounded-xl shadow-lg focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all flex items-end p-2">
            <button type="button" className="p-2 text-muted hover:text-text transition-colors">
              <Paperclip size={20} />
            </button>
            <textarea
              ref={inputRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your dataset..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-text resize-none py-3 px-2 focus:outline-none placeholder:text-muted text-[15px]"
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="p-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg disabled:opacity-50 disabled:bg-surface disabled:text-muted transition-colors flex shrink-0 mb-1 mr-1"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2 text-[11px] text-muted font-medium">
            DataLens can make mistakes. Please verify important calculations.
          </div>
        </div>
      </div>
    </div>
  );
}
