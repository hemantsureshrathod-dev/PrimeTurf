import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { supabase } from '../supabaseClient';
import ReceiptCard from '../components/ReceiptCard';
import { AlertTriangle, Home } from 'lucide-react';

const Receipt = () => {
  const { id } = useParams();
  const { bookings } = useApp();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetBooking = async () => {
      // 1. Try to find the booking in context first
      const found = bookings.find(b => b.id === id);
      if (found) {
        setBooking(found);
        setLoading(false);
      } else {
        // 2. Fetch directly from Supabase as a fallback (prevents reload errors)
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*, profiles(name)')
            .eq('id', id)
            .maybeSingle();

          if (error) throw error;
          
          if (data) {
            setBooking({
              id: data.id,
              userId: data.user_id,
              user: data.profiles?.name || 'Player',
              date: data.date,
              sport: data.sport,
              slots: data.time_slots,
              amount: Number(data.total_amount),
              status: data.status.toUpperCase(),
              cancelReason: data.cancel_reason,
              createdAt: data.created_at
            });
          }
        } catch (err) {
          console.error("Error fetching single receipt:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTargetBooking();
  }, [id, bookings]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-prime-lightBg dark:bg-prime-darkBg">
        <p className="text-xs font-outfit uppercase tracking-widest text-prime-lightTextMuted animate-pulse font-bold">
          Loading Ticket Pass...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-prime-lightBg dark:bg-prime-darkBg transition-colors duration-300">
      {booking ? (
        <div className="w-full">
          <ReceiptCard booking={booking} />
        </div>
      ) : (
        <div className="max-w-md w-full border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-8 text-center font-outfit shadow-sm animate-fade-in">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText">Receipt Not Found</h3>
          <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-2">
            The booking ID <strong className="font-mono">{id}</strong> could not be located in our system logs. It may have expired or been removed.
          </p>
          <div className="mt-8 flex justify-center gap-4 text-xs uppercase tracking-widest font-bold">
            <Link 
              to="/my-bookings" 
              className="px-4 py-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText"
            >
              My Bookings
            </Link>
            <Link 
              to="/" 
              className="px-4 py-2 bg-prime-lightAccent dark:bg-prime-darkAccent text-white flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Back Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipt;
