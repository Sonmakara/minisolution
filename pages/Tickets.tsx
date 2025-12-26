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
  Fingerprint,
  ChevronDown
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
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
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
    
    const authorName = isAi ? 'AI Assistant' : (currentUser?.name || 'Guest User');
    
    mockApi.addComment(selectedTicket.id, {
      author: authorName,
      text,
      isAi
    });
    
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
      (statusFilter === 'ALL' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Support Queue</h1>
          <p className="text-sm text-slate-500">Manage technical incident reports.</p>
        </div>
        {currentUser ? (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        ) : (
          <button 
            onClick={() => onNavigate?.('login')}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 md:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {/* Sort Toggle */}
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex-shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-2 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
            >
              {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              <span>{sortOrder === 'desc' ? 'New' : 'Old'}</span>
            </button>

            {/* Status Filter Dropdown */}
            <div className="relative group flex-shrink-0">
              <div className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 space-x-2">
                <Filter className="w-3 h-3" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1"
                >
                  <option value="ALL">All Status</option>
                  <option value={TicketStatus.OPEN}>Open</option>
                  <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TicketStatus.RESOLVED}>Resolved</option>
                  <option value={TicketStatus.CLOSED}>Closed</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="ID or subject..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Category</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right"></th>
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
                    <td className="px-6 py-5">
                      <span className="font-mono text-[10px] font-black text-slate-400">#{ticket.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 text-sm">{ticket.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        ticket.status === TicketStatus.OPEN ? 'bg-amber-100 text-amber-700' :
                        ticket.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-700' :
                        ticket.status === TicketStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 transition-all ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-sm font-bold text-slate-400">No active records found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl sm:rounded-[48px] w-full max-w-6xl h-[95vh] sm:h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-indigo-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">Ticket Analysis</h2>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{selectedTicket.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Sidebar Info */}
              <div className="w-full lg:w-80 border-r border-slate-100 p-4 sm:p-8 space-y-6 overflow-y-auto bg-slate-50/30 flex-shrink-0">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Workflow State</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {Object.values(TicketStatus).map(status => (
                      <button 
                        key={status}
                        disabled={!currentUser}
                        onClick={() => {
                          mockApi.updateTicketStatus(selectedTicket.id, status);
                          const allTickets = mockApi.getTickets();
                          setTickets(allTickets);
                          setSelectedTicket({...selectedTicket, status});
                        }}
                        className={`text-left px-3 py-2 rounded-lg text-[9px] font-bold transition-all border ${
                          selectedTicket.status === status 
                            ? 'bg-indigo-600 text-white border-transparent' 
                            : 'bg-white text-slate-600 border-slate-100'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  disabled={isAiLoading || !currentUser}
                  onClick={generateAiAnalysis}
                  className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 p-4 rounded-2xl font-bold text-[10px] flex flex-col items-center justify-center space-y-2 group"
                >
                  <Sparkles className={`w-6 h-6 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>Run AI Suite</span>
                </button>
              </div>

              {/* Main Content & Timeline */}
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="p-4 sm:p-8 border-b border-slate-100 bg-white z-10">
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-2 sm:mb-4">{selectedTicket.title}</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedTicket.description}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 scrollbar-hide">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white py-2">Timeline</h4>
                  {selectedTicket.comments?.map((comment) => (
                    <div key={comment.id} className={`flex ${comment.isAi ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl shadow-sm border ${
                        comment.isAi 
                          ? 'bg-indigo-600 text-white border-indigo-700' 
                          : 'bg-white text-slate-700 border-slate-100'
                      }`}>
                        <div className="flex items-center space-x-1 mb-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${comment.isAi ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {comment.author}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
                  {currentUser ? (
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add to timeline..." 
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2"
                      />
                      <button 
                        onClick={() => handleAddComment(commentText)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5 sm:w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-2 text-[10px] font-bold text-slate-400 uppercase">
                      Sign in to comment
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">New Ticket</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Subject</label>
                <input required value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                <textarea required value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none h-32 text-sm" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/10">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;