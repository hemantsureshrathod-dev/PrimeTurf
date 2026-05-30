import React, { useState } from 'react';
import { Printer, XCircle, ChevronLeft, Calendar, Clock, MapPin, Award, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { Link } from 'react-router-dom';

const ReceiptCard = ({ booking }) => {
  const { requestCancellation } = useApp();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  if (!booking) return null;

  const handleDownload = () => {
    alert("Preparing high-resolution digital ticket layout...\nYour ticket will download momentarily.");
    window.print();
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    setIsSubmittingCancel(true);
    setTimeout(() => {
      requestCancellation(booking.id, cancelReason);
      setIsSubmittingCancel(false);
      setShowCancelModal(false);
      setCancelReason("");
    }, 1000);
  };

  // Status styling details
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 uppercase">
            CONFIRMED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 uppercase">
            CANCELLED
          </span>
        );
      case 'CANCEL_PENDING':
        return (
          <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 uppercase">
            CANCELLATION PENDING APPROVAL
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      {/* Back link */}
      <Link 
        to="/my-bookings" 
        className="inline-flex items-center text-xs uppercase tracking-wider font-semibold text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText mb-6 transition-colors duration-200"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to My Bookings
      </Link>

      {/* Ticket Wrapper */}
      <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-8 font-outfit shadow-sm relative transition-all duration-300">
        
        {/* Top Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-prime-lightAccent dark:text-prime-darkAccent">Prime Turf booking Pass</span>
          <h2 className="font-playfair text-3xl font-bold tracking-tight text-prime-lightText dark:text-prime-darkText mt-1.5">{booking.sport}</h2>
          <div className="mt-3">
            {getStatusBadge()}
          </div>
        </div>

        {/* Dynamic Perforated Divider */}
        <div className="perforated-divider"></div>

        {/* Ticket details (2 Column Key-Value) */}
        <div className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10">
            <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px]">Booking ID</span>
            <span className="font-mono font-semibold text-prime-lightText dark:text-prime-darkText text-right break-all">{booking.id}</span>
          </div>

          <div className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10">
            <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="font-semibold text-prime-lightText dark:text-prime-darkText text-right">{booking.date}</span>
          </div>

          <div className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10">
            <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Time Slot(s)
            </span>
            <div className="text-right">
              {booking.slots.map(slot => (
                <div key={slot} className="font-semibold text-prime-lightText dark:text-prime-darkText">{slot}</div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10">
            <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Player
            </span>
            <span className="font-semibold text-prime-lightText dark:text-prime-darkText text-right">{booking.user}</span>
          </div>

          <div className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10">
            <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Venue
            </span>
            <span className="font-semibold text-prime-lightText dark:text-prime-darkText text-right">Prime Turf Arena, Bangalore</span>
          </div>

          <div className="grid grid-cols-2 py-2 mt-4 bg-prime-lightBg dark:bg-prime-darkBg p-3 border border-prime-lightBorder dark:border-prime-darkBorder">
            <span className="font-bold text-prime-lightText dark:text-prime-darkText uppercase tracking-wider">Amount Paid</span>
            <span className="font-bold text-prime-lightAccent dark:text-prime-darkAccent text-right text-base">₹{booking.amount}</span>
          </div>
        </div>

        {/* Dynamic Cancel Reason Show if pending/canceled */}
        {booking.cancelReason && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 text-xs font-outfit">
            <span className="font-bold text-red-800 dark:text-red-300 uppercase tracking-widest text-[9px] block mb-1">Cancellation Reason</span>
            <p className="text-red-700 dark:text-red-400 italic">"{booking.cancelReason}"</p>
            {booking.status === 'CANCEL_PENDING' && (
              <p className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-3">
                * Cancellation Pending Administrator Approval
              </p>
            )}
          </div>
        )}

        {/* Perforated Divider bottom */}
        <div className="perforated-divider"></div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={handleDownload}
            className="w-full py-3 bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] font-semibold font-outfit text-xs uppercase tracking-widest hover:bg-transparent hover:text-prime-lightText dark:hover:text-prime-darkText border border-transparent hover:border-prime-lightText dark:hover:border-prime-darkText transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Download Receipt
          </button>

          {booking.status === 'CONFIRMED' && (
            <button 
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 border border-red-300 dark:border-red-900/50 hover:border-red-600 dark:hover:border-red-500 text-red-500 hover:text-red-700 dark:text-red-400 font-semibold font-outfit text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel Booking
            </button>
          )}
        </div>

      </div>

      {/* Cancellation Modal Overlay */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder max-w-md w-full p-6 font-outfit relative">
            <h3 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">Cancel Booking</h3>
            <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
              Cancellation requests will be sent to the administrator. Please provide a brief explanation below:
            </p>

            <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
              <textarea 
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (e.g. Schedule conflicts, rain conditions)"
                required
                className="w-full p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText text-xs focus:border-prime-lightAccent dark:focus:border-prime-darkAccent outline-none"
              ></textarea>

              <div className="flex justify-end space-x-3 text-xs uppercase tracking-wider font-semibold">
                <button 
                  type="button" 
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border.5 border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText"
                >
                  Keep Booking
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingCancel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-800 text-white font-medium flex items-center gap-1.5"
                >
                  {isSubmittingCancel ? "Requesting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptCard;
