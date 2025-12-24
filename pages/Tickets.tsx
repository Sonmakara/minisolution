
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  MessageSquare, 
  Clock, 
  History,
  AlertCircle,
  X,
  Send,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  LifeBuoy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LogIn,
  Fingerprint
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Ticket, IssueCategory, TicketStatus, User } from '../types';
import { getDiagnosticHelp } from '../services/geminiService';

interface TicketsProps {
  onNavigate?: (page: string) => void;
}

const Tickets: React.FC<TicketsProps> = ({ onNavigate }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: IssueCategory.SOFTWARE });
  const [commentText, setCommentText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setTickets(mockApi.getTickets());
    setCurrentUser(mockApi.getCurrentUser());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login to create a ticket.");
      return;
    }
    const created = mockApi.createTicket({
      ...newTicket,
      userId: currentUser.id
    });
    setTickets([created, ...tickets]);
    setShowModal(false);
    setNewTicket({ title: '', description: '', category: IssueCategory.SOFTWARE });
  };

  const handleAddComment = (text: string, isAi = false) => {
    if (!selectedTicket || !text.trim()) return;
    
    const authorName = isAi ? 'Gemini AI Assistant' : (currentUser?.name || 'Guest User');
    
    mockApi.addComment(selectedTicket.id, {
      author: authorName,
      text,
      isAi
    });
    
    // Refresh local state
    const allTickets = mockApi.getTickets();
    setTickets(allTickets);
    setSelectedTicket(allTickets.find(t => t.id === selectedTicket.id) || null);
    setCommentText('');
  };

  const generateAiAnalysis = async () => {
    if (!selectedTicket) return;
    setIsAiLoading(true);
    try {
      const diagnosis = await getDiagnosticHelp(selectedTicket.description);
      const aiResponse = `**AI Diagnosis for Ticket #${selectedTicket.id}**\n\n**Possible Causes:**\n${diagnosis.possibleCauses.map(c => `- ${c}`).join('\n')}\n\n**Resolution Steps:**\n${diagnosis.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\n*Difficulty Level: ${diagnosis.estimatedDifficulty}*`;
      handleAddComment(aiResponse, true);
    } catch (err) {
      alert("AI Analysis failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredAndSortedTickets = tickets
    .filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Queue</h1>
          <p className="text-slate-500">Track and manage technical incident reports.</p>
        </div>
        {currentUser ? (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center space-x-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Initiate Ticket</span>
          </button>
        ) : (
          <button 
            onClick={() => onNavigate?.('login')}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-[20px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center space-x-2 active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign in to Create Ticket</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center space-x-2 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center space-x-2 hover:border-indigo-600 hover:text-indigo-600 transition-all"
            >
              {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Lookup ID or subject..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Records: {filteredAndSortedTickets.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Ticket ID</th>
                <th className="px-8 py-5">Subject & Description</th>
                <th className="px-8 py-5 text-center">Category</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedTickets.length > 0 ? (
                filteredAndSortedTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <Fingerprint className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <span className="font-mono text-xs font-black text-slate-400 group-hover:text-indigo-600">#{ticket.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <p className="font-black text-slate-900 group-hover:text-indigo-900 transition-colors line-clamp-1">{ticket.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">{ticket.description}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{ticket.category}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        ticket.status === TicketStatus.OPEN ? 'bg-amber-100 text-amber-700' :
                        ticket.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center text-slate-400 text-[10px] font-bold">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          {ticket.comments?.length || 0}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="bg-slate-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <LifeBuoy className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Queue Empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">No tickets found. {currentUser ? "Why not create one?" : "Please sign in to view and create tickets."}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Ticket Analysis</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incident Record #{selectedTicket.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Sidebar Info */}
              <div className="w-full lg:w-80 border-r border-slate-100 p-8 space-y-8 overflow-y-auto bg-slate-50/30">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Status</h4>
                  <div className="space-y-2">
                    {Object.values(TicketStatus).map(status => (
                      <button 
                        key={status}
                        disabled={!currentUser || currentUser.role === 'USER' && selectedTicket.userId !== currentUser.id}
                        onClick={() => {
                          mockApi.updateTicketStatus(selectedTicket.id, status);
                          const allTickets = mockApi.getTickets();
                          setTickets(allTickets);
                          setSelectedTicket({...selectedTicket, status});
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          selectedTicket.status === status 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status.replace('_', ' ')}
                        {selectedTicket.status === status && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Metadata</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">CATEGORY</p>
                      <p className="text-sm font-bold text-slate-900">{selectedTicket.category}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">INITIATED</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button 
                  disabled={isAiLoading || !currentUser}
                  onClick={generateAiAnalysis}
                  className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 p-6 rounded-3xl font-bold text-sm flex flex-col items-center justify-center space-y-3 hover:bg-indigo-100 transition-all group disabled:opacity-50"
                >
                  <Sparkles className={`w-8 h-8 group-hover:scale-110 transition-transform ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span className="text-center">Run AI Diagnostic Suite</span>
                </button>
              </div>

              {/* Main Content & Chat */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{selectedTicket.title}</h3>
                  <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 text-sm border border-slate-100 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white py-2">Communications Timeline</h4>
                  {selectedTicket.comments?.map((comment) => (
                    <div key={comment.id} className={`flex ${comment.isAi ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm border ${
                        comment.isAi 
                          ? 'bg-indigo-600 text-white border-indigo-700' 
                          : 'bg-white text-slate-700 border-slate-100'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {comment.isAi && <Sparkles className="w-3 h-3" />}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${comment.isAi ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {comment.author}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                        <div className={`text-[9px] mt-4 font-bold ${comment.isAi ? 'text-indigo-300' : 'text-slate-300'}`}>
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                    <div className="py-12 text-center text-slate-300 italic text-sm">
                      No communications recorded yet.
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  {currentUser ? (
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                      <input 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddComment(commentText)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                      />
                      <button 
                        onClick={() => handleAddComment(commentText)}
                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-400">
                      Sign in to participate in the timeline.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Initiate Ticket</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Subject</label>
                <input 
                  required
                  value={newTicket.title}
                  onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. Critical Failure in CRM Module"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(IssueCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewTicket({...newTicket, category: cat})}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                        newTicket.category === cat 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Narrative</label>
                <textarea 
                  required
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[140px] text-sm leading-relaxed"
                  placeholder="Provide comprehensive details..."
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all active:scale-95">
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
