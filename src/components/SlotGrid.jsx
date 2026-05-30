import React from 'react';
import { ShieldAlert, Users, Check, Lock } from 'lucide-react';
import { useApp } from '../AppContext';

// Simple Custom Icons for Editorial Sport Minimal Feel
export const SportIcon = ({ sport, className = "w-4 h-4" }) => {
  if (sport === 'Football') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 0 0 7.54-3.42l-3.32-1.92A4 4 0 0 1 12 18a4 4 0 0 1-4.22-1.34l-3.32 1.92A10 10 0 0 0 12 22Zm0-20a10 10 0 0 1 7.54 3.42l-3.32 1.92A4 4 0 0 0 12 6a4 4 0 0 0-4.22 1.34L4.46 5.42A10 10 0 0 1 12 2ZM2.05 12c0 2 .6 3.86 1.62 5.42l3.32-1.92a4 4 0 0 1 0-7l-3.32-1.92A9.9 9.9 0 0 0 2.05 12Zm19.9 0c0-2-.6-3.86-1.62-5.42l-3.32 1.92a4 4 0 0 1 0 7l3.32 1.92A9.9 9.9 0 0 0 21.95 12Z" />
        <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </svg>
    );
  }
  if (sport === 'Cricket') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 3.5a2.121 2.121 0 0 1 3 3L8.5 19.5a1 1 0 0 1-.7.3H5.3a.5.5 0 0 1-.5-.5v-2.5a1 1 0 0 1 .3-.7L18.5 3.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 15.5a1 1 0 0 1 .7-.3h1.8a.5.5 0 0 1 .5.5v1.8a1 1 0 0 1-.3.7L5 19.5" />
        <circle cx="17.5" cy="18.5" r="2.5" />
      </svg>
    );
  }
  if (sport === 'Badminton') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17a5 5 0 1 0 10 0v-5a5 5 0 0 0-10 0v5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v10M9 5h6M8 8h8M12 17v5M9 22h6" />
      </svg>
    );
  }
  return null;
};

// Generate list of 17 hourly slots from 6AM to 11PM
export const TIME_SLOTS = [
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
  "10:00 PM - 11:00 PM"
];

// Helper to determine Morning, Afternoon, or Evening pricing category
export const getSlotTier = (slot) => {
  const startHourStr = slot.split(':')[0];
  const startHour = parseInt(startHourStr);
  const isPM = slot.includes('PM') && startHourStr !== '12';
  const isAM12 = slot.includes('AM') && startHourStr === '12';
  const hour24 = isAM12 ? 0 : (isPM ? startHour + 12 : startHour);

  if (hour24 < 12) return 'morning';
  if (hour24 < 17) return 'afternoon';
  return 'evening';
};

const SlotGrid = ({ 
  selectedSport, 
  selectedDate, 
  selectedSlots, 
  onToggleSlot 
}) => {
  const { 
    pricing, 
    weekendSurcharge, 
    turfStatus, 
    maintenanceBlocks, 
    bookings, 
    waitlists, 
    joinWaitlist, 
    currentUser 
  } = useApp();

  // 1. Determine if the selected date is weekend
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 2. Check if Turf is closed by Admin
  const isTurfClosed = turfStatus.status === 'closed';

  // 3. Helper to compute active slot price
  const calculateSlotPrice = (slot, sport) => {
    const tier = getSlotTier(slot);
    const baseRate = pricing[sport]?.[tier] || 0;
    
    if (isWeekend && weekendSurcharge.enabled) {
      return Math.round(baseRate * (1 + weekendSurcharge.rate / 100));
    }
    return baseRate;
  };

  // 4. Helper to determine if slot is blocked for maintenance
  const isMaintenanceBlocked = (slot) => {
    const startHour = parseInt(slot.split(':')[0]);
    const isPM = slot.includes('PM') && slot.split(':')[0] !== '12';
    const isAM12 = slot.includes('AM') && slot.split(':')[0] === '12';
    const hour24 = isAM12 ? 0 : (isPM ? startHour + 12 : startHour);

    return maintenanceBlocks.some(block => {
      if (block.date !== selectedDate) return false;
      const blockStart = parseInt(block.startHour);
      const blockEnd = parseInt(block.endHour);
      return hour24 >= blockStart && hour24 < blockEnd;
    });
  };

  // 5. Helper to check booking status
  const getBookingStatus = (slot, sport) => {
    const booking = bookings.find(b => 
      b.date === selectedDate && 
      b.sport === sport && 
      b.slots.includes(slot)
    );
    if (!booking) return null;
    return booking.status; // 'CONFIRMED', 'CANCEL_PENDING', 'CANCELLED'
  };

  const handleWaitlistClick = (e, slotKey) => {
    e.stopPropagation();
    joinWaitlist(slotKey, currentUser.name);
    alert(`Added to waitlist for this slot! We will notify you at ${currentUser.email} if it opens up.`);
  };

  if (isTurfClosed) {
    return (
      <div className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-8 text-center font-outfit">
        <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h4 className="font-playfair text-lg font-bold text-red-800 dark:text-red-300">Turf is Currently Closed</h4>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-md mx-auto">
          {turfStatus.reason || "Undergoing unscheduled pitch maintenance."}
        </p>
        {turfStatus.reopenDate && (
          <p className="text-[10px] text-red-500 dark:text-red-400 uppercase tracking-widest font-semibold mt-3">
            Expected Reopen: {turfStatus.reopenDate}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {isWeekend && weekendSurcharge.enabled && (
        <div className="text-[10px] uppercase tracking-widest font-semibold text-prime-lightAccent dark:text-prime-darkAccent flex items-center gap-1.5 py-1">
          <Check className="w-3.5 h-3.5" /> Weekend Surcharge (+{weekendSurcharge.rate}%) Applied
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 max-h-[550px] overflow-y-auto pr-1.5 custom-scrollbar">
        {TIME_SLOTS.map((slot) => {
          const price = calculateSlotPrice(slot, selectedSport);
          const isSelected = selectedSlots.includes(slot);
          const bookingStatus = getBookingStatus(slot, selectedSport);
          const isBlocked = isMaintenanceBlocked(slot);
          const isBooked = bookingStatus === 'CONFIRMED' || bookingStatus === 'CANCEL_PENDING';
          const slotKey = `${selectedDate}_${selectedSport}_${slot.replace(/ /g, '')}`;
          const waitlistCount = waitlists[slotKey]?.length || 0;
          const isAlreadyWaitlisted = waitlists[slotKey]?.includes(currentUser.name);

          // Render blocked slot (Maintenance)
          if (isBlocked) {
            return (
              <div 
                key={slot}
                className="flex items-center justify-between p-4 bg-prime-lightBg dark:bg-prime-darkBg opacity-50 border border-dashed border-prime-lightBorder dark:border-prime-darkBorder cursor-not-allowed text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit select-none"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 opacity-75" />
                  <span className="text-sm font-semibold">{slot.split(' - ')[0]}</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-semibold">Maintenance Block</div>
              </div>
            );
          }

          // Render booked slot
          if (isBooked) {
            return (
              <div 
                key={slot}
                className="flex items-center justify-between p-4 bg-prime-lightBg dark:bg-[#151720]/40 border border-prime-lightBorder dark:border-prime-darkBorder/40 text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit"
              >
                <div className="flex items-center space-x-3">
                  <SportIcon sport={selectedSport} className="w-4 h-4 opacity-50" />
                  <span className="text-sm line-through opacity-75">{slot.split(' - ')[0]}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs line-through mr-1 font-medium">₹{price}</span>
                  {isAlreadyWaitlisted ? (
                    <span className="text-[9px] uppercase tracking-widest bg-prime-lightAccent/10 text-prime-lightAccent dark:text-prime-darkAccent px-2.5 py-1 font-semibold flex items-center gap-1 border border-prime-lightAccent/20">
                      <Users className="w-3 h-3" /> Waitlisted
                    </span>
                  ) : (
                    <button 
                      onClick={(e) => handleWaitlistClick(e, slotKey)}
                      className="px-3 py-1.5 border border-prime-lightBorder dark:border-prime-darkBorder text-[10px] uppercase tracking-wider font-semibold hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent transition-all duration-200"
                    >
                      Join Waitlist {waitlistCount > 0 && `(${waitlistCount})`}
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // Render selected slot
          if (isSelected) {
            return (
              <div 
                key={slot}
                onClick={() => onToggleSlot(slot)}
                className="flex items-center justify-between p-4 bg-prime-lightAccent text-white dark:bg-prime-darkAccent border border-prime-lightAccent dark:border-prime-darkAccent cursor-pointer font-outfit select-none animate-pulse-subtle"
              >
                <div className="flex items-center space-x-3">
                  <SportIcon sport={selectedSport} className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold">{slot.split(' - ')[0]}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5">SELECTED</span>
                  <span className="text-sm font-bold">₹{price}</span>
                </div>
              </div>
            );
          }

          // Render available slot
          return (
            <div 
              key={slot}
              onClick={() => onToggleSlot(slot)}
              className="flex items-center justify-between p-4 bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder border-l-4 border-l-prime-lightAccent dark:border-l-prime-darkAccent hover:border-prime-lightAccent dark:hover:border-prime-darkAccent cursor-pointer text-prime-lightText dark:text-prime-darkText font-outfit select-none transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <SportIcon sport={selectedSport} className="w-4 h-4 text-prime-lightAccent dark:text-prime-darkAccent" />
                <span className="text-sm font-semibold">{slot.split(' - ')[0]}</span>
              </div>
              <div className="text-sm font-semibold">₹{price}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotGrid;
