
import React from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { TicketStatus } from '../types';

const Dashboard: React.FC = () => {
  const tickets = mockApi.getTickets();
  const openCount = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgressCount = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const resolvedCount = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;

  const stats = [
    { label: 'Pending Tickets', value: openCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'InProgress', value: inProgressCount, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Resolved (MTD)', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Security Score', value: '98%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Health</h1>
          <p className="text-slate-500 mt-1">Operational status is <span className="text-emerald-600 font-bold uppercase text-xs px-2 py-0.5 bg-emerald-50 rounded">Normal</span></p>
        </div>
        <div className="flex items-center -space-x-2">
          {[1,2,3,4].map(i => (
            <img key={i} src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="Team member" />
          ))}
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">+12</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Visualization (Mock Chart) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-lg text-slate-900">Incident Volume</h2>
              <select className="text-xs bg-slate-50 border-none rounded-lg p-2 font-bold text-slate-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="bg-slate-100 rounded-t-lg group-hover:bg-indigo-500 transition-all duration-300 relative overflow-hidden" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 bg-indigo-100 h-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(h/2)} pts
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-900">Queue Monitor</h2>
              <button className="text-indigo-600 text-sm font-semibold hover:underline flex items-center">
                Full Queue <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Topic</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.slice(-4).reverse().map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-400 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-slate-200 mr-2"></span>
                          {ticket.category}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          ticket.status === TicketStatus.OPEN ? 'bg-amber-100 text-amber-700' :
                          ticket.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end -space-x-1">
                          <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border border-white" alt="Tech" />
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[8px] border border-white text-slate-400 font-bold">+2</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                        No active tickets in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <h2 className="font-bold text-lg mb-4 relative z-10">AI Usage Insight</h2>
            <p className="text-indigo-100 text-sm relative z-10 leading-relaxed">
              Gemini AI has automated <span className="font-bold text-white">42%</span> of basic hardware diagnostic requests this week, saving your team roughly <span className="font-bold text-white">12 hours</span>.
            </p>
            <button className="mt-6 w-full bg-white/20 hover:bg-white/30 py-3 rounded-2xl font-bold text-sm transition-all relative z-10 backdrop-blur-sm">
              View Detailed ROI
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-lg text-slate-900 mb-6">Service Health</h2>
            <div className="space-y-6">
              {[
                { name: 'Identity Service', status: 'Healthy' },
                { name: 'Database Clusters', status: 'Healthy' },
                { name: 'Mail Servers', status: 'Warning' },
                { name: 'Edge CDN', status: 'Healthy' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    <span className="text-sm font-medium text-slate-700">{service.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${service.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
