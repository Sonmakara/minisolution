
import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronRight, 
  Search, 
  Globe, 
  ShieldCheck, 
  HardDrive, 
  Monitor,
  Layout,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Share2,
  ThumbsUp,
  Bookmark,
  X,
  Trash2,
  Edit3,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  MessageCircle,
  Plus,
  Filter,
  RefreshCcw
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { getKnowledgeBaseArticle } from '../services/geminiService';
import { Guide, IssueCategory, User } from '../types';

const KnowledgeBase: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IssueCategory | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'OFFICIAL' | 'COMMUNITY' | 'PENDING'>('OFFICIAL');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [formGuide, setFormGuide] = useState<Omit<Guide, 'id' | 'createdAt'>>({
    title: '',
    excerpt: '',
    content: '',
    category: IssueCategory.SOFTWARE,
    tags: [],
    status: 'PENDING',
    authorName: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    refreshGuides();
    setCurrentUser(mockApi.getCurrentUser());
  }, []);

  const refreshGuides = () => {
    setGuides(mockApi.getGuides());
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  const categories = [
    { id: 'ALL', label: 'All Articles', icon: Layout },
    { id: IssueCategory.NETWORK, label: 'Network', icon: Globe },
    { id: IssueCategory.SOFTWARE, label: 'Software', icon: Monitor },
    { id: IssueCategory.HARDWARE, label: 'Hardware', icon: HardDrive },
    { id: IssueCategory.SECURITY, label: 'Security', icon: ShieldCheck },
  ];

  const filteredGuides = guides.filter(g => {
    const matchesCategory = activeCategory === 'ALL' || g.category === activeCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeTab === 'OFFICIAL') {
      return matchesCategory && g.status === 'APPROVED' && (g.authorName.toLowerCase().includes('admin') || g.authorName.toLowerCase().includes('it specialist'));
    }
    if (activeTab === 'COMMUNITY') {
      const isApprovedCommunity = g.status === 'APPROVED' && !g.authorName.toLowerCase().includes('admin') && !g.authorName.toLowerCase().includes('it specialist');
      const isMyPending = g.status === 'PENDING' && g.authorName === currentUser?.name;
      return matchesCategory && (isApprovedCommunity || isMyPending);
    }
    if (activeTab === 'PENDING') {
      return matchesCategory && g.status === 'PENDING' && isAdmin;
    }
    return false;
  });

  const handleBack = () => {
    setSelectedGuide(null);
    setLiked(false);
    setBookmarked(false);
  };

  const handleOpenModal = (guide?: Guide) => {
    if (!currentUser) {
      alert("Please sign in to contribute your knowledge.");
      return;
    }
    if (guide) {
      setEditingGuide(guide);
      setFormGuide({
        title: guide.title,
        excerpt: guide.excerpt,
        content: guide.content,
        category: guide.category,
        tags: guide.tags,
        status: guide.status,
        authorName: guide.authorName
      });
    } else {
      setEditingGuide(null);
      setFormGuide({
        title: '',
        excerpt: '',
        content: '',
        category: IssueCategory.SOFTWARE,
        tags: [],
        status: isAdmin ? 'APPROVED' : 'PENDING',
        authorName: currentUser.name
      });
    }
    setIsModalOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!formGuide.title) {
      alert("Please enter a title or topic first so the AI knows what to write about.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await getKnowledgeBaseArticle(formGuide.title);
      setFormGuide(prev => ({
        ...prev,
        content: result.text,
        excerpt: result.text.split('\n').find(l => l.length > 50)?.substring(0, 120) + '...' || prev.excerpt,
        tags: [...new Set([...prev.tags, ... (formGuide.title.toLowerCase().split(' ').filter(w => w.length > 3))])]
      }));
    } catch (error) {
      console.error(error);
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      mockApi.updateGuide(editingGuide.id, formGuide);
    } else {
      mockApi.createGuide(formGuide);
    }
    refreshGuides();
    setIsModalOpen(false);
    if (!isAdmin) {
      alert("Knowledge submitted! It will appear in the Community tab once reviewed by our IT team.");
    }
  };

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    mockApi.approveGuide(id);
    refreshGuides();
  };

  const handleDeleteGuide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this article?')) {
      mockApi.deleteGuide(id);
      refreshGuides();
      if (selectedGuide?.id === id) setSelectedGuide(null);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formGuide.tags.includes(tagInput.trim())) {
      setFormGuide({ ...formGuide, tags: [...formGuide.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormGuide({ ...formGuide, tags: formGuide.tags.filter(t => t !== tagToRemove) });
  };

  if (selectedGuide) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>
          
          <div className="flex items-center space-x-2">
            {(isAdmin || selectedGuide.authorName === currentUser?.name) && (
              <>
                <button 
                  onClick={() => handleOpenModal(selectedGuide)}
                  className="p-3 bg-white text-indigo-600 border border-slate-100 rounded-2xl hover:bg-indigo-50 transition-all"
                  title="Edit Article"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                {(isAdmin || selectedGuide.authorName === currentUser?.name) && (
                   <button 
                    onClick={(e) => handleDeleteGuide(selectedGuide.id, e)}
                    className="p-3 bg-white text-red-500 border border-slate-100 rounded-2xl hover:bg-red-50 transition-all"
                    title="Delete Article"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-3 rounded-2xl transition-all ${bookmarked ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-600 hover:text-indigo-600'}`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full ${selectedGuide.authorName.includes('Admin') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {selectedGuide.authorName.includes('Admin') ? 'Official Guide' : 'Community Fix'}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full">
              {selectedGuide.category}
            </span>
            {selectedGuide.status === 'PENDING' && (
              <span className="text-[10px] uppercase font-black tracking-widest px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Pending Review
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            {selectedGuide.title}
          </h1>

          <div className="flex items-center space-x-6 py-6 border-y border-slate-100 mb-10 text-slate-400 text-sm">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              <span className="font-semibold text-slate-600">{selectedGuide.authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(selectedGuide.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-xl transition-all ${liked ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[calc(100vh-160px)]">
      {/* Header Section Matches Screenshot */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Technical Knowledge</h1>
          <p className="text-slate-500 font-medium mt-1">Official documentation and community-contributed IT fixes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-[#0F172A] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Input Your Knowledge</span>
          </button>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-6 py-2.5 bg-slate-100/70 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500 text-xs w-full md:w-64 outline-none shadow-sm transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs Matches Screenshot */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar w-full">
        {[
          { id: 'OFFICIAL', label: 'Official Articles', icon: ShieldCheck },
          { id: 'COMMUNITY', label: 'Community Fixes', icon: MessageCircle },
          ...(isAdmin ? [{ id: 'PENDING', label: 'Pending Review', icon: Clock }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-8 py-5 border-b-2 transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Category Pills Matches Screenshot */}
      <div className="flex flex-wrap items-center gap-3 pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-full border transition-all font-bold text-[11px] ${
              activeCategory === cat.id 
                ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg shadow-slate-200' 
                : 'bg-slate-100/50 border-slate-50 text-slate-500 hover:text-indigo-600 shadow-sm'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            <span>{cat.label}</span>
          </button>
        ))}
        <div className="flex-1"></div>
        <button 
          onClick={refreshGuides}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Refresh Guides"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Articles Grid / Empty State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 min-h-[400px]">
        {filteredGuides.map((guide) => (
          <div 
            key={guide.id} 
            onClick={() => setSelectedGuide(guide)}
            className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer relative"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${guide.status === 'PENDING' ? 'bg-amber-100' : 'bg-slate-50 group-hover:bg-indigo-600'}`}>
                {guide.status === 'PENDING' ? <Clock className="w-6 h-6 text-amber-600" /> : <Book className="w-6 h-6 text-slate-400 group-hover:text-white" />}
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${guide.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {guide.status}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {guide.category}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
              {guide.title}
            </h3>
            <p className="text-slate-500 text-xs line-clamp-3 mb-8 flex-grow leading-relaxed">
              {guide.excerpt}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
               <div className="flex items-center space-x-2">
                  <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400">{guide.authorName} {guide.authorName === currentUser?.name && '(You)'}</span>
               </div>
               {activeTab === 'PENDING' && isAdmin && (
                 <button 
                  onClick={(e) => handleApprove(guide.id, e)}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-lg shadow-emerald-600/20 active:scale-90 transition-all"
                 >
                   <CheckCircle className="w-3 h-3" />
                   <span>Approve</span>
                 </button>
               )}
            </div>
          </div>
        ))}

        {filteredGuides.length === 0 && (
          <div className="col-span-full py-24 text-center animate-in fade-in zoom-in duration-500 bg-white/30 rounded-[48px] border border-slate-50 flex flex-col items-center">
            <div className="bg-slate-100/50 w-24 h-24 rounded-[32px] flex items-center justify-center mb-8">
              <MessageCircle className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              {searchQuery ? `No results for "${searchQuery}"` : 'No contributions here yet'}
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium mb-10">
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Be the first to share your expertise with the team.'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => handleOpenModal()}
                className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.1em] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all hover:bg-indigo-700"
              >
                Start Writing
              </button>
            )}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Retained functionality */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingGuide ? 'Refine Knowledge' : 'Share Knowledge'}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Contributing as {currentUser?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGuide} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problem Title / Feature Name</label>
                  {!editingGuide && (
                    <button 
                      type="button" 
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !formGuide.title}
                      className="flex items-center space-x-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Draft with AI</span>
                    </button>
                  )}
                </div>
                <input 
                  required 
                  value={formGuide.title} 
                  onChange={e => setFormGuide({...formGuide, title: e.target.value})} 
                  placeholder="E.g. Fixing Bluetooth stutter on Linux"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Domain</label>
                  <select 
                    value={formGuide.category}
                    onChange={e => setFormGuide({...formGuide, category: e.target.value as IssueCategory})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900"
                  >
                    {Object.values(IssueCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary (Excerpt)</label>
                  <input 
                    required 
                    value={formGuide.excerpt} 
                    onChange={e => setFormGuide({...formGuide, excerpt: e.target.value})} 
                    placeholder="Short summary of the solution..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium text-slate-600" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Technical Solution (Markdown)</label>
                <textarea 
                  required 
                  value={formGuide.content} 
                  onChange={e => setFormGuide({...formGuide, content: e.target.value})} 
                  placeholder="## Prerequisites... \n\n## Solution... \n\n1. Run the command..."
                  className="w-full h-80 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-mono text-xs leading-relaxed" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formGuide.tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-indigo-800"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Tag name..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs" 
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Add</button>
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex space-x-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveGuide}
                disabled={isGenerating}
                className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isAdmin ? (editingGuide ? 'Apply System Update' : 'Publish System Guide') : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
