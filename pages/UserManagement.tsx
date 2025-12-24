
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  UserPlus, 
  MoreHorizontal,
  Mail,
  User as UserIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { User, UserStatus } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setUsers(mockApi.getUsers());
  }, []);

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
    mockApi.updateUser(userId, { status: nextStatus });
    setUsers(mockApi.getUsers());
  };

  const handleChangeRole = (userId: string, newRole: 'USER' | 'ADMIN' | 'TECHNICIAN') => {
    mockApi.updateUser(userId, { role: newRole });
    setUsers(mockApi.getUsers());
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Control</h1>
          <p className="text-slate-500">Manage platform access, permissions and security roles.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Find users by name or email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 flex items-center space-x-2 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              <Filter className="w-4 h-4" />
              <span>Role Filter</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Directory: {users.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">User Identity</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5">System Role</th>
                <th className="px-8 py-5">Platform Status</th>
                <th className="px-8 py-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${user.id}`} 
                        className="w-10 h-10 rounded-2xl border-2 border-slate-50 object-cover" 
                        alt="Avatar" 
                      />
                      <span className="font-bold text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                        user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                        user.role === 'TECHNICIAN' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <option value="USER">User</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === UserStatus.ACTIVE ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === UserStatus.ACTIVE ? 'text-emerald-600' : 'text-red-600'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest ${
                          user.status === UserStatus.ACTIVE 
                            ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {user.status === UserStatus.ACTIVE ? <Ban className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>{user.status === UserStatus.ACTIVE ? 'Disable' : 'Enable'}</span>
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                    No users found matching your search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
