import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Clock, RotateCcw, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';

const MyBookings = () => {
  const { bookings, userLoyalty, userBookingsCount } = useApp();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const userBookings = bookings.filter(b => b.userId === user?.id);
  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = userBookings.filter(b => b.date >= todayStr && b.status !== 'CANCELLED');
  const pastBookings = userBookings.filter(b => b.date < todayStr || b.status === 'CANCELLED');

  const getStatusLabel = (status) => {
    const base = 'px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase border inline-block';
    switch (status) {
      case 'CONFIRMED':
        return <span className={`${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30`}>Confirmed</span>;
      case 'PENDING_PAYMENT':
        return <span className={`${base} bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100`}>Awaiting Payment Verification</span>;
      case 'CANCEL_PENDING':
        return <span className={`${base} bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-orange-100`}>Cancel Pending Approval</span>;
      case 'CANCELLED':
        return <span className={`${base} bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-950/30`}>Cancelled</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 font-outfit">

      {/* Profile header */}
      <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 mb-10 md:mb-12 shadow-sm">
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-14 h-14 rounded-full border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg flex items-center justify-center text-xl font-bold font-playfair text-prime-lightAccent dark:text-prime-darkAccent uppercase">
            {profile?.name ? profile.name.slice(0, 2) : 'PT'}
          </div>
          <div>
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-prime-lightText dark:text-prime-darkText">{profile?.name || 'Player'}</h2>
            <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="border border-dashed border-prime-lightBorder dark:border-prime-darkBorder px-5 py-4 flex items-center gap-3 bg-prime-lightBg dark:bg-prime-darkBg/30 w-full md:w-auto justify-center md:justify-start">
          <Award className="w-7 h-7 text-prime-lightAccent dark:text-prime-darkAccent flex-shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Loyalty</span>
              <span className="px-2 py-0.5 text-[9px] text-white uppercase tracking-wider font-extrabold" style={{ backgroundColor: userLoyalty.color }}>{userLoyalty.name}</span>
            </div>
            <p className="text-xs font-semibold text-prime-lightText dark:text-prime-darkText mt-0.5">{userBookingsCount} Booking(s) Completed</p>
            {userLoyalty.discount > 0 && (
              <p className="text-[10px] text-prime-lightAccent dark:text-prime-darkAccent font-medium mt-0.5">{userLoyalty.discount}% discount active</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-10 md:space-y-12">

        {/* Upcoming */}
        <div>
          <span className="section-label">Upcoming Games</span>
          <hr className="mt-2 mb-5 md:mb-6" />
          {upcomingBookings.length === 0 ? (
            <div className="border border-dashed border-prime-lightBorder dark:border-prime-darkBorder p-8 text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted text-xs">
              No upcoming sessions. Book a slot to get on the field.
              <div className="mt-4">
                <Link to="/book" className="inline-block px-5 py-2.5 bg-prime-lightAccent dark:bg-prime-darkAccent text-white text-[10px] font-bold uppercase tracking-widest">Reserve a Slot</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {upcomingBookings.map(b => (
                <div key={b.id} className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-prime-lightAccent dark:hover:border-prime-darkAccent transition-all duration-300 shadow-sm">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="px-2.5 py-2 bg-prime-lightBg dark:bg-prime-darkBg border border-prime-lightBorder dark:border-prime-darkBorder font-playfair font-bold text-sm text-prime-lightAccent dark:text-prime-darkAccent text-center min-w-[58px] flex-shrink-0">
                      <span className="block text-[9px] uppercase font-outfit text-prime-lightTextMuted dark:text-prime-darkTextMuted font-light">
                        {new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      {new Date(b.date + 'T00:00:00').getDate()}
                    </div>
                    <div>
                      <h4 className="font-playfair font-bold text-base md:text-lg text-prime-lightText dark:text-prime-darkText">{b.sport}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 opacity-75" /> {b.slots.join(', ')}</span>
                        <span>·</span>
                        <span>₹{b.amount}</span>
                      </div>
                      <div className="mt-2">{getStatusLabel(b.status)}</div>
                    </div>
                  </div>
                  <Link to={`/receipt/${b.id}`} className="text-[10px] uppercase tracking-wider font-bold text-prime-lightText hover:text-prime-lightAccent dark:text-prime-darkText dark:hover:text-prime-darkAccent flex items-center gap-1 self-start sm:self-auto flex-shrink-0">
                    <FileText className="w-3.5 h-3.5" /> Receipt <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        <div>
          <span className="section-label">Past Games</span>
          <hr className="mt-2 mb-5 md:mb-6" />
          {pastBookings.length === 0 ? (
            <p className="text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted text-xs py-4">No past bookings on record.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {pastBookings.map(b => {
                const isCancelled = b.status === 'CANCELLED';
                return (
                  <div key={b.id} className={`bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder/60 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all duration-300 ${isCancelled ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="px-2.5 py-2 bg-prime-lightBg dark:bg-prime-darkBg border border-prime-lightBorder dark:border-prime-darkBorder font-playfair font-bold text-sm text-prime-lightTextMuted text-center min-w-[58px] flex-shrink-0">
                        <span className="block text-[9px] uppercase font-outfit font-light">
                          {new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        {new Date(b.date + 'T00:00:00').getDate()}
                      </div>
                      <div>
                        <h4 className="font-playfair font-bold text-base text-prime-lightText dark:text-prime-darkText">{b.sport}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 opacity-75" /> {b.slots.join(', ')}</span>
                          <span>·</span><span>₹{b.amount}</span>
                        </div>
                        <div className="mt-2">{getStatusLabel(b.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
                      <Link to={`/receipt/${b.id}`} className="text-[10px] uppercase tracking-wider font-bold text-prime-lightText hover:text-prime-lightAccent dark:text-prime-darkText dark:hover:text-prime-darkAccent flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Receipt
                      </Link>
                      {!isCancelled && (
                        <button onClick={() => navigate(`/book?sport=${b.sport}`)} className="px-2.5 py-1 border border-prime-lightBorder dark:border-prime-darkBorder hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent text-[9px] uppercase tracking-wider font-bold transition-all duration-200 flex items-center gap-1">
                          <RotateCcw className="w-2.5 h-2.5" /> Rebook
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
