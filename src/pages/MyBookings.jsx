import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Clock, RotateCcw, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';

const MyBookings = () => {
  const { bookings, userLoyalty, userBookingsCount } = useApp();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Filter bookings for the current logged-in user's UUID
  const userBookings = bookings.filter(b => b.userId === user?.id);

  // Split into upcoming and past bookings (Current date: 2026-05-28)
  const todayStr = "2026-05-28";
  
  const upcomingBookings = userBookings.filter(b => b.date >= todayStr && b.status !== 'CANCELLED');
  const pastBookings = userBookings.filter(b => b.date < todayStr || b.status === 'CANCELLED');

  const handleQuickRebook = (sport) => {
    navigate(`/book?sport=${sport}`);
    alert(`Quick Re-book activated for ${sport}! We've pre-selected the arena. Please pick your preferred date and slots.`);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30 uppercase">
            CONFIRMED
          </span>
        );
      case 'CANCEL_PENDING':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-950/30 uppercase">
            Cancellation Pending Admin Approval
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/30 uppercase">
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 font-outfit">
      
      {/* User Standing Header */}
      <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-full border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg flex items-center justify-center text-2xl font-bold font-playfair text-prime-lightAccent dark:text-prime-darkAccent uppercase">
            {profile?.name ? profile.name.slice(0,2) : 'PT'}
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold text-prime-lightText dark:text-prime-darkText">{profile?.name || 'Player'}</h2>
            <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-0.5">Player Member Profile</p>
          </div>
        </div>

        {/* Loyalty Tier Badge */}
        <div className="border border-dashed border-prime-lightBorder dark:border-prime-darkBorder px-6 py-4 flex items-center gap-4 text-center md:text-left bg-prime-lightBg dark:bg-prime-darkBg/30">
          <Award className="w-8 h-8 text-prime-lightAccent dark:text-prime-darkAccent" />
          <div>
            <div className="flex items-center gap-1.5 justify-center md:justify-start">
              <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Loyalty Level</span>
              <span 
                className="px-2 py-0.5 text-[9px] text-white uppercase tracking-wider font-extrabold"
                style={{ backgroundColor: userLoyalty.color }}
              >
                {userLoyalty.name}
              </span>
            </div>
            <p className="text-xs font-semibold text-prime-lightText dark:text-prime-darkText mt-1">
              {userBookingsCount} Arena Booking(s) Completed
            </p>
            {userLoyalty.discount > 0 && (
              <p className="text-[10px] text-prime-lightAccent dark:text-prime-darkAccent font-medium mt-0.5">
                Eligible for {userLoyalty.discount}% reduction discount on all checkout summary carts.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-12">
        
        {/* Upcoming Section */}
        <div>
          <span className="section-label">UPCOMING GAMES</span>
          <hr className="mt-2 mb-6" />

          {upcomingBookings.length === 0 ? (
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder border-dashed p-8 text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted text-xs">
              No upcoming sessions scheduled. Book a slot to get onto the field.
              <div className="mt-4">
                <Link to="/book" className="btn-editorial-primary text-[10px] py-2">
                  Reserve a Slot Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((b) => (
                <div 
                  key={b.id}
                  className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-prime-lightAccent dark:hover:border-prime-darkAccent transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="px-3 py-2 bg-prime-lightBg dark:bg-prime-darkBg border border-prime-lightBorder dark:border-prime-darkBorder font-playfair font-bold text-sm text-prime-lightAccent dark:text-prime-darkAccent text-center min-w-[70px]">
                      <span className="block text-[10px] uppercase font-outfit text-prime-lightTextMuted dark:text-prime-darkTextMuted font-light">
                        {new Date(b.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      {new Date(b.date).getDate()}
                    </div>
                    
                    <div className="font-outfit">
                      <h4 className="font-playfair font-bold text-lg text-prime-lightText dark:text-prime-darkText">
                        {b.sport}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 opacity-75" /> {b.slots.join(', ')}</span>
                        <span>·</span>
                        <span>₹{b.amount} paid</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2.5">
                    <div>
                      {getStatusLabel(b.status)}
                    </div>
                    <Link 
                      to={`/receipt/${b.id}`}
                      className="text-[10px] uppercase tracking-wider font-bold text-prime-lightText hover:text-prime-lightAccent dark:text-prime-darkText dark:hover:text-prime-darkAccent flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Receipt <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Section */}
        <div>
          <span className="section-label">PAST GAMES</span>
          <hr className="mt-2 mb-6" />

          {pastBookings.length === 0 ? (
            <div className="text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted text-xs py-4">
              No historical session bookings logged under your name.
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((b) => {
                const isCancelled = b.status === 'CANCELLED';
                return (
                  <div 
                    key={b.id}
                    className={`bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 ${
                      isCancelled ? 'opacity-50 select-none bg-prime-lightBg dark:bg-prime-darkBg/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="px-3 py-2 bg-prime-lightBg dark:bg-prime-darkBg border border-prime-lightBorder dark:border-prime-darkBorder font-playfair font-bold text-sm text-prime-lightTextMuted dark:text-prime-darkTextMuted text-center min-w-[70px]">
                        <span className="block text-[10px] uppercase font-outfit font-light">
                          {new Date(b.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        {new Date(b.date).getDate()}
                      </div>
                      
                      <div className="font-outfit">
                        <h4 className="font-playfair font-bold text-base text-prime-lightText dark:text-prime-darkText flex items-center gap-2">
                          {b.sport} {isCancelled && <span className="text-xs text-red-500 font-outfit uppercase font-semibold">Cancelled</span>}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 opacity-75" /> {b.slots.join(', ')}</span>
                          <span>·</span>
                          <span>₹{b.amount} paid</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5">
                      <div>
                        {getStatusLabel(b.status)}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link 
                          to={`/receipt/${b.id}`}
                          className="text-[10px] uppercase tracking-wider font-bold text-prime-lightText hover:text-prime-lightAccent dark:text-prime-darkText dark:hover:text-prime-darkAccent flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Receipt
                        </Link>
                        {!isCancelled && (
                          <button 
                            onClick={() => handleQuickRebook(b.sport)}
                            className="px-2.5 py-1 border border-prime-lightBorder dark:border-prime-darkBorder hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent text-[9px] uppercase tracking-wider font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Book Same Slot
                          </button>
                        )}
                      </div>
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
