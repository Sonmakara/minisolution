import React from 'react';
import { Search, Sparkles, BookOpen, LifeBuoy, Wrench, ChevronRight, Zap } from 'lucide-react';
import { AppRole } from '../types';

interface UserHomeProps {
  onNavigate: (page: string) => void;
  role?: AppRole;
}

const UserHome: React.FC<UserHomeProps> = ({ onNavigate, role }) => {
  const isGuest = role === 'GUEST';

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12 px-4 bg-gradient-to-b from-indigo-50/30 to-transparent rounded-3xl md:rounded-[48px]">
        <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-indigo-100 mb-6 md:mb-8 animate-bounce">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
          <span className="text-[9px] md:text-xs font-bold text-slate-600 uppercase tracking-widest">Self-Service AI Enabled</span>
        </div>
        <h1 className="text-3xl md:text-6xl font-black text-slate-900 leading-tight md:leading-[1.1] mb-4 md:mb-6 tracking-tight">
          How can we help you <br/><span className="text-indigo-600">troubleshoot</span> today?
        </h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
          Access our intelligent diagnostic engine or browse professional IT guides.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
          <div className="relative group w-full">
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 md:w-6 md:h-6 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search help topics..." 
              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[32px] shadow-xl shadow-slate-200/50 focus:border-indigo-600 focus:ring-0 outline-none transition-all text-sm md:text-lg font-medium"
            />
          </div>
          {isGuest && (
             <div className="flex space-x-2 w-full sm:w-auto">
                <button 
                  onClick={() => onNavigate('signup')}
                  className="flex-1 sm:flex-none px-6 md:px-8 py-4 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[32px] font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                  Join
                </button>
             </div>
          )}
        </div>
      </section>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        <button 
          onClick={() => onNavigate('troubleshoot')}
          className="group p-6 md:p-8 bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left flex flex-col"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">AI Diagnostic</h3>
          <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">Instant AI-powered resolution paths.</p>
          <div className="mt-auto flex items-center text-indigo-600 font-bold text-[10px] md:text-sm uppercase tracking-widest">
            Launch <ChevronRight className="w-4 h-4 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('knowledge')}
          className="group p-6 md:p-8 bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left flex flex-col"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Knowledge Base</h3>
          <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">Expert articles and technical guides.</p>
          <div className="mt-auto flex items-center text-emerald-600 font-bold text-[10px] md:text-sm uppercase tracking-widest">
            Browse <ChevronRight className="w-4 h-4 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('tickets')}
          className="group p-6 md:p-8 bg-slate-900 text-white rounded-3xl md:rounded-[40px] shadow-sm hover:shadow-xl transition-all text-left flex flex-col"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-105 transition-transform">
            <LifeBuoy className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mb-2">Support Tickets</h3>
          <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">Open a ticket with our senior IT team.</p>
          <div className="mt-auto flex items-center text-white font-bold text-[10px] md:text-sm uppercase tracking-widest">
            Get Help <ChevronRight className="w-4 h-4 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-3xl md:rounded-[48px] p-6 md:p-12 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 max-w-6xl mx-auto shadow-sm">
        <div className="flex-1 space-y-3 md:space-y-4 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 text-indigo-600">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-[9px] font-black uppercase tracking-widest">System Health</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900">Enterprise Reliability.</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">Our systems are performing at peak efficiency.</p>
        </div>
        <div className="flex items-center space-x-6 md:space-x-8">
           <div className="text-center">
             <p className="text-xl md:text-3xl font-black text-slate-900">99.9%</p>
             <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Uptime</p>
           </div>
           <div className="w-px h-10 md:h-12 bg-slate-100"></div>
           <div className="text-center">
             <p className="text-xl md:text-3xl font-black text-slate-900">12k+</p>
             <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Solved</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;