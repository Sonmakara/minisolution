
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Github, Chrome, Wrench } from 'lucide-react';
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
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Artificial delay
    setTimeout(() => {
      if (mode === 'login') {
        const user = mockApi.login(email, password);
        if (user) {
          onSuccess(user.role === 'ADMIN' ? 'ADMIN' : 'GUEST');
        } else {
          setError('Invalid credentials or account disabled.');
        }
      } else {
        if (!name || !email || !password) {
          setError('Please fill in all fields.');
        } else {
          const user = mockApi.register(name, email, password);
          onSuccess('GUEST');
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Illustration & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-12">
              <div className="bg-indigo-600 p-2.5 rounded-2xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase">Mini IT</span>
            </div>
            
            <h2 className="text-4xl font-black leading-tight mb-6">
              Empowering your workspace with <span className="text-indigo-400">Intelligent</span> support.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Join 12,000+ engineers solving complex infrastructure issues daily using Gemini-powered diagnostics.
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i+20}`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="User" />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-400">
              Trusted by IT experts worldwide
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' 
                ? 'Access your troubleshooting workspace and tickets.' 
                : 'Create your account to start diagnosing issues.'}
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center space-x-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
              <Chrome className="w-5 h-5" />
              <span>Google</span>
            </button>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Or continue with email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in shake duration-500">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@enterprise.com" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authenticate' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm font-bold">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <button 
            onClick={() => onNavigate('home')}
            className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
