
import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Cpu, 
  CheckCircle2, 
  CircleDot, 
  Sparkles,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { getDiagnosticHelp } from '../services/geminiService';
import { DiagnosisResult } from '../types';

const Troubleshoot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const data = await getDiagnosticHelp(query);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Centered Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] shadow-sm border border-indigo-100">
          <Sparkles className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Intelligent Diagnostics</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Describe the technical issue in plain English and let our AI suggest immediate solutions.
        </p>
      </div>

      {/* Main Diagnostic Input - Stylized like the screenshot */}
      <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative bg-slate-50/50 rounded-[32px] border border-slate-100 p-8 min-h-[240px] flex flex-col">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="How can we help?"
              className="flex-1 w-full bg-transparent border-none outline-none text-xl md:text-2xl font-medium text-slate-700 placeholder:text-slate-300 transition-all resize-none"
            />
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center space-x-3 shadow-lg transition-all active:scale-95 ${
                  isLoading || !query.trim() 
                    ? 'bg-indigo-300 text-white opacity-60 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/30'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Analyze</span>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="py-20 text-center animate-pulse space-y-6">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Cross-referencing technical patterns...</p>
        </div>
      )}

      {/* Result Cards Section */}
      {result && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center space-x-4 mb-10">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-none">Resolution Strategy</h3>
              </div>
              <div className="space-y-6">
                {result.steps.map((step, idx) => (
                  <div key={idx} className="flex space-x-6 p-6 rounded-3xl bg-slate-50/50 group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                    <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black text-sm shadow-sm border border-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 font-medium text-lg leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Probable Causes</h3>
              </div>
              <ul className="space-y-4">
                {result.possibleCauses.map((cause, idx) => (
                  <li key={idx} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <CircleDot className="w-4 h-4 mt-1 text-slate-300 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-600">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-400/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Wrench className="w-24 h-24 rotate-12" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Confidence Level</p>
               <h4 className="text-3xl font-black mb-8 leading-none">High-Precision</h4>
               
               <div className="space-y-1 mb-8">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                   <span>Technical Complexity</span>
                   <span>{result.estimatedDifficulty}</span>
                 </div>
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      result.estimatedDifficulty === 'Easy' ? 'w-1/3 bg-emerald-500' :
                      result.estimatedDifficulty === 'Medium' ? 'w-2/3 bg-amber-500' :
                      'w-full bg-red-500'
                    }`}></div>
                 </div>
               </div>
               
               <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center group">
                Contact Engineer <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Troubleshoot;
