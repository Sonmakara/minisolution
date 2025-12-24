
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Github, Chrome, Wrench, Loader2 } from 'lucide-react';
import { mockApi } from '../services/mockApi';

interface AuthProps {
  onSuccess: (role: 'ADMIN' | 'GUEST') => void;
  onNavigate: (page: string) => void;
  initialMode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ onSuccess, onNavigate, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'github' | 'google' | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Artificial delay to show the high-tech scanning effect
    setTimeout(() => {
      if (mode === 'login') {
        const user = mockApi.login(email, password);
        if (user) {
          onSuccess(user.role === 'ADMIN' ? 'ADMIN' : 'GUEST');
        } else {
          setError('Access Denied: Invalid credentials or account restricted.');
        }
      } else {
        if (!name || !email || !password) {
          setError('Information Missing: Please complete all fields.');
        } else {
          const user = mockApi.register(name, email, password);
          onSuccess('GUEST');
        }
      }
      setIsLoading(false);
    }, 1800);
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
    setSocialLoading(provider);
    setError('');
    
    // Simulate OAuth handshake
    setTimeout(() => {
      // For mock purposes, we log in as a standard user
      const user = mockApi.login('john.doe@enterprise.com', 'password');
      if (user) {
        onSuccess('GUEST');
      } else {
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication failed.`);
      }
      setSocialLoading(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/50 p-4 md:p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] md:rounded-[56px] shadow-[0_48px_100px_-24px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-100">
        
        {/* Left Side: Illustration & Branding (Sleek Dark Panel) */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#0F172A] text-white relative overflow-hidden">
          {/* High-tech glow effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="bg-indigo-600 p-3 rounded-[20px] shadow-lg shadow-indigo-600/20">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase">Mini IT</span>
            </div>
            
            <h2 className="text-5xl font-black leading-[1.1] mb-8 tracking-tight">
              Empowering your workspace with <span className="text-indigo-400">Intelligent</span> support.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-12">
              Join 12,000+ engineers solving complex infrastructure issues daily using Gemini-powered diagnostics.
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i+25}`} className="w-10 h-10 rounded-full border-2 border-[#0F172A]" alt="User" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Trusted by IT experts worldwide
            </p>
          </div>
        </div>

        {/* Right Side: Form (Clean White Panel) */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' 
                ? 'Access your troubleshooting workspace and tickets.' 
                : 'Create your account to start diagnosing issues.'}
            </p>
          </div>

          {/* Social Auth Buttons (Functional mock) */}
          <div className="flex gap-4 mb-10">
            <button 
              type="button"
              disabled={isLoading || socialLoading !== null}
              onClick={() => handleSocialLogin('github')}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-xs shadow-sm disabled:opacity-50"
            >
              {socialLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              <span>GitHub</span>
            </button>
            <button 
              type="button"
              disabled={isLoading || socialLoading !== null}
              onClick={() => handleSocialLogin('google')}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-xs shadow-sm disabled:opacity-50"
            >
              {socialLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Chrome className="w-4 h-4 text-red-500" />}
              <span>Google</span>
            </button>
          </div>

          <div className="relative flex items-center mb-10">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Or continue with email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-[20px] text-xs font-bold border border-red-100 animate-in shake duration-500 text-center">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith" 
                  className="w-full px-6 py-4.5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-semibold text-slate-900 shadow-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@enterprise.com" 
                className="w-full px-6 py-4.5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-semibold text-slate-900 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">Forgot?</button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-6 py-4.5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-semibold text-slate-900 shadow-sm"
              />
            </div>

            {/* High-tech Pill Button from screenshot */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading || socialLoading !== null}
                className="group relative w-full h-[64px] bg-black text-white rounded-full font-black text-[11px] uppercase tracking-[0.25em] overflow-hidden transition-all active:scale-95 disabled:opacity-90 shadow-2xl shadow-slate-200"
              >
                {/* Background scanning effect when loading */}
                {isLoading && (
                  <div className="absolute inset-0 bg-indigo-600/20 overflow-hidden">
                     <div className="absolute inset-0 w-1/2 h-full bg-indigo-500/40 blur-xl animate-[scan_1.5s_infinite] transition-all" style={{ animation: 'scan 1.5s linear infinite' }}></div>
                  </div>
                )}
                
                {/* Horizontal Progress Line (Visible during loading or as design element) */}
                <div className={`absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[1px] bg-white/20 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="h-full bg-white shadow-[0_0_15px_#fff] w-24 animate-[progress_1s_infinite]"></div>
                </div>

                <div className="relative flex items-center justify-center space-x-3 z-10">
                  {isLoading ? (
                    <span className="flex items-center">
                       AUTHENTICATING
                       <Loader2 className="w-4 h-4 ml-3 animate-spin" />
                    </span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Authenticate' : 'Establish Account'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              {mode === 'login' ? "Don't have an account?" : "Already joined the ranks?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-3 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <button 
            onClick={() => onNavigate('home')}
            className="mt-10 self-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes progress {
          0% { left: 0%; width: 0%; opacity: 0; }
          50% { left: 25%; width: 50%; opacity: 1; }
          100% { left: 100%; width: 0%; opacity: 0; }
        }
        .animate-scan { animation: scan 1.5s linear infinite; }
      `}} />
    </div>
  );
};

export default Auth;
