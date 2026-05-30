import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CloudSun, Info, Award } from 'lucide-react';
import { useApp } from '../AppContext';
import SlotGrid from '../components/SlotGrid';
import BookingSummary from '../components/BookingSummary';

const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    days.push({
      dateStr: nextDay.toISOString().split('T')[0],
      dayName: nextDay.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: nextDay.getDate(),
      monthName: nextDay.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return days;
};

const Book = () => {
  const { pricing, userLoyalty } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read sport filter from URL parameter (defaults to Football)
  const initialSport = searchParams.get('sport') || 'Football';
  const [selectedSport, setSelectedSport] = useState(initialSport);
  
  const weekDays = generateWeekDays();
  const [selectedDate, setSelectedDate] = useState(weekDays[0].dateStr);
  const [selectedSlots, setSelectedSlots] = useState([]); // Array of strings (e.g. "08:00 AM - 09:00 AM")

  // Update selected sport when URL param changes
  useEffect(() => {
    const urlSport = searchParams.get('sport');
    if (urlSport && ['Football', 'Cricket', 'Badminton'].includes(urlSport)) {
      setSelectedSport(urlSport);
    } else if (urlSport === 'All') {
      setSelectedSport('All');
    }
  }, [searchParams]);

  const handleSportTabChange = (sport) => {
    setSelectedSport(sport);
    setSearchParams({ sport });
    // Reset selected slots when switching filters to avoid checkout errors
    setSelectedSlots([]);
  };

  const handleToggleSlot = (slot) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot) 
        : [...prev, slot]
    );
  };

  const handleRemoveSlot = (slot) => {
    setSelectedSlots(prev => prev.filter(s => s !== slot));
  };

  const handleClearSlots = () => {
    setSelectedSlots([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-outfit">
      
      {/* 1. Weather Strip */}
      <div className="bg-[#EBF5EC] text-[#245E32] dark:bg-[#122416] dark:text-[#A7DBB2] border border-[#CDE6D2] dark:border-[#224429] py-3 px-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 opacity-85" />
          <span>
            Today in <strong>Bangalore</strong>: 28°C, Partly Cloudy — Good conditions for outdoor play.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] bg-[#D4EDD8] dark:bg-[#1C3622] px-2 py-0.5">
          ✓ Verified Playable
        </div>
      </div>

      <span className="section-label">BOOK A SLOT</span>
      <h1 className="font-playfair text-4xl md:text-5xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-8">
        Reserve Your Pitch
      </h1>

      {/* 2. Date Selector: Clean horizontal week strip */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-widest font-bold text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-3.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-prime-lightAccent dark:text-prime-darkAccent" /> Select Date Range
        </p>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1.5">
          {weekDays.map((day) => {
            const isDateSelected = selectedDate === day.dateStr;
            return (
              <button
                key={day.dateStr}
                onClick={() => {
                  setSelectedDate(day.dateStr);
                  setSelectedSlots([]); // Clear slots on date change
                }}
                className={`flex-shrink-0 w-20 py-4 border text-center transition-all duration-300 font-outfit flex flex-col items-center justify-center ${
                  isDateSelected
                    ? 'bg-prime-lightAccent dark:bg-prime-darkAccent border-prime-lightAccent dark:border-prime-darkAccent text-white'
                    : 'bg-white dark:bg-[#1A1D26] border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText hover:border-prime-lightAccent dark:hover:border-prime-darkAccent'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-widest opacity-60 ${isDateSelected ? 'text-white' : 'text-prime-lightTextMuted dark:text-prime-darkTextMuted'}`}>
                  {day.dayName}
                </span>
                <span className="text-xl font-bold tracking-tighter mt-1">
                  {day.dayNum}
                </span>
                <span className={`text-[9px] uppercase tracking-widest mt-1 opacity-70 ${isDateSelected ? 'text-white' : 'text-prime-lightTextMuted dark:text-prime-darkTextMuted'}`}>
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sport Type Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-prime-lightBorder dark:border-prime-darkBorder pb-4 mb-8">
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest font-bold">
          {['All', 'Football', 'Cricket', 'Badminton'].map((sport) => {
            const isActive = selectedSport === sport;
            return (
              <button
                key={sport}
                onClick={() => handleSportTabChange(sport)}
                className={`px-5 py-2.5 border transition-all duration-200 ${
                  isActive
                    ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] border-prime-lightText dark:border-prime-darkText'
                    : 'bg-transparent text-prime-lightTextMuted dark:text-prime-darkTextMuted border-prime-lightBorder dark:border-prime-darkBorder hover:text-prime-lightText dark:hover:text-prime-darkText'
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>

        {/* Pricing Tiers Small Info Card */}
        {selectedSport !== 'All' && (
          <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder px-4 py-2 flex items-center gap-3 text-[11px] font-outfit text-prime-lightText dark:text-prime-darkText">
            <Info className="w-3.5 h-3.5 text-prime-lightAccent dark:text-prime-darkAccent flex-shrink-0" />
            <div className="flex flex-wrap gap-x-4">
              <span>Morning: <strong>₹{pricing[selectedSport]?.morning}/hr</strong></span>
              <span>Afternoon: <strong>₹{pricing[selectedSport]?.afternoon}/hr</strong></span>
              <span>Evening: <strong>₹{pricing[selectedSport]?.evening}/hr</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Slot Selector Area + Checkout Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Slot Grid Col(s) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSport === 'All' ? (
            // Desktop Asymmetric / Triple Column Layout for All Sports
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Football', 'Cricket', 'Badminton'].map((sport) => (
                <div key={sport} className="space-y-4">
                  <h3 className="font-playfair text-xl font-bold border-b border-prime-lightBorder dark:border-prime-darkBorder pb-2 text-prime-lightText dark:text-prime-darkText flex items-center justify-between">
                    <span>{sport}</span>
                    <span className="text-[9px] uppercase tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit font-normal">
                      Rates from ₹{pricing[sport]?.morning}/h
                    </span>
                  </h3>
                  <SlotGrid 
                    selectedSport={sport}
                    selectedDate={selectedDate}
                    selectedSlots={selectedSlots}
                    onToggleSlot={(slot) => {
                      // Lock slot picking to single category at a checkout step for logic simplicity
                      setSelectedSport(sport);
                      setSearchParams({ sport });
                      handleToggleSlot(slot);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Standard Single Sport Grid
            <div>
              <h3 className="font-playfair text-2xl font-bold mb-4 text-prime-lightText dark:text-prime-darkText">
                {selectedSport} Schedule
              </h3>
              <SlotGrid 
                selectedSport={selectedSport}
                selectedDate={selectedDate}
                selectedSlots={selectedSlots}
                onToggleSlot={handleToggleSlot}
              />
            </div>
          )}
        </div>

        {/* Sidebar Booking Summary */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <BookingSummary 
            selectedSport={selectedSport === 'All' ? 'Football' : selectedSport} // Summary displays active category
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            onRemoveSlot={handleRemoveSlot}
            onClearSlots={handleClearSlots}
          />
          
          {/* User profile reward badge in sidebar */}
          <div className="mt-4 border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-4 flex items-center gap-3">
            <div className="p-2 border border-prime-lightBorder dark:border-prime-darkBorder rounded-full bg-prime-lightBg dark:bg-prime-darkBg">
              <Award className="w-5 h-5 text-prime-lightAccent dark:text-prime-darkAccent" />
            </div>
            <div className="font-outfit">
              <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest">Your Account Standing</p>
              <h4 className="font-bold text-xs text-prime-lightText dark:text-prime-darkText mt-0.5">
                {userLoyalty.name} Member Tier
              </h4>
              <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-0.5">
                {userLoyalty.discount > 0 ? `Applied ${userLoyalty.discount}% reduction discount to cart!` : 'Qualifies for free equipment rentals at 6 bookings.'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Book;
