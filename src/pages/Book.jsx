import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, CloudSun, Info, Award, Lock } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import SlotGrid from '../components/SlotGrid';
import BookingSummary from '../components/BookingSummary';

const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return days;
};

const SPORTS = ['Football', 'Cricket'];

const Book = () => {
  const { pricing, userLoyalty } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSport = SPORTS.includes(searchParams.get('sport')) ? searchParams.get('sport') : 'Football';
  const [selectedSport, setSelectedSport] = useState(initialSport);

  const weekDays = generateWeekDays();
  const [selectedDate, setSelectedDate] = useState(weekDays[0].dateStr);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showSummary, setShowSummary] = useState(false); // mobile: toggle summary panel

  useEffect(() => {
    const urlSport = searchParams.get('sport');
    if (SPORTS.includes(urlSport)) setSelectedSport(urlSport);
  }, [searchParams]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center font-outfit">
        <Lock className="w-10 h-10 text-prime-lightAccent dark:text-prime-darkAccent mb-4 opacity-70" />
        <h2 className="font-playfair text-2xl font-bold text-prime-lightText dark:text-prime-darkText">Sign in to Book</h2>
        <p className="text-sm text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-2 max-w-xs">You need a player account to reserve slots at Prime Turf.</p>
        <button onClick={() => navigate('/login')} className="mt-6 px-6 py-3 bg-prime-lightAccent dark:bg-prime-darkAccent text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setSearchParams({ sport });
    setSelectedSlots([]);
  };

  const handleToggleSlot = (slot) => setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  const handleRemoveSlot = (slot) => setSelectedSlots(prev => prev.filter(s => s !== slot));
  const handleClearSlots = () => setSelectedSlots([]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 font-outfit">

      {/* Weather strip */}
      <div className="bg-[#EBF5EC] text-[#245E32] dark:bg-[#122416] dark:text-[#A7DBB2] border border-[#CDE6D2] dark:border-[#224429] py-3 px-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs rounded-sm">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 opacity-85 flex-shrink-0" />
          <span>Today in <strong>Bangalore</strong>: 28°C, Partly Cloudy — Good conditions.</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] bg-[#D4EDD8] dark:bg-[#1C3622] px-2 py-0.5 self-start sm:self-auto">
          ✓ Playable
        </div>
      </div>

      <span className="section-label">Book a Slot</span>
      <h1 className="font-playfair text-3xl md:text-5xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-6 md:mb-8">
        Reserve Your Pitch
      </h1>

      {/* Date selector */}
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] uppercase tracking-widest font-bold text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-prime-lightAccent dark:text-prime-darkAccent" /> Select Date
        </p>
        <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1.5">
          {weekDays.map((day) => {
            const sel = selectedDate === day.dateStr;
            return (
              <button
                key={day.dateStr}
                onClick={() => { setSelectedDate(day.dateStr); setSelectedSlots([]); }}
                className={`flex-shrink-0 w-16 md:w-20 py-3 md:py-4 border text-center transition-all duration-300 font-outfit flex flex-col items-center justify-center ${sel ? 'bg-prime-lightAccent dark:bg-prime-darkAccent border-prime-lightAccent dark:border-prime-darkAccent text-white'
                    : 'bg-white dark:bg-[#1A1D26] border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText hover:border-prime-lightAccent dark:hover:border-prime-darkAccent'
                  }`}
              >
                <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-widest ${sel ? 'text-white/70' : 'text-prime-lightTextMuted dark:text-prime-darkTextMuted'}`}>{day.dayName}</span>
                <span className="text-lg md:text-xl font-bold tracking-tighter mt-0.5">{day.dayNum}</span>
                <span className={`text-[8px] md:text-[9px] uppercase tracking-widest mt-0.5 ${sel ? 'text-white/70' : 'text-prime-lightTextMuted dark:text-prime-darkTextMuted'}`}>{day.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sport tabs + pricing info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-prime-lightBorder dark:border-prime-darkBorder pb-4 mb-6 md:mb-8">
        <div className="flex gap-2 text-xs uppercase tracking-widest font-bold">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => handleSportChange(sport)}
              className={`px-4 md:px-5 py-2.5 border transition-all duration-200 ${selectedSport === sport
                  ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] border-prime-lightText dark:border-prime-darkText'
                  : 'bg-transparent text-prime-lightTextMuted dark:text-prime-darkTextMuted border-prime-lightBorder dark:border-prime-darkBorder hover:text-prime-lightText dark:hover:text-prime-darkText'
                }`}
            >
              {sport}
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder px-3 py-2 flex items-center gap-2 text-[11px] font-outfit text-prime-lightText dark:text-prime-darkText">
          <Info className="w-3.5 h-3.5 text-prime-lightAccent dark:text-prime-darkAccent flex-shrink-0" />
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span>Morning: <strong>₹{pricing[selectedSport]?.morning}/hr</strong></span>
            <span>Afternoon: <strong>₹{pricing[selectedSport]?.afternoon}/hr</strong></span>
            <span>Evening: <strong>₹{pricing[selectedSport]?.evening}/hr</strong></span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

        {/* Slot grid */}
        <div className="lg:col-span-2">
          <h3 className="font-playfair text-xl md:text-2xl font-bold mb-4 text-prime-lightText dark:text-prime-darkText">
            {selectedSport} Schedule
          </h3>
          <SlotGrid
            selectedSport={selectedSport}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onToggleSlot={handleToggleSlot}
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
          <BookingSummary
            selectedSport={selectedSport}
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onRemoveSlot={handleRemoveSlot}
            onClearSlots={handleClearSlots}
          />
          <div className="mt-4 border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-4 flex items-center gap-3">
            <div className="p-2 border border-prime-lightBorder dark:border-prime-darkBorder rounded-full bg-prime-lightBg dark:bg-prime-darkBg">
              <Award className="w-5 h-5 text-prime-lightAccent dark:text-prime-darkAccent" />
            </div>
            <div className="font-outfit">
              <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest">Loyalty Tier</p>
              <h4 className="font-bold text-xs text-prime-lightText dark:text-prime-darkText mt-0.5">{userLoyalty.name} Member</h4>
              <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-0.5">
                {userLoyalty.discount > 0 ? `${userLoyalty.discount}% discount applied!` : 'Book 6 sessions for Silver tier discount.'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1A1D26] border-t border-prime-lightBorder dark:border-prime-darkBorder p-3 flex items-center justify-between gap-3">
          <div className="font-outfit">
            {selectedSlots.length === 0 ? (
              <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted">No slots selected</p>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">{selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected</p>
                <p className="text-sm font-bold text-prime-lightText dark:text-prime-darkText">{selectedSport} · {selectedDate}</p>
              </>
            )}
          </div>
          <button
            onClick={() => setShowSummary(true)}
            disabled={selectedSlots.length === 0}
            className="px-5 py-2.5 bg-prime-lightAccent dark:bg-prime-darkAccent text-white text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Review & Pay
          </button>
        </div>

        {/* Mobile summary sheet */}
        {showSummary && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
            <div className="bg-white dark:bg-[#0F1117] rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-prime-lightBorder dark:border-prime-darkBorder">
                <h3 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">Booking Summary</h3>
                <button onClick={() => setShowSummary(false)} className="text-prime-lightTextMuted dark:text-prime-darkTextMuted text-xl font-light">×</button>
              </div>
              <div className="p-4">
                <BookingSummary
                  selectedSport={selectedSport}
                  selectedDate={selectedDate}
                  selectedSlots={selectedSlots}
                  onRemoveSlot={handleRemoveSlot}
                  onClearSlots={() => { handleClearSlots(); setShowSummary(false); }}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />

    </div>
  );
};

export default Book;
