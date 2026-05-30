import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const DEFAULT_PRICING = {
  Football: { morning: 800, afternoon: 1000, evening: 1300 },
  Cricket: { morning: 1000, afternoon: 1200, evening: 1500 },
  Badminton: { morning: 400, afternoon: 500, evening: 600 }
};

const DEFAULT_FEATURES = [
  { id: 'floodlit', name: 'Floodlit Arena', enabled: true },
  { id: 'changing', name: 'Changing Rooms', enabled: true },
  { id: 'parking', name: 'Free Parking', enabled: true },
  { id: 'water', name: 'Drinking Water', enabled: true },
  { id: 'firstaid', name: 'First Aid', enabled: true },
  { id: 'seating', name: 'Spectator Seating', enabled: true }
];

const DEFAULT_EQUIPMENT = [
  '⚽ Footballs',
  '🏏 Cricket Kit',
  'Cones',
  'Bibs',
  'Wickets',
  'Stumps'
];

export const AppProvider = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // User details compatibility wrapper
  const currentUser = profile ? { name: profile.name, email: user?.email || '', phone: profile.phone } : { name: 'Guest Player', email: '' };

  // active user role (mimic role state for admin check fallback)
  const [userRole, setUserRole] = useState(() => {
    return isAdmin ? 'admin' : 'user';
  });

  // Database synced states
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [weekendSurcharge, setWeekendSurcharge] = useState({ enabled: true, rate: 10 });
  const [pricingLastUpdated, setPricingLastUpdated] = useState(new Date().toLocaleString());
  const [turfStatus, setTurfStatus] = useState({ status: 'open', reason: '', reopenDate: '' });
  const [maintenanceBlocks, setMaintenanceBlocks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [broadcastBanner, setBroadcastBanner] = useState({ active: false, text: '' });
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [equipmentList, setEquipmentList] = useState(DEFAULT_EQUIPMENT);
  
  const [galleryPhotos, setGalleryPhotos] = useState([
    { id: '1', url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80", caption: "Football turf under golden lights" },
    { id: '2', url: "https://images.unsplash.com/photo-1531415080290-bc98513ff86b?auto=format&fit=crop&w=600&q=80", caption: "Perfect pitch conditions" },
    { id: '3', url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80", caption: "Badminton courts ready for action" }
  ]);

  const [waitlists, setWaitlists] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Sync userRole to isAdmin
  useEffect(() => {
    setUserRole(isAdmin ? 'admin' : 'user');
  }, [isAdmin]);

  // Apply dark class to body element when theme state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- DATABASE SYNC READS ---

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase.from('pricing').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const pricingObj = { ...DEFAULT_PRICING };
        let surcharge = { enabled: false, rate: 0 };
        
        data.forEach(row => {
          pricingObj[row.sport] = {
            morning: Number(row.morning_rate),
            afternoon: Number(row.afternoon_rate),
            evening: Number(row.evening_rate),
          };
          if (Number(row.weekend_surcharge_pct) > 0) {
            surcharge = { enabled: true, rate: Number(row.weekend_surcharge_pct) };
          }
        });
        
        setPricing(pricingObj);
        setWeekendSurcharge(surcharge);
        if (data[0].updated_at) {
          setPricingLastUpdated(new Date(data[0].updated_at).toLocaleString());
        }
      }
    } catch (err) {
      console.error("fetchPricing error:", err);
    }
  };

  const fetchTurfStatus = async () => {
    try {
      const { data, error } = await supabase.from('turf_status').select('*').limit(1).maybeSingle();
      if (error) throw error;

      if (data) {
        const statusObj = {
          status: data.status,
          reason: data.reason || '',
          reopenDate: data.reopen_date || ''
        };
        setTurfStatus(statusObj);
        
        // Show broadcast banner closed message if turf is closed
        if (data.status === 'closed') {
          setBroadcastBanner({
            active: true,
            text: `🚨 Closed Notice: ${data.reason || "Pitches closed for maintenance."} ${data.reopen_date ? `Expected reopen: ${data.reopen_date}` : ''}`
          });
        } else if (data.reason && data.reason.trim() !== '') {
          // If open, but a reason is filled, treat it as general admin broadcast warning
          setBroadcastBanner({
            active: true,
            text: data.reason
          });
        } else {
          setBroadcastBanner({ active: false, text: '' });
        }
      }
    } catch (err) {
      console.error("fetchTurfStatus error:", err);
    }
  };

  const fetchMaintenanceBlocks = async () => {
    try {
      const { data, error } = await supabase.from('maintenance_blocks').select('*');
      if (error) throw error;

      if (data) {
        setMaintenanceBlocks(data.map(row => ({
          id: row.id,
          date: row.date,
          startHour: String(row.start_hour).padStart(2, '0'),
          endHour: String(row.end_hour).padStart(2, '0'),
          reason: row.reason
        })));
      }
    } catch (err) {
      console.error("fetchMaintenanceBlocks error:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      if (!user) return;
      
      let query = supabase.from('bookings').select('*, profiles(name)');
      
      // If regular user, filter by their profile id
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        setBookings(data.map(row => ({
          id: row.id,
          userId: row.user_id,
          user: row.profiles?.name || 'Player',
          date: row.date,
          sport: row.sport,
          slots: row.time_slots,
          amount: Number(row.total_amount),
          status: row.status.toUpperCase(), // CONFIRMED, CANCEL_PENDING, CANCELLED
          cancelReason: row.cancel_reason,
          createdAt: row.created_at
        })));
      }
    } catch (err) {
      console.error("fetchBookings error:", err);
    }
  };

  const fetchGalleryPhotos = async () => {
    try {
      const { data, error } = await supabase.from('gallery_photos').select('*').order('uploaded_at', { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        setGalleryPhotos(data.map(row => ({
          id: row.id,
          url: row.url,
          caption: row.caption
        })));
      }
    } catch (err) {
      console.error("fetchGalleryPhotos error:", err);
    }
  };

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase.from('features').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        setFeatures(data.map(row => ({
          id: row.id,
          name: row.name,
          enabled: row.enabled
        })));
      }
    } catch (err) {
      console.error("fetchFeatures error:", err);
    }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase.from('equipment').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        setEquipmentList(data.map(row => row.name));
      }
    } catch (err) {
      console.error("fetchEquipment error:", err);
    }
  };

  const fetchWaitlists = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*, profiles(name)');
      if (error) throw error;

      if (data) {
        const waitlistMap = {};
        data.forEach(row => {
          const slotKey = row.slot_key;
          if (!waitlistMap[slotKey]) {
            waitlistMap[slotKey] = [];
          }
          waitlistMap[slotKey].push(row.profiles?.name || 'Player');
        });
        setWaitlists(waitlistMap);
      }
    } catch (err) {
      console.error("fetchWaitlists error:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      let query = supabase.from('notifications').select('*');
      
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        setNotifications(data.map(row => ({
          id: row.id,
          timestamp: new Date(row.created_at).toLocaleString(),
          message: row.message
        })));
      }
    } catch (err) {
      console.error("fetchNotifications error:", err);
    }
  };

  // Run initial reads on mount
  useEffect(() => {
    fetchPricing();
    fetchTurfStatus();
    fetchGalleryPhotos();
    fetchFeatures();
    fetchEquipment();
    fetchMaintenanceBlocks();
  }, []);

  // Run user reads on auth session change
  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchWaitlists();
      fetchNotifications();
    } else {
      setBookings([]);
      setNotifications([]);
      setWaitlists({});
    }
  }, [user, isAdmin, profile]);

  // --- DATABASE WRITE MUTATIONS ---

  const addBooking = async (newBooking) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          sport: newBooking.sport,
          date: newBooking.date,
          time_slots: newBooking.slots,
          total_amount: newBooking.amount,
          status: 'confirmed'
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add audit notification entry
      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `New booking confirmed: ${newBooking.sport} on ${newBooking.date} (₹${newBooking.amount})`
      });

      await fetchBookings();
      await fetchNotifications();
      return data;
    } catch (err) {
      console.error("addBooking database error:", err);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const lowerStatus = newStatus.toLowerCase() === 'cancel_pending' ? 'cancel_pending' : newStatus.toLowerCase();
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: lowerStatus })
        .eq('id', bookingId);
      
      if (error) throw error;

      // Log to notifications for admin auditor
      await supabase.from('notifications').insert({
        user_id: user?.id,
        message: `Booking ${bookingId.slice(0,8)} status updated to ${newStatus}`
      });

      await fetchBookings();
      await fetchNotifications();
    } catch (err) {
      console.error("updateBookingStatus error:", err);
    }
  };

  const requestCancellation = async (bookingId, reason) => {
    try {
      // 1. Insert request row into cancellation_requests
      const { error: reqError } = await supabase
        .from('cancellation_requests')
        .insert({
          booking_id: bookingId,
          reason: reason,
          status: 'pending',
          requested_at: new Date().toISOString()
        });
      if (reqError) throw reqError;

      // 2. Update booking status
      const { error: bookError } = await supabase
        .from('bookings')
        .update({ status: 'cancel_pending', cancel_reason: reason })
        .eq('id', bookingId);
      if (bookError) throw bookError;

      // 3. Log notification
      await supabase.from('notifications').insert({
        user_id: user?.id,
        message: `Cancellation requested for booking: ${bookingId.slice(0,8)}`
      });

      await fetchBookings();
      await fetchNotifications();
    } catch (err) {
      console.error("requestCancellation error:", err);
      throw err;
    }
  };

  const joinWaitlist = async (slotKey, userName) => {
    try {
      if (!user) return;

      // Get count to determine position
      const { data, count, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('slot_key', slotKey);
      if (countError) throw countError;

      const { error } = await supabase
        .from('waitlist')
        .insert({
          user_id: user.id,
          slot_key: slotKey,
          position: (count || 0) + 1
        });
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `You joined waitlist for ${slotKey.split('_').slice(1).join(' ')}`
      });

      await fetchWaitlists();
      await fetchNotifications();
    } catch (err) {
      console.error("joinWaitlist error:", err);
    }
  };

  const updatePricing = async (newPricing, withWeekendSurcharge) => {
    try {
      for (const sport of ['Football', 'Cricket', 'Badminton']) {
        const rateObj = newPricing[sport];
        const { error } = await supabase
          .from('pricing')
          .update({
            morning_rate: rateObj.morning,
            afternoon_rate: rateObj.afternoon,
            evening_rate: rateObj.evening,
            weekend_surcharge_pct: withWeekendSurcharge.enabled ? withWeekendSurcharge.rate : 0
          })
          .eq('sport', sport);
        if (error) throw error;
      }

      await fetchPricing();
      alert("Pricing modified in Supabase.");
    } catch (err) {
      console.error("updatePricing database error:", err);
    }
  };

  const updateTurfStatus = async (statusObj) => {
    try {
      // Find row id or assume a single row exists
      const { data: activeRow } = await supabase.from('turf_status').select('id').limit(1).maybeSingle();
      
      let query;
      if (activeRow) {
        query = supabase.from('turf_status').update({
          status: statusObj.status,
          reason: statusObj.reason,
          reopen_date: statusObj.reopenDate || null
        }).eq('id', activeRow.id);
      } else {
        query = supabase.from('turf_status').insert({
          status: statusObj.status,
          reason: statusObj.reason,
          reopen_date: statusObj.reopenDate || null
        });
      }
      
      const { error } = await query;
      if (error) throw error;

      await fetchTurfStatus();
    } catch (err) {
      console.error("updateTurfStatus database error:", err);
    }
  };

  const addMaintenanceBlock = async (block) => {
    try {
      const { error } = await supabase
        .from('maintenance_blocks')
        .insert({
          date: block.date,
          start_hour: parseInt(block.startHour),
          end_hour: parseInt(block.endHour),
          reason: 'Scheduled Maintenance'
        });
      if (error) throw error;
      await fetchMaintenanceBlocks();
    } catch (err) {
      console.error("addMaintenanceBlock error:", err);
    }
  };

  const removeMaintenanceBlock = async (index) => {
    try {
      const block = maintenanceBlocks[index];
      if (!block || !block.id) return;

      const { error } = await supabase
        .from('maintenance_blocks')
        .delete()
        .eq('id', block.id);
      if (error) throw error;

      await fetchMaintenanceBlocks();
    } catch (err) {
      console.error("removeMaintenanceBlock error:", err);
    }
  };

  // Helper calculations
  const getUserBookingsCount = (name) => {
    return bookings.length;
  };

  const getLoyaltyTier = (count) => {
    if (count >= 16) return { name: 'Gold', discount: 15, color: '#D4AF37' };
    if (count >= 6) return { name: 'Silver', discount: 10, color: '#C0C0C0' };
    return { name: 'Bronze', discount: 0, color: '#CD7F32' };
  };

  const userBookingsCount = bookings.filter(b => b.status !== 'CANCELLED').length;
  const userLoyalty = getLoyaltyTier(userBookingsCount);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      currentUser,
      userRole,
      setUserRole,
      pricing,
      weekendSurcharge,
      pricingLastUpdated,
      updatePricing,
      turfStatus,
      updateTurfStatus,
      maintenanceBlocks,
      addMaintenanceBlock,
      removeMaintenanceBlock,
      bookings,
      addBooking,
      updateBookingStatus,
      requestCancellation,
      broadcastBanner,
      setBroadcastBanner,
      features,
      setFeatures,
      equipmentList,
      setEquipmentList,
      galleryPhotos,
      setGalleryPhotos,
      waitlists,
      joinWaitlist,
      notifications,
      setNotifications,
      userLoyalty,
      userBookingsCount,
      getUserBookingsCount,
      fetchBookings,
      fetchWaitlists,
      fetchNotifications,
      fetchGalleryPhotos
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
