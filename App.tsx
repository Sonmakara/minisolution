
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Troubleshoot from './pages/Troubleshoot';
import Tickets from './pages/Tickets';
import KnowledgeBase from './pages/KnowledgeBase';
import UserHome from './pages/UserHome';
import ReviewManagement from './pages/ReviewManagement';
import UserManagement from './pages/UserManagement';
import Auth from './pages/Auth';
import { AppRole } from './types';
import { mockApi } from './services/mockApi';

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole>('GUEST');
  const [activePage, setActivePage] = useState<string>('home');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const user = mockApi.getCurrentUser();
    if (user) {
      setRole(user.role === 'ADMIN' ? 'ADMIN' : 'GUEST');
    }
    setIsInitialized(true);
  }, []);

  const handleAuthSuccess = (newRole: AppRole) => {
    setRole(newRole);
    setActivePage(newRole === 'ADMIN' ? 'dashboard' : 'home');
  };

  const handleLogout = () => {
    mockApi.logout();
    setRole('GUEST');
    setActivePage('home');
  };

  const renderPage = () => {
    switch (activePage) {
      // Auth Pages
      case 'login':
        return <Auth onSuccess={handleAuthSuccess} onNavigate={setActivePage} initialMode="login" />;
      case 'signup':
        return <Auth onSuccess={handleAuthSuccess} onNavigate={setActivePage} initialMode="signup" />;
      
      // Guest/Home Page
      case 'home': 
        return <UserHome onNavigate={setActivePage} role={role} />;
      
      // Admin Pages
      case 'dashboard': 
        return <Dashboard />;
      case 'reviews':
        return <ReviewManagement />;
      case 'users':
        return <UserManagement />;
      
      // Shared Pages
      case 'troubleshoot': 
        return <Troubleshoot />;
      case 'tickets': 
        return <Tickets onNavigate={setActivePage} />;
      case 'knowledge': 
        return <KnowledgeBase />;
      
      case 'settings': return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6">
             <Settings className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">System Configuration</h1>
          <p className="max-w-xs text-center">User profile and global application preferences are managed here by administrators.</p>
        </div>
      );
      default: 
        return <UserHome onNavigate={setActivePage} role={role} />;
    }
  };

  if (!isInitialized) return null;

  // Don't show Layout on Auth pages
  if (activePage === 'login' || activePage === 'signup') {
    return renderPage();
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} role={role} setRole={setRole}>
      {renderPage()}
    </Layout>
  );
};

export default App;
