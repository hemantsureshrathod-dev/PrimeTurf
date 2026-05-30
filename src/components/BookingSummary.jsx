import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, Sparkles, Receipt } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { TIME_SLOTS, getSlotTier } from './SlotGrid';

const BookingSummary = ({
  selectedSport,
  selectedDate,
  selectedSlots,
  onRemoveSlot,
  onClearSlots
}) => {
  const {
    pricing,
    weekendSurcharge,
    userLoyalty,
    addBooking
  } = useApp();

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // <--- ADD THIS LINE 


  if (selectedSlots.length === 0) {
    return (
      <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit h-fit">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <h4 className="font-playfair text-sm font-semibold tracking-wide uppercase text-prime-lightText dark:text-prime-darkText">No Slots Selected</h4>
        <p className="text-[11px] mt-1">Select one or more available slots on the schedule grid to start booking.</p>
      </div>
    );
  }

  // 1. Calculate weekend status
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 2. Compute individual slot prices and details
  const slotsDetails = selectedSlots.map(slot => {
    const tier = getSlotTier(slot);
    const baseRate = pricing[selectedSport]?.[tier] || 0;
    const finalPrice = isWeekend && weekendSurcharge?.enabled
      ? Math.round(baseRate * (1 + weekendSurcharge.rate / 100))
      : baseRate;
    return { slot, price: finalPrice };
  });

  // 3. Totals
  const subtotal = slotsDetails.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = Math.round(subtotal * ((userLoyalty?.discount || 0) / 100));
  const finalTotal = subtotal - discountAmount;

  // 1. This opens the UPI QR Code Modal
  const handlePayment = () => {
    if (selectedSlots.length === 0) return;
    setShowPaymentModal(true);
  };

  // 2. This runs AFTER they scan and click "I Have Paid"
  const processBooking = async () => {
    setShowPaymentModal(false);
    setIsConfirming(true);

    try {
      const bookingData = {
        user_id: user.id,
        sport: selectedSport,
        date: selectedDate,
        time_slots: selectedSlots,
        total_amount: finalTotal,
        status: 'confirmed',
        payment_id: 'upi_manual_' + Date.now() // Generating a manual ID
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Clear slots and navigate to receipt
      setTimeout(() => {
        setIsConfirming(false);
        onClearSlots();
        navigate(`/receipt/${data.id}`);
      }, 1200);

    } catch (err) {
      setIsConfirming(false);
      alert('Booking save failed: ' + err.message);
    }
  };

  return (
    <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 font-outfit shadow-sm relative overflow-hidden transition-all duration-300">

      {/* Checkout Printing Animation Overlay */}
      {isConfirming && (
        <div className="absolute inset-0 bg-white/95 dark:bg-[#1A1D26]/95 z-50 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <Receipt className="w-10 h-10 text-prime-lightAccent dark:text-prime-darkAccent animate-bounce mb-3" />
          <h4 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">Printing Receipt...</h4>
          <p className="text-[11px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1 max-w-[200px] mx-auto">
            Securing your slot lock and issuing transaction credentials.
          </p>
          <div className="w-32 bg-prime-lightBorder dark:bg-prime-darkBorder h-1 mt-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 bg-prime-lightAccent dark:bg-prime-darkAccent w-1/2 animate-shimmer"></div>
          </div>
        </div>
      )}

      {/* Booking Summary Content */}
      <div className="flex justify-between items-center pb-4 border-b border-prime-lightBorder dark:border-prime-darkBorder">
        <h4 className="font-playfair text-base font-bold tracking-wide uppercase text-prime-lightText dark:text-prime-darkText">
          Booking Summary
        </h4>
        <button
          onClick={onClearSlots}
          className="text-red-500 hover:text-red-700 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      <div className="py-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] uppercase tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2">
          {selectedSport} · {selectedDate}
        </div>

        {slotsDetails.map(item => (
          <div key={item.slot} className="flex justify-between items-center text-xs py-1 border-b border-dashed border-prime-lightBorder/50 dark:border-prime-darkBorder/30">
            <span className="text-prime-lightText dark:text-prime-darkText font-medium">
              {item.slot.split(' - ')[0]}
            </span>
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-prime-lightText dark:text-prime-darkText">₹{item.price}</span>
              <button
                onClick={() => onRemoveSlot(item.slot)}
                className="text-prime-lightTextMuted hover:text-red-500 dark:text-prime-darkTextMuted dark:hover:text-red-400 p-0.5"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="pt-4 border-t border-prime-lightBorder dark:border-prime-darkBorder space-y-2">
        <div className="flex justify-between text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {userLoyalty?.discount > 0 ? (
          <div className="flex justify-between text-xs text-prime-lightAccent dark:text-prime-darkAccent font-medium items-center">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Loyalty Discount ({userLoyalty.name} -{userLoyalty.discount}%)
            </span>
            <span>-₹{discountAmount}</span>
          </div>
        ) : (
          <div className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted italic mt-1 py-1">
            Book more sessions to unlock loyalty tier discounts.
          </div>
        )}

        <hr className="my-2 border-prime-lightBorder dark:border-prime-darkBorder" />

        <div className="flex justify-between items-baseline font-bold text-prime-lightText dark:text-prime-darkText">
          <span className="text-sm uppercase tracking-wider">Total</span>
          <span className="text-lg">₹{finalTotal}</span>
        </div>
      </div>

      {/* Pay Action Button */}
      <button
        onClick={handlePayment}
        className="w-full mt-6 py-3.5 bg-prime-lightAccent dark:bg-prime-darkAccent hover:bg-transparent hover:text-prime-lightAccent hover:border-prime-lightAccent dark:hover:text-prime-darkAccent dark:hover:border-prime-darkAccent border border-transparent font-outfit uppercase tracking-widest text-xs font-semibold text-white transition-all duration-300 text-center"
      >
        Confirm & Pay Slot →
      </button>

      <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted text-center mt-3">
        By clicking confirm, you agree to our 24h refund cancellation policies.
      </p>


      {/* UPI Payment Modal - Paste just before the final </div> */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1D26] p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-prime-lightBorder dark:border-prime-darkBorder">
            <h3 className="text-2xl font-bold mb-2 font-playfair text-prime-lightText dark:text-prime-darkText">Complete Payment</h3>
            <p className="text-sm text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-6">
              Scan this QR with GPay, PhonePe, or Paytm.
            </p>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                {/* Dynamically uses finalTotal! Replace 'yourupi@upi' with your real UPI ID */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=anitasrathod08@okhdfcbank&pn=Prime%20Turf&am=${finalTotal}&cu=INR`)}`}
                  alt="UPI QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="text-3xl font-bold text-prime-lightAccent dark:text-prime-darkAccent mb-6">
              ₹{finalTotal}
            </div>

            <div className="space-y-3">
              <button
                onClick={processBooking}
                className="w-full py-3 bg-prime-lightAccent dark:bg-prime-darkAccent text-white dark:text-prime-darkText font-bold tracking-wider uppercase text-sm rounded hover:opacity-90 transition-opacity"
              >
                I Have Paid ₹{finalTotal}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 bg-transparent border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText font-bold tracking-wider uppercase text-sm rounded hover:bg-gray-50 dark:hover:bg-[#2A2D35] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default BookingSummary;