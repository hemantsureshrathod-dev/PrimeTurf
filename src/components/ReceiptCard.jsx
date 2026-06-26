import React, { useState } from 'react';
import { Printer, XCircle, ChevronLeft, Calendar, Clock, MapPin, Award, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { Link } from 'react-router-dom';

const ReceiptCard = ({ booking }) => {
  const { requestCancellation } = useApp();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  if (!booking) return null;

  const handleDownload = () => window.print();

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsSubmittingCancel(true);
    try {
      await requestCancellation(booking.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 uppercase">Confirmed</span>;
      case 'PENDING_PAYMENT':
        return (
          <div className="text-center">
            <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 uppercase block">Payment Submitted — Pending Verification</span>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">The admin will confirm your slot after verifying the UPI payment. This usually takes under 15 minutes.</p>
          </div>
        );
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 uppercase">Cancelled</span>;
      case 'CANCEL_PENDING':
        return <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30 uppercase">Cancellation Pending Approval</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] tracking-wider font-semibold bg-gray-50 text-gray-600 border border-gray-200 uppercase">{booking.status}</span>;
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <Link to="/my-bookings" className="inline-flex items-center text-xs uppercase tracking-wider font-semibold text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText mb-5 transition-colors duration-200">
        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to My Bookings
      </Link>

      <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-6 md:p-8 font-outfit shadow-sm relative transition-all duration-300">

        {/* Top */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-prime-lightAccent dark:text-prime-darkAccent">Tanush Sports Club Pass</span>
          <h2 className="font-playfair text-3xl font-bold tracking-tight text-prime-lightText dark:text-prime-darkText mt-1.5">{booking.sport}</h2>
          <div className="mt-3">{getStatusBadge()}</div>
        </div>

        <div className="perforated-divider" />

        <div className="space-y-4 text-xs">
          {[
            { label: 'Booking ID', value: <span className="font-mono text-right break-all">{booking.id}</span> },
            { label: 'Date', icon: <Calendar className="w-3.5 h-3.5" />, value: booking.date },
            { label: 'Time Slot(s)', icon: <Clock className="w-3.5 h-3.5" />, value: <div className="text-right">{booking.slots?.map(s => <div key={s} className="font-semibold">{s}</div>)}</div> },
            { label: 'Player', icon: <Award className="w-3.5 h-3.5" />, value: booking.user },
            { label: 'Venue', icon: <MapPin className="w-3.5 h-3.5" />, value: 'Tanush Sports Club, Sawantwadi' },
          ].map(({ label, icon, value }) => (
            <div key={label} className="grid grid-cols-2 py-1 border-b border-prime-lightBorder/30 dark:border-prime-darkBorder/10 items-start">
              <span className="text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] flex items-center gap-1">{icon}{label}</span>
              <span className="font-semibold text-prime-lightText dark:text-prime-darkText text-right">{value}</span>
            </div>
          ))}

          <div className="grid grid-cols-2 py-2 mt-3 bg-prime-lightBg dark:bg-prime-darkBg p-3 border border-prime-lightBorder dark:border-prime-darkBorder">
            <span className="font-bold text-prime-lightText dark:text-prime-darkText uppercase tracking-wider">Amount Paid</span>
            <span className="font-bold text-prime-lightAccent dark:text-prime-darkAccent text-right text-base">₹{booking.amount}</span>
          </div>
        </div>

        {booking.cancelReason && (
          <div className="mt-5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 text-xs font-outfit">
            <span className="font-bold text-red-800 dark:text-red-300 uppercase tracking-widest text-[9px] block mb-1">Cancellation Reason</span>
            <p className="text-red-700 dark:text-red-400 italic">"{booking.cancelReason}"</p>
          </div>
        )}

        <div className="perforated-divider" />

        <div className="flex flex-col gap-2.5">
          <button onClick={handleDownload} className="w-full py-3 bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] font-semibold font-outfit text-xs uppercase tracking-widest hover:bg-transparent hover:text-prime-lightText dark:hover:text-prime-darkText border border-transparent hover:border-prime-lightText dark:hover:border-prime-darkText transition-all duration-300 flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Download Receipt
          </button>
          {booking.status === 'CONFIRMED' && (
            <button onClick={() => setShowCancelModal(true)} className="w-full py-3 border border-red-300 dark:border-red-900/50 hover:border-red-600 text-red-500 hover:text-red-700 dark:text-red-400 font-semibold font-outfit text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder max-w-md w-full p-6 font-outfit rounded-t-2xl md:rounded-none">
            <h3 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">Cancel Booking</h3>
            <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">Your request will be sent to the admin for approval.</p>
            <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason (e.g. Schedule conflict, rain conditions)"
                required
                className="w-full p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText text-xs focus:border-prime-lightAccent dark:focus:border-prime-darkAccent outline-none"
              />
              <div className="flex justify-end gap-3 text-xs uppercase tracking-wider font-semibold">
                <button type="button" onClick={() => setShowCancelModal(false)} className="px-4 py-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText">
                  Keep Booking
                </button>
                <button type="submit" disabled={isSubmittingCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-1.5 disabled:opacity-60">
                  {isSubmittingCancel ? 'Submitting...' : 'Submit Request'}
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
