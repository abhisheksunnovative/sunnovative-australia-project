import React from 'react';
import { Star, User, ShieldCheck } from 'lucide-react';

export default function UserReviewsSection({ settings }) {
  const userReviewsData = settings?.userReviews;
  if (!userReviewsData || !userReviewsData.reviews || userReviewsData.reviews.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-6">
            {userReviewsData.sectionTitle || "User Reviews"}
          </h2>
          <div className="w-24 h-1.5 bg-solar-yellow mx-auto rounded-full mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userReviewsData.reviews.map((rev, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-solar-yellow/30">
                  {rev.userPhoto ? (
                    <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{rev.userName}</h4>
                  <div className="flex gap-0.5 text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 italic text-sm mb-6 flex-grow">"{rev.feedback}"</p>
              
              {rev.epcName && (
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Installed By</p>
                    <p className="text-sm font-bold text-slate-700">{rev.epcName}</p>
                  </div>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (rev.epcRating || 5) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
