import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, Sparkles, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { TIME_SLOTS, getSlotTier } from './SlotGrid';

const BookingSummary = ({ selectedSport, selectedDate, selectedSlots, onRemoveSlot, onClearSlots }) => {
  const { pricing, weekendSurcharge, userLoyalty } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isConfirming, setIsConfirming] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('qr'); // 'qr' | 'submitted'

  if (selectedSlots.length === 0) {
    return (
      <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit h-fit">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <h4 className="font-playfair text-sm font-semibold tracking-wide uppercase text-prime-lightText dark:text-prime-darkText">No Slots Selected</h4>
        <p className="text-[11px] mt-1">Select one or more available slots to start booking.</p>
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  const slotsDetails = selectedSlots.map(slot => {
    const tier = getSlotTier(slot);
    const baseRate = pricing[selectedSport]?.[tier] || 0;
    const finalPrice = isWeekend && weekendSurcharge?.enabled
      ? Math.round(baseRate * (1 + weekendSurcharge.rate / 100))
      : baseRate;
    return { slot, price: finalPrice };
  });

  const subtotal = slotsDetails.reduce((sum, i) => sum + i.price, 0);
  const discountAmount = Math.round(subtotal * ((userLoyalty?.discount || 0) / 100));
  const finalTotal = subtotal - discountAmount;

  // Step 1 — show QR modal
  const handlePayment = () => {
    if (!user) { navigate('/login'); return; }
    setPaymentStep('qr');
    setShowPaymentModal(true);
  };

  // Step 2 — user taps "I Have Paid": create booking as pending_payment, show confirmation screen
  const handleIPaid = async () => {
    setIsConfirming(true);
    try {
      const bookingData = {
        user_id: user.id,
        sport: selectedSport,
        date: selectedDate,
        time_slots: selectedSlots,
        total_amount: finalTotal,
        status: 'pending_payment',   // admin will confirm after UPI check
        payment_id: 'upi_manual_' + Date.now(),
      };

      const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `Payment submitted for ${selectedSport} on ${selectedDate} (₹${finalTotal}). Awaiting admin confirmation.`,
      });

      setPaymentStep('submitted');
      setIsConfirming(false);

      // Navigate to receipt after short delay
      setTimeout(() => {
        setShowPaymentModal(false);
        onClearSlots();
        navigate(`/receipt/${data.id}`);
      }, 2200);

    } catch (err) {
      setIsConfirming(false);
      // Show inline error instead of alert
      setPaymentStep('error');
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 font-outfit shadow-sm relative overflow-hidden transition-all duration-300">

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-prime-lightBorder dark:border-prime-darkBorder">
        <h4 className="font-playfair text-base font-bold tracking-wide uppercase text-prime-lightText dark:text-prime-darkText">
          Booking Summary
        </h4>
        <button onClick={onClearSlots} className="text-red-500 hover:text-red-700 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {/* Slot list */}
      <div className="py-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] uppercase tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2">
          {selectedSport} · {selectedDate}
        </div>
        {slotsDetails.map(item => (
          <div key={item.slot} className="flex justify-between items-center text-xs py-1 border-b border-dashed border-prime-lightBorder/50 dark:border-prime-darkBorder/30">
            <span className="text-prime-lightText dark:text-prime-darkText font-medium">{item.slot.split(' - ')[0]}</span>
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-prime-lightText dark:text-prime-darkText">₹{item.price}</span>
              <button onClick={() => onRemoveSlot(item.slot)} className="text-prime-lightTextMuted hover:text-red-500 dark:text-prime-darkTextMuted dark:hover:text-red-400 p-0.5">×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing breakdown */}
      <div className="pt-4 border-t border-prime-lightBorder dark:border-prime-darkBorder space-y-2">
        <div className="flex justify-between text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted">
          <span>Subtotal</span><span>₹{subtotal}</span>
        </div>
        {userLoyalty?.discount > 0 ? (
          <div className="flex justify-between text-xs text-prime-lightAccent dark:text-prime-darkAccent font-medium items-center">
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {userLoyalty.name} -{userLoyalty.discount}%</span>
            <span>-₹{discountAmount}</span>
          </div>
        ) : (
          <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted italic">Book 6 sessions to unlock loyalty discounts.</p>
        )}
        <hr className="my-2 border-prime-lightBorder dark:border-prime-darkBorder" />
        <div className="flex justify-between items-baseline font-bold text-prime-lightText dark:text-prime-darkText">
          <span className="text-sm uppercase tracking-wider">Total</span>
          <span className="text-lg">₹{finalTotal}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handlePayment}
        className="w-full mt-6 py-3.5 bg-prime-lightAccent dark:bg-prime-darkAccent hover:bg-transparent hover:text-prime-lightAccent hover:border-prime-lightAccent dark:hover:text-prime-darkAccent dark:hover:border-prime-darkAccent border border-transparent font-outfit uppercase tracking-widest text-xs font-semibold text-white transition-all duration-300 text-center"
      >
        Confirm & Pay →
      </button>
      <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted text-center mt-3">
        Payment is verified by the turf admin before your slot is confirmed.
      </p>

      {/* ── UPI Payment Modal ─────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1A1D26] p-6 md:p-8 shadow-xl max-w-sm w-full text-center border border-prime-lightBorder dark:border-prime-darkBorder">

            {/* QR Step */}
            {paymentStep === 'qr' && (
              <>
                <h3 className="text-xl font-bold mb-1 font-playfair text-prime-lightText dark:text-prime-darkText">Scan & Pay</h3>
                <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-5">
                  Scan with GPay, PhonePe or Paytm. After paying, tap the button below.
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 rounded border border-gray-200 inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=anitasrathod08@okhdfcbank&pn=Prime%20Turf&am=${finalTotal}&cu=INR`)}`}
                      alt="UPI QR"
                      className="w-44 h-44"
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-prime-lightAccent dark:text-prime-darkAccent mb-2">₹{finalTotal}</div>
                <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-6 uppercase tracking-wider">
                  UPI ID: anitasrathod08@okhdfcbank
                </p>

                {/* Pending notice */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded mb-5 text-left">
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" /> Slot held for 10 mins
                  </p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                    After you tap "I Have Paid", the turf admin will verify your payment and confirm the slot within 15 minutes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleIPaid}
                    disabled={isConfirming}
                    className="w-full py-3 bg-prime-lightAccent dark:bg-prime-darkAccent text-white font-bold tracking-wider uppercase text-xs hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {isConfirming ? 'Submitting...' : `I Have Paid ₹${finalTotal}`}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-2.5 bg-transparent border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText font-semibold tracking-wider uppercase text-xs hover:bg-gray-50 dark:hover:bg-[#2A2D35] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Submitted step */}
            {paymentStep === 'submitted' && (
              <div className="py-4">
                <CheckCircle2 className="w-14 h-14 text-prime-lightAccent dark:text-prime-darkAccent mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText">Payment Submitted!</h3>
                <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-2 max-w-xs mx-auto">
                  Your booking is now <strong>pending admin verification</strong>. You'll receive a confirmation once the payment is approved — usually within 15 minutes.
                </p>
                <p className="text-[10px] uppercase tracking-widest text-prime-lightAccent dark:text-prime-darkAccent font-bold mt-5 animate-pulse">
                  Redirecting to receipt...
                </p>
              </div>
            )}

            {/* Error step */}
            {paymentStep === 'error' && (
              <div className="py-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">Something went wrong</h3>
                <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-2">
                  We couldn't save your booking. Please try again or contact support.
                </p>
                <button onClick={() => setPaymentStep('qr')} className="mt-4 w-full py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder text-xs font-bold uppercase tracking-wider">
                  Try Again
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
