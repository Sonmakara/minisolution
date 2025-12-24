
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
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-gradient-to-b from-indigo-50/50 to-transparent rounded-[48px]">
        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100 mb-8 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Self-Service AI Enabled</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
          How can we help you <br/><span className="text-indigo-600">troubleshoot</span> today?
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Access our intelligent diagnostic engine or browse professional IT guides to resolve your issues in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="max-w-3xl flex-1 relative group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search for articles, help topics, or symptoms..." 
              className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50 focus:border-indigo-600 focus:ring-0 outline-none transition-all text-lg font-medium"
            />
          </div>
          {isGuest && (
             <div className="flex space-x-3">
                <button 
                  onClick={() => onNavigate('signup')}
                  className="px-8 py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                  Join Us
                </button>
                <button 
                  onClick={() => onNavigate('login')}
                  className="px-8 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-[32px] font-black text-sm uppercase tracking-widest hover:border-indigo-100 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Login
                </button>
             </div>
          )}
        </div>
      </section>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <button 
          onClick={() => onNavigate('troubleshoot')}
          className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col"
        >
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
            <Wrench className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">AI Diagnostic</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Describe your issue in plain English and get an instant AI-powered solution.</p>
          <div className="mt-auto flex items-center text-indigo-600 font-bold text-sm uppercase tracking-widest">
            Launch Engine <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('knowledge')}
          className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col"
        >
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Knowledge Base</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Browse over 500+ expert articles and troubleshooting walkthroughs.</p>
          <div className="mt-auto flex items-center text-emerald-600 font-bold text-sm uppercase tracking-widest">
            Browse Guides <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('tickets')}
          className="group p-8 bg-slate-900 text-white rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col"
        >
          <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Support Tickets</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Can't find an answer? Open a ticket with our senior IT engineering team.</p>
          <div className="mt-auto flex items-center text-white font-bold text-sm uppercase tracking-widest">
            Get Help <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Quick Stats / Feedback */}
      <div className="bg-white rounded-[48px] p-12 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto shadow-sm">
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-xs font-black uppercase tracking-widest">Live System Updates</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Enterprise Reliability.</h2>
          <p className="text-slate-500 leading-relaxed">All core services are performing at peak efficiency. Average resolution time for AI-guided tickets is currently <strong>3.2 minutes</strong>.</p>
        </div>
        <div className="flex items-center space-x-8">
           <div className="text-center">
             <p className="text-3xl font-black text-slate-900">99.9%</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SLA Uptime</p>
           </div>
           <div className="w-px h-12 bg-slate-100"></div>
           <div className="text-center">
             <p className="text-3xl font-black text-slate-900">12k+</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Issues Resolved</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
