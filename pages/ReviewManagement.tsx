
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Trash2, 
  CheckCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  MessageSquareQuote,
  Calendar,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Review } from '../types';

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setReviews(mockApi.getReviews());
  }, []);

  const handleApprove = (id: string) => {
    mockApi.updateReviewStatus(id, 'APPROVED');
    setReviews(mockApi.getReviews());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      mockApi.deleteReview(id);
      setReviews(mockApi.getReviews());
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
        <p className="text-slate-500">Manage user feedback and platform experience quality.</p>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search resources, users, or comments..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 flex items-center space-x-2 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              <Filter className="w-4 h-4" />
              <span>Status</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredReviews.length} records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Resource (Subject)</th>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Rating</th>
                <th className="px-8 py-5">Comment</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Tag className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 block truncate max-w-[150px]">{review.resourceName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{review.userName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-600 italic line-clamp-2 max-w-[250px]">"{review.comment}"</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{review.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {review.status === 'PENDING' && (
                        <button 
                          onClick={() => handleApprove(review.id)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Approve Review"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquareQuote className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching reviews found</p>
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

export default ReviewManagement;
