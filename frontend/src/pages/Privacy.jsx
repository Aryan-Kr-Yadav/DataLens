import { Shield, Lock, Cpu, Server, FileText, Database, Code, CheckCircle2, Bot, ArrowRight, TableProperties } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      
      {/* Header */}
      <div className="bg-surface border-b border-border p-12 text-center shrink-0">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-success/5">
          <Shield className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl font-extrabold text-text mb-4 tracking-tight">Privacy by Design</h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Your CSV remains local. We execute generated code securely on your machine and never send raw data to an LLM.
        </p>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full space-y-12">
        
        {/* Architecture Diagram */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-text mb-8">Execution Architecture</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
            {/* Diagram Background Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0"></div>
            
            {[
              { icon: FileText, label: "Raw CSV", desc: "Local Disk", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { icon: Database, label: "Pandas DF", desc: "Backend RAM", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
              { icon: TableProperties, label: "Schema", desc: "Names & Types", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { icon: Bot, label: "Groq AI", desc: "Query Gen", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { icon: Code, label: "Local Exec", desc: "AST Validation", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { icon: CheckCircle2, label: "Result", desc: "Browser", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center group w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border bg-background ${step.border} group-hover:-translate-y-1 transition-transform duration-300 shadow-sm`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.bg}`}>
                    <step.icon size={20} className={step.color} />
                  </div>
                </div>
                <div className="font-semibold text-text text-sm mb-1">{step.label}</div>
                <div className="text-[11px] text-muted font-medium uppercase tracking-wider">{step.desc}</div>
                {i < 5 && <ArrowRight size={16} className="text-muted md:hidden mt-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Data Flow Table */}
        <div>
          <h2 className="text-lg font-bold text-text mb-4">Data Flow Summary</h2>
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary-card border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Component</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">Exposure Level</th>
                  <th className="px-6 py-4 font-semibold text-secondary-text w-1/2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Raw CSV File</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success bg-success/10 border border-success/20 rounded">Local Only</span></td>
                  <td className="px-6 py-4 text-secondary-text">Never leaves your machine. Loaded strictly into local memory.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Dataset Rows</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success bg-success/10 border border-success/20 rounded">Local Only</span></td>
                  <td className="px-6 py-4 text-secondary-text">Actual row values are not transmitted to the LLM during queries.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Schema (Columns)</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-warning bg-warning/10 border border-warning/20 rounded">Shared if enabled</span></td>
                  <td className="px-6 py-4 text-secondary-text">Column names and types are shared to generate correct Pandas code.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">User Question</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded">Sent to AI</span></td>
                  <td className="px-6 py-4 text-secondary-text">Your typed questions are sent to Groq for query generation.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Generated Query</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded">Returned by AI</span></td>
                  <td className="px-6 py-4 text-secondary-text">The Python/Pandas code is received from the LLM.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Execution</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success bg-success/10 border border-success/20 rounded">Local Only</span></td>
                  <td className="px-6 py-4 text-secondary-text">The query is executed locally via AST validation.</td>
                </tr>
                <tr className="hover:bg-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-text">Final Result</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success bg-success/10 border border-success/20 rounded">Local Only</span></td>
                  <td className="px-6 py-4 text-secondary-text">The aggregated result is returned to your browser.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why this matters */}
        <div>
          <h2 className="text-lg font-bold text-text mb-4">Why this matters</h2>
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-secondary-text leading-relaxed">
              In modern data analysis, organizations are often hesitant to use AI tools due to the risk of exposing sensitive data—such as PII, financial records, or proprietary metrics—to third-party language models. 
              <br/><br/>
              DataLens solves this by separating the <strong>reasoning</strong> from the <strong>data</strong>. The LLM acts purely as a reasoning engine, generating the logic (code) required to answer a question. Your local machine acts as the execution engine, applying that logic strictly to the local data. 
              <br/><br/>
              This architecture gives you the full power of advanced AI data analysis while maintaining 100% compliance with strict internal data security and privacy protocols.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
