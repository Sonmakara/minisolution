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
    { label: 'Pending', value: openCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'InProgress', value: inProgressCount, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Score', value: '98%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Operational status: <span className="text-emerald-600 font-bold uppercase text-[10px] px-2 py-0.5 bg-emerald-50 rounded">Normal</span></p>
        </div>
        <div className="flex items-center -space-x-2">
          {[1,2,3,4].map(i => (
            <img key={i} src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Team member" />
          ))}
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">+12</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className={`${stat.bg} ${stat.color} p-2 md:p-3 rounded-xl md:rounded-2xl`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-xl md:text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-bold text-base md:text-lg text-slate-900">Incident Volume</h2>
              <select className="text-[10px] bg-slate-50 border-none rounded-lg p-2 font-bold text-slate-500 outline-none">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="flex items-end justify-between h-32 md:h-48 gap-1 md:gap-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="bg-slate-100 rounded-t-lg group-hover:bg-indigo-500 transition-all duration-300 h-full w-full" 
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-base md:text-lg text-slate-900">Queue Monitor</h2>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Topic</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.slice(-4).reverse().map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-900">{ticket.title}</p>
                        <p className="text-[10px] text-slate-400">{ticket.category}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          ticket.status === TicketStatus.OPEN ? 'bg-amber-100 text-amber-700' :
                          ticket.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end -space-x-1">
                          <img src="https://i.pravatar.cc/150?u=1" className="w-5 h-5 rounded-full border border-white" alt="Tech" />
                          <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-[7px] border border-white text-slate-400 font-bold">+2</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="bg-indigo-600 rounded-2xl md:rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
            <h2 className="font-bold text-base md:text-lg mb-4">Usage Insight</h2>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
              Gemini AI has automated <span className="font-bold text-white">42%</span> of basic hardware diagnostic requests this week.
            </p>
            <button className="mt-6 w-full bg-white/20 hover:bg-white/30 py-2.5 rounded-xl font-bold text-xs transition-all backdrop-blur-sm">
              View Insights
            </button>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-base md:text-lg text-slate-900 mb-6">Service Health</h2>
            <div className="space-y-4">
              {[
                { name: 'Identity', status: 'Healthy' },
                { name: 'Database', status: 'Healthy' },
                { name: 'Mail', status: 'Warning' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{service.name}</span>
                  <span className={`text-[9px] font-bold uppercase ${service.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
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