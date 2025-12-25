import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Cpu, 
  CheckCircle2, 
  CircleDot, 
  Sparkles,
  Loader2,
  ChevronRight,
  Globe,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { getDiagnosticHelp, GroundedDiagnosisResult } from '../services/geminiService';

const Troubleshoot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GroundedDiagnosisResult | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const data = await getDiagnosticHelp(query, useWebSearch);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4 md:space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-[32px] shadow-sm border border-indigo-100">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">AI Intelligent Diagnostics</h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
          Describe your technical issue and let our AI suggest immediate solutions.
        </p>
      </div>

      {/* Main Diagnostic Input */}
      <div className="bg-white p-4 md:p-12 rounded-3xl md:rounded-[48px] shadow-xl border border-slate-50">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative bg-slate-50/50 rounded-2xl md:rounded-[32px] border border-slate-100 p-4 md:p-8 min-h-[180px] md:min-h-[240px] flex flex-col">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. My printer is offline even though it's connected..."
              className="flex-1 w-full bg-transparent border-none outline-none text-base md:text-2xl font-medium text-slate-700 placeholder:text-slate-300 transition-all resize-none"
            />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <button 
                type="button"
                onClick={() => setUseWebSearch(!useWebSearch)}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  useWebSearch 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-white text-slate-400 border border-slate-100'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Web Grounding {useWebSearch ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center space-x-3 shadow-lg transition-all active:scale-95 ${
                  isLoading || !query.trim() 
                    ? 'bg-indigo-300 text-white opacity-60 cursor-not-allowed' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Start Analysis</span>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="py-12 text-center animate-pulse space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            {useWebSearch ? 'Browsing technical resources...' : 'Processing diagnostic model...'}
          </p>
        </div>
      )}

      {/* Result Cards Section */}
      {result && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-xl">
              <div className="flex items-center space-x-3 mb-6 md:mb-10">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-none">Resolution Strategy</h3>
              </div>
              <div className="space-y-4">
                {result.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => copyToClipboard(step, idx)}
                    className="flex space-x-4 md:space-x-6 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50/50 group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 cursor-pointer"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black text-xs md:text-sm shadow-sm border border-slate-100 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 font-medium text-base md:text-lg leading-relaxed flex-1">{step}</p>
                    <div className="flex-shrink-0 pt-1">
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Web Grounding Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="bg-indigo-50/30 rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-indigo-100">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Verified Web Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-indigo-100 hover:border-indigo-600 transition-all group shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-700 truncate mr-4">{source.title || source.uri}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-6">Probable Causes</h3>
              <ul className="space-y-3">
                {result.possibleCauses.map((cause, idx) => (
                  <li key={idx} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <CircleDot className="w-3 h-3 mt-1 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Confidence Level</p>
               <h4 className="text-xl md:text-2xl font-black mb-6">High-Precision</h4>
               
               <div className="space-y-1 mb-6">
                 <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-2">
                   <span>Complexity</span>
                   <span>{result.estimatedDifficulty}</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      result.estimatedDifficulty === 'Easy' ? 'w-1/3 bg-emerald-500' :
                      result.estimatedDifficulty === 'Medium' ? 'w-2/3 bg-amber-500' :
                      'w-full bg-red-500'
                    }`}></div>
                 </div>
               </div>
               
               <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                Contact Engineer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Troubleshoot;