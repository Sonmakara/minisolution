
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  LifeBuoy, 
  BookOpen, 
  Wrench, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Sparkles,
  ChevronUp,
  Send,
  Loader2,
  ShieldCheck,
  Home,
  User,
  Terminal,
  ChevronDown,
  Info,
  ChevronRight,
  MessageSquareQuote,
  Users,
  LogIn,
  FileText,
  Ticket as TicketIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppRole, User as AppUser, Guide, Ticket } from '../types';
import { mockApi } from '../services/mockApi';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, role, setRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ guides: Guide[], tickets: Ticket[] }>({ guides: [], tickets: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Interactive states for header dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    setCurrentUser(mockApi.getCurrentUser());
  }, [role, activePage]);

  // Handle outside clicks for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search filtering
  useEffect(() => {
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      const guides = mockApi.getGuides().filter(g => g.title.toLowerCase().includes(q) || g.excerpt.toLowerCase().includes(q));
      const tickets = mockApi.getTickets().filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
      setSearchResults({ guides: guides.slice(0, 3), tickets: tickets.slice(0, 3) });
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const userMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'troubleshoot', label: 'AI Help', icon: Wrench },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'tickets', label: 'My Tickets', icon: LifeBuoy },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'tickets', label: 'Global Queue', icon: LifeBuoy },
    { id: 'knowledge', label: 'Content Manager', icon: BookOpen },
    { id: 'reviews', label: 'Review Moderation', icon: MessageSquareQuote },
    { id: 'users', label: 'User Control', icon: Users },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    mockApi.logout();
    setRole('GUEST');
    setActivePage('home');
    setIsUserMenuOpen(false);
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage;
    setAiHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiMessage('');
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userText,
        config: {
          systemInstruction: `You are a helpful IT assistant for the 'Mini IT Solution' platform. User role is ${role}. Keep answers technical yet concise.`
        }
      });
      setAiHistory(prev => [...prev, { role: 'ai', text: response.text || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setAiHistory(prev => [...prev, { role: 'ai', text: "Service temporarily unavailable." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-inter antialiased transition-colors duration-500 ${isAdmin ? 'bg-slate-50' : 'bg-white'}`}>
      
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-72 transition-all duration-500 border-r ${
        isAdmin 
          ? 'bg-slate-950 text-slate-400 border-slate-900 shadow-2xl' 
          : 'bg-white text-slate-500 border-slate-100 shadow-xl shadow-slate-200/50'
      }`}>
        <div className="p-8 flex items-center space-x-3">
          <div className={`${isAdmin ? 'bg-indigo-600' : 'bg-slate-900'} p-2.5 rounded-2xl shadow-lg transition-colors`}>
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-lg tracking-tighter uppercase leading-none ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
              Mini IT
            </span>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">
              {isAdmin ? 'System Backend' : 'Help Center'}
            </span>
          </div>
        </div>

        <nav className="mt-8 px-6 space-y-1.5 flex-1">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Navigation</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-300 ${
                activePage === item.id 
                  ? `${isAdmin ? 'bg-indigo-600 text-white shadow-indigo-600/40' : 'bg-slate-900 text-white shadow-slate-200'} translate-x-1` 
                  : `hover:bg-slate-100 ${isAdmin ? 'hover:bg-slate-900 text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
              }`}
            >
              <div className="flex items-center space-x-4">
                <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {activePage === item.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
            </button>
          ))}
        </nav>

        <div className="px-8 pb-10 space-y-4">
          {!isAdmin && (
            <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Need direct help?</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4">Our engineers are online and ready to assist you in real-time.</p>
              <button 
                onClick={() => setIsAiOpen(true)}
                className="w-full bg-white py-2.5 rounded-xl border border-indigo-200 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                Chat with Tech
              </button>
            </div>
          )}
          {currentUser ? (
             <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
              <span className="font-bold text-sm tracking-tight">Logout</span>
            </button>
          ) : (
             <button 
              onClick={() => setActivePage('login')}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
            >
              <LogIn className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
              <span className="font-bold text-sm tracking-tight">Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-colors duration-500 relative ${isAdmin ? 'bg-slate-50' : 'bg-slate-50/50'}`}>
        <header className={`flex h-20 border-b items-center justify-between px-6 md:px-10 sticky top-0 z-30 transition-all ${
          isAdmin 
            ? 'bg-white/80 backdrop-blur-md border-slate-100 shadow-sm' 
            : 'bg-white/90 backdrop-blur-lg border-slate-100 shadow-sm'
        }`}>
          <div className="relative group w-64 md:w-96" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAdmin ? "Search assets, logs, tickets..." : "How can we help?"} 
              className={`w-full pl-12 pr-6 py-2.5 border-2 rounded-2xl focus:ring-0 transition-all text-sm font-medium ${
                isAdmin 
                  ? 'bg-slate-50/80 border-transparent focus:bg-white focus:border-indigo-600' 
                  : 'bg-slate-100/30 border-slate-50 focus:bg-white focus:border-slate-900 shadow-sm'
              }`}
            />
            
            {/* Global Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full mt-3 left-0 w-full bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-6">
                  {searchResults.guides.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">Articles</h4>
                      {searchResults.guides.map(g => (
                        <button 
                          key={g.id}
                          onClick={() => {
                            setActivePage('knowledge');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 truncate">{g.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tickets.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">Support Tickets</h4>
                      {searchResults.tickets.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => {
                            setActivePage('tickets');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <TicketIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col truncate">
                             <span className="text-sm font-bold text-slate-700 truncate">{t.title}</span>
                             <span className="text-[10px] text-slate-400 font-mono">#{t.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.guides.length === 0 && searchResults.tickets.length === 0 && (
                    <div className="py-4 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No local results</p>
                      <button 
                        onClick={() => {
                          setActivePage('troubleshoot');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="mt-4 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center w-full"
                      >
                        Try AI Analysis <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* AI Status Badge */}
            <div className={`hidden sm:flex items-center rounded-2xl px-4 py-2 border transition-all ${
                isAdmin ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/50 border-indigo-100'
              }`}
            >
               <div className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg font-black text-[9px] mr-3">AI</div>
               <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-500' : 'text-indigo-600'}`}>Engine Online</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className={`p-3 rounded-2xl transition-all relative ${
                  isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-white hover:bg-slate-50 text-slate-400'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-6 px-6 z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Alerts</h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 Active</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex space-x-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">Ticket Escalation</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Issue #88A requires immediate admin attention</p>
                      </div>
                    </div>
                    <div className="flex space-x-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">AI Insights Ready</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">New resolution pattern detected for 'VPN Login'</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              {currentUser ? (
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center space-x-4 pl-6 border-l border-slate-100 group transition-all"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{currentUser.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
                  </div>
                  <div className="relative">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${currentUser.id}`} 
                      className="w-12 h-12 rounded-2xl border-2 border-indigo-100 p-0.5 object-cover shadow-sm group-hover:shadow-md transition-shadow" 
                      alt="Avatar" 
                    />
                    <div className={`absolute -bottom-1 -right-1 bg-white p-0.5 rounded-lg shadow-sm border border-slate-100 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => setActivePage('login')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Get Started
                </button>
              )}

              {currentUser && isUserMenuOpen && (
                <div className="absolute top-full mt-4 right-0 w-64 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-4 px-4 z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 border-b border-slate-100 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logged in as</p>
                    <p className="text-xs font-bold text-slate-900">{currentUser.email}</p>
                  </div>
                  <button className="w-full flex items-center space-x-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Account Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Settings</span>
                  </button>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <button 
                    onClick={() => {
                      const nextRole = isAdmin ? 'GUEST' : 'ADMIN';
                      setRole(nextRole);
                      setActivePage(nextRole === 'ADMIN' ? 'dashboard' : 'home');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-4 bg-indigo-600 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
                  >
                    {isAdmin ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                    <span className="text-[10px] font-black uppercase tracking-widest flex-1 text-left">Switch to {isAdmin ? 'Guest' : 'Admin'} View</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Floating Action (Switch to Admin Panel) when on User/Troubleshoot View */}
        {!isAdmin && currentUser?.role === 'ADMIN' && (
          <div className="max-w-screen-2xl mx-auto px-6 md:px-10 pt-8 flex justify-end">
             <button 
                onClick={() => {
                  setRole('ADMIN');
                  setActivePage('dashboard');
                }}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center space-x-4 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>Switch to Admin Panel</span>
              </button>
          </div>
        )}

        <div className={`p-6 md:p-12 max-w-screen-2xl mx-auto min-h-screen transition-all ${isAdmin ? 'animate-in fade-in zoom-in-95 duration-500' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
          {children}
        </div>
      </main>

      {/* Floating AI Assistant Toggle (Bottom Right) */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500`}>
        {isAiOpen ? (
          <div className="bg-white w-[400px] h-[600px] rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12">
            <div className={`${isAdmin ? 'bg-slate-950' : 'bg-indigo-600'} p-8 flex justify-between items-center transition-colors`}>
              <div className="flex items-center space-x-3">
                <div className={`${isAdmin ? 'bg-indigo-600' : 'bg-white/20'} w-10 h-10 rounded-2xl flex items-center justify-center transition-colors`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-tighter">AI Troubleshooter</h3>
                  <p className={`${isAdmin ? 'text-indigo-400' : 'text-indigo-100'} text-[10px] font-bold uppercase tracking-widest`}>System Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-[13px] text-slate-600 leading-relaxed">
                Hi! I'm your technical co-pilot. I can help with hardware diagnostic tips, analyze system logs, or help you draft a high-priority ticket. What's on your mind?
              </div>
              {aiHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-6 rounded-[32px] text-[13px] leading-relaxed shadow-sm border ${
                    msg.role === 'user' 
                      ? `${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} text-white border-transparent` 
                      : 'bg-white text-slate-700 border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white px-6 py-4 rounded-full border border-slate-100 flex space-x-3 shadow-sm items-center">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Generating Pattern...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-white border-t border-slate-100">
              <form onSubmit={handleAiAsk} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <input 
                  value={aiMessage}
                  onChange={e => setAiMessage(e.target.value)}
                  placeholder="Describe your technical issue..." 
                  className="flex-1 bg-transparent border-none outline-none text-[13px] px-2"
                />
                <button 
                  type="submit"
                  className={`w-10 h-10 ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-indigo-200`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAiOpen(true)}
            className={`w-18 h-18 p-4 rounded-[32px] shadow-[0_24px_48px_-8px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 relative group active:scale-90 ${
              isAdmin ? 'bg-slate-950 hover:bg-slate-900' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Sparkles className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-50 rounded-full border-4 border-slate-50 animate-pulse"></div>
            <div className="absolute right-full mr-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0 whitespace-nowrap">
              Need immediate technical help?
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;
