
import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronRight, 
  Search, 
  Hash, 
  Globe, 
  ShieldCheck, 
  HardDrive, 
  Monitor,
  Layout,
  ArrowLeft,
  Calendar,
  User,
  Share2,
  ThumbsUp
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Guide, IssueCategory } from '../types';

const KnowledgeBase: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [activeCategory, setActiveCategory] = useState<IssueCategory | 'ALL'>('ALL');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  
  useEffect(() => {
    setGuides(mockApi.getGuides());
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Articles', icon: Layout },
    { id: IssueCategory.NETWORK, label: 'Network', icon: Globe },
    { id: IssueCategory.SOFTWARE, label: 'Software', icon: Monitor },
    { id: IssueCategory.HARDWARE, label: 'Hardware', icon: HardDrive },
    { id: IssueCategory.SECURITY, label: 'Security', icon: ShieldCheck },
  ];

  const filteredGuides = activeCategory === 'ALL' 
    ? guides 
    : guides.filter(g => g.category === activeCategory);

  if (selectedGuide) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedGuide(null)}
          className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-[10px] uppercase font-black tracking-widest px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full">
              {selectedGuide.category}
            </span>
            {selectedGuide.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase font-bold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            {selectedGuide.title}
          </h1>

          <div className="flex items-center space-x-6 py-6 border-y border-slate-100 mb-10 text-slate-400 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="font-semibold text-slate-600">IT Team</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Oct 24, 2023</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ThumbsUp className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
            {selectedGuide.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-slate-900 mt-8 mb-4">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc mb-2">{line.replace(/^[-*]\s/, '')}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>

          <div className="mt-16 p-8 bg-indigo-50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Was this article helpful?</h4>
              <p className="text-slate-500 text-sm">Your feedback helps us improve our knowledge base.</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95">Yes, definitely</button>
              <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">Not really</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="text-slate-500">Explore documentation, guides and technical bulletins.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search guides..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-80 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl border-2 whitespace-nowrap transition-all font-bold text-sm ${
              activeCategory === cat.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-y-[-2px]' 
                : 'bg-white border-transparent text-slate-500 hover:text-indigo-600 hover:border-indigo-100 shadow-sm'
            }`}
          >
            <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-slate-400'}`} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGuides.map((guide) => (
          <div 
            key={guide.id} 
            onClick={() => setSelectedGuide(guide)}
            className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                <Book className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600">
                {guide.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
              {guide.title}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
              {guide.excerpt}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-indigo-600 text-sm font-black">
              <span className="flex items-center uppercase tracking-tighter">
                Explore Content
                <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="flex -space-x-2">
                {[1,2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>)}
              </div>
            </div>
          </div>
        ))}

        {filteredGuides.length === 0 && (
          <div className="col-span-full py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Knowledge Deficit</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any resources matching your current filter. Try broadening your search or selecting 'All Articles'.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
