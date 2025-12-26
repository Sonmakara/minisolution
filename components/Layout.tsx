
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
  Ticket as TicketIcon,
  Circle,
  Database,
  Activity
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppRole, User as AppUser, Guide, Ticket, Notification, NotificationType } from '../types';
import { mockApi } from '../services/mockApi';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, role, setRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;
  
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
    refreshNotifications();
    
    const handleNotifyUpdate = () => refreshNotifications();
    window.addEventListener('notifications_updated', handleNotifyUpdate);
    return () => window.removeEventListener('notifications_updated', handleNotifyUpdate);
  }, [role, activePage]);

  const refreshNotifications = () => {
    setNotifications(mockApi.getNotifications());
  };

  const handleMarkAsRead = (id: string) => {
    mockApi.markNotificationAsRead(id);
    refreshNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      setActivePage(notification.link);
    }
    setIsNotificationsOpen(false);
  };

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

  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case NotificationType.TICKET: return <LifeBuoy className="w-4 h-4" />;
      case NotificationType.REVIEW: return <MessageSquareQuote className="w-4 h-4" />;
      case NotificationType.SYSTEM: return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch(type) {
      case NotificationType.TICKET: return 'bg-amber-100 text-amber-600';
      case NotificationType.REVIEW: return 'bg-indigo-100 text-indigo-600';
      case NotificationType.SYSTEM: return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-inter antialiased transition-colors duration-500 ${isAdmin ? 'bg-slate-50' : 'bg-white'}`}>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen transition-transform duration-500 border-r ${
        isAdmin 
          ? 'bg-slate-950 text-slate-400 border-slate-900 shadow-2xl' 
          : 'bg-white text-slate-500 border-slate-100 shadow-xl shadow-slate-200/50'
      } flex flex-col`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          <button className="md:hidden p-2 text-slate-400 hover:text-slate-100" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 px-6 space-y-1.5 flex-1 overflow-y-auto pb-6 custom-scrollbar">
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

        <div className="px-8 pb-10 mt-auto pt-6 space-y-4">
          {!isAdmin && (
            <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 hidden sm:block">
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`flex h-20 border-b items-center justify-between px-4 md:px-10 sticky top-0 z-30 transition-all ${
          isAdmin 
            ? 'bg-white/80 backdrop-blur-md border-slate-100 shadow-sm' 
            : 'bg-white/90 backdrop-blur-lg border-slate-100 shadow-sm'
        }`}>
          <div className="flex items-center space-x-4 flex-1">
            <button 
              className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative group max-w-sm md:max-w-md w-full" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAdmin ? "Search logs..." : "Search help..."} 
                className={`w-full pl-11 pr-4 py-2.5 border-2 rounded-2xl focus:ring-0 transition-all text-sm font-medium ${
                  isAdmin 
                    ? 'bg-slate-50/80 border-transparent focus:bg-white focus:border-indigo-600' 
                    : 'bg-slate-100/30 border-slate-50 focus:bg-white focus:border-slate-900 shadow-sm'
                }`}
              />
              
              {isSearchOpen && (
                <div className="absolute top-full mt-3 left-0 w-full bg-white rounded-[24px] shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-4">
                    {searchResults.guides.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Articles</h4>
                        {searchResults.guides.map(g => (
                          <button 
                            key={g.id}
                            onClick={() => {
                              setActivePage('knowledge');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center space-x-3 p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                          >
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-700 truncate">{g.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.tickets.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tickets</h4>
                        {searchResults.tickets.map(t => (
                          <button 
                            key={t.id}
                            onClick={() => {
                              setActivePage('tickets');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center space-x-3 p-2.5 hover:bg-slate-50 rounded-xl transition-all text-left group"
                          >
                            <TicketIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-700 truncate">{t.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6">
            <div className={`hidden lg:flex items-center rounded-2xl px-4 py-2 border transition-all ${
                isAdmin ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/50 border-indigo-100'
              }`}
            >
               <div className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-lg font-black text-[8px] mr-2">AI</div>
               <span className={`text-[8px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-500' : 'text-indigo-600'}`}>Engine Online</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className={`p-2.5 md:p-3 rounded-xl transition-all relative ${
                  isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-white hover:bg-slate-50 text-slate-400'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute top-full mt-4 right-0 w-72 md:w-96 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-4 px-4 z-50 animate-in fade-in slide-in-from-top-4 overflow-hidden">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Alerts</h4>
                    {unreadCount > 0 && <span className="text-[8px] font-black text-indigo-600 uppercase">Latest First</span>}
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`flex space-x-3 p-3 rounded-xl transition-colors cursor-pointer border ${
                            n.read ? 'bg-white border-transparent' : 'bg-slate-50/80 border-slate-100'
                          } hover:bg-slate-100/50 group`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(n.type)}`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-[11px] font-black text-slate-900 truncate">{n.title}</p>
                              {!n.read && <Circle className="w-1.5 h-1.5 fill-indigo-600 text-indigo-600" />}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Everything's quiet</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        notifications.forEach(n => mockApi.markNotificationAsRead(n.id));
                        refreshNotifications();
                      }}
                      className="w-full mt-4 py-2 border-t border-slate-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                    >
                      Dismiss All
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              {currentUser ? (
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center space-x-2 md:space-x-4 md:pl-6 md:border-l border-slate-100 group transition-all"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900 tracking-tight leading-none mb-1">{currentUser.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
                  </div>
                  <img 
                    src={`https://i.pravatar.cc/150?u=${currentUser.id}`} 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-indigo-100 object-cover shadow-sm" 
                    alt="Avatar" 
                  />
                </button>
              ) : (
                <button 
                  onClick={() => setActivePage('login')}
                  className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Join
                </button>
              )}

              {currentUser && isUserMenuOpen && (
                <div className="absolute top-full mt-4 right-0 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-3 border-b border-slate-100 mb-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">User session</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.email}</p>
                  </div>
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      const nextRole = isAdmin ? 'GUEST' : 'ADMIN';
                      setRole(nextRole);
                      setActivePage(nextRole === 'ADMIN' ? 'dashboard' : 'home');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-indigo-600 text-white rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    <Terminal className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest flex-1 text-left">Switch View</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-500 rounded-xl transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {!isAdmin && currentUser?.role === 'ADMIN' && (
          <div className="max-w-screen-2xl mx-auto px-4 md:px-10 pt-6 flex justify-end">
             <button 
                onClick={() => {
                  setRole('ADMIN');
                  setActivePage('dashboard');
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Go to Admin Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
          </div>
        )}

        <div className={`p-4 md:p-12 max-w-screen-2xl mx-auto min-h-screen transition-all ${isAdmin ? 'animate-in fade-in zoom-in-95 duration-500' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
          {children}
        </div>
      </div>

      <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-500`}>
        {isAiOpen ? (
          <div className="bg-white w-[90vw] sm:w-[400px] h-[75vh] sm:h-[600px] rounded-[32px] md:rounded-[48px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12">
            <div className={`${isAdmin ? 'bg-slate-950' : 'bg-indigo-600'} p-6 md:p-8 flex justify-between items-center transition-colors`}>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-tighter">AI Troubleshooter</h3>
                  <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest">Live Engine</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scrollbar-hide bg-slate-50/30">
              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm text-[12px] md:text-[13px] text-slate-600 leading-relaxed">
                How can I assist you with your technical issues today?
              </div>
              {aiHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-[12px] md:text-[13px] leading-relaxed shadow-sm border ${
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
                  <div className="bg-white px-4 py-3 rounded-full border border-slate-100 flex space-x-2 items-center">
                    <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-8 bg-white border-t border-slate-100">
              <form onSubmit={handleAiAsk} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <input 
                  value={aiMessage}
                  onChange={e => setAiMessage(e.target.value)}
                  placeholder="Ask something..." 
                  className="flex-1 bg-transparent border-none outline-none text-[12px] px-2"
                />
                <button 
                  type="submit"
                  className={`w-9 h-9 ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} text-white rounded-lg flex items-center justify-center`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAiOpen(true)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[32px] shadow-2xl flex items-center justify-center transition-all duration-300 group active:scale-90 ${
              isAdmin ? 'bg-slate-950 hover:bg-slate-900' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;
