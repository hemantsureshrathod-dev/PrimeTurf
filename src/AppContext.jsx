import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext();

// Only Football and Cricket — one shared court
const DEFAULT_PRICING = {
  Football: { morning: 800, afternoon: 1000, evening: 1300 },
  Cricket: { morning: 1000, afternoon: 1200, evening: 1500 },
};

const DEFAULT_FEATURES = [
  { id: 'floodlit', name: 'Floodlit Arena', enabled: true },
  { id: 'changing', name: 'Changing Rooms', enabled: true },
  { id: 'parking', name: 'Free Parking', enabled: true },
  { id: 'water', name: 'Drinking Water', enabled: true },
  { id: 'firstaid', name: 'First Aid', enabled: true },
  { id: 'seating', name: 'Spectator Seating', enabled: true },
];

const DEFAULT_EQUIPMENT = ['⚽ Footballs', '🏏 Cricket Kit', 'Cones', 'Bibs', 'Wickets', 'Stumps'];

// Both sports share one physical court — treat any booking as blocking the court
const COURT_SPORTS = ['Football', 'Cricket'];

export const AppProvider = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();

  // ─── Theme ────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // ─── Current user wrapper ──────────────────────────────────────
  const currentUser = profile
    ? { name: profile.name, email: user?.email || '', phone: profile.phone }
    : { name: 'Guest Player', email: '' };

  // ─── DB-synced state ───────────────────────────────────────────
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
    { id: '1', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', caption: 'Football turf under golden lights' },
    { id: '2', url: 'https://images.unsplash.com/photo-1531415080290-bc98513ff86b?auto=format&fit=crop&w=600&q=80', caption: 'Perfect pitch conditions' },
  ]);
  const [waitlists, setWaitlists] = useState({});
  const [notifications, setNotifications] = useState([]);

  // ─── Fetch helpers ─────────────────────────────────────────────

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase.from('pricing').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const pricingObj = { ...DEFAULT_PRICING };
        let surcharge = { enabled: false, rate: 0 };
        data.forEach(row => {
          // Skip Badminton rows that may exist in DB
          if (!COURT_SPORTS.includes(row.sport)) return;
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
        if (data[0].updated_at) setPricingLastUpdated(new Date(data[0].updated_at).toLocaleString());
      }
    } catch (err) { console.error('fetchPricing error:', err); }
  };

  const fetchTurfStatus = async () => {
    try {
      const { data, error } = await supabase.from('turf_status').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        setTurfStatus({ status: data.status, reason: data.reason || '', reopenDate: data.reopen_date || '' });
        if (data.status === 'closed') {
          setBroadcastBanner({ active: true, text: `🚨 Closed: ${data.reason || 'Maintenance'} ${data.reopen_date ? `· Reopens ${data.reopen_date}` : ''}` });
        } else if (data.reason?.trim()) {
          setBroadcastBanner({ active: true, text: data.reason });
        } else {
          setBroadcastBanner({ active: false, text: '' });
        }
      }
    } catch (err) { console.error('fetchTurfStatus error:', err); }
  };

  const fetchMaintenanceBlocks = async () => {
    try {
      const { data, error } = await supabase.from('maintenance_blocks').select('*');
      if (error) throw error;
      if (data) {
        setMaintenanceBlocks(data.map(row => ({
          id: row.id, date: row.date,
          startHour: String(row.start_hour).padStart(2, '0'),
          endHour: String(row.end_hour).padStart(2, '0'),
          reason: row.reason,
        })));
      }
    } catch (err) { console.error('fetchMaintenanceBlocks error:', err); }
  };

  // Fetches ALL bookings (for slot-blocking across users) but also includes user info
  const fetchBookings = async () => {
    try {
      // Always fetch all bookings so slot grid stays consistent for everyone
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
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
          status: row.status.toUpperCase(),
          cancelReason: row.cancel_reason,
          createdAt: row.created_at,
        })));
      }
    } catch (err) { console.error('fetchBookings error:', err); }
  };

  const fetchGalleryPhotos = async () => {
    try {
      const { data, error } = await supabase.from('gallery_photos').select('*').order('uploaded_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setGalleryPhotos(data.map(row => ({ id: row.id, url: row.url, caption: row.caption })));
      }
    } catch (err) { console.error('fetchGalleryPhotos error:', err); }
  };

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase.from('features').select('*');
      if (error) throw error;
      if (data && data.length > 0) setFeatures(data.map(row => ({ id: row.id, name: row.name, enabled: row.enabled })));
    } catch (err) { console.error('fetchFeatures error:', err); }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase.from('equipment').select('*');
      if (error) throw error;
      if (data && data.length > 0) setEquipmentList(data.map(row => row.name));
    } catch (err) { console.error('fetchEquipment error:', err); }
  };

  const fetchWaitlists = async () => {
    try {
      const { data, error } = await supabase.from('waitlist').select('*, profiles(name)');
      if (error) throw error;
      if (data) {
        const map = {};
        data.forEach(row => {
          if (!map[row.slot_key]) map[row.slot_key] = [];
          map[row.slot_key].push(row.profiles?.name || 'Player');
        });
        setWaitlists(map);
      }
    } catch (err) { console.error('fetchWaitlists error:', err); }
  };

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      if (data) setNotifications(data);
    } catch (err) { console.error('fetchNotifications error:', err); }
  };

  // ─── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    fetchPricing();
    fetchTurfStatus();
    fetchMaintenanceBlocks();
    fetchBookings();   // always fetch all — needed for shared court logic
    fetchGalleryPhotos();
    fetchFeatures();
    fetchEquipment();
    fetchWaitlists();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // ─── Real-time subscription — keeps bookings live for ALL users ──
  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Write operations ──────────────────────────────────────────

  const addBooking = async (newBooking) => {
    try {
      const bookingData = {
        user_id: newBooking.userId || user.id,
        sport: newBooking.sport,
        date: newBooking.date,
        time_slots: newBooking.slots,
        total_amount: newBooking.amount,
        status: 'pending_payment',  // starts as pending — admin confirms after UPI check
      };
      const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `Booking submitted (pending payment): ${newBooking.sport} on ${newBooking.date} (₹${newBooking.amount})`,
      });
      await fetchBookings();
      await fetchNotifications();
      return data;
    } catch (err) {
      console.error('addBooking error:', err);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus.toLowerCase() })
        .eq('id', bookingId);
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: user?.id,
        message: `Booking ${bookingId.slice(0, 8)} updated to ${newStatus}`,
      });
      await fetchBookings();
      await fetchNotifications();
    } catch (err) { console.error('updateBookingStatus error:', err); }
  };

  const requestCancellation = async (bookingId, reason) => {
    try {
      await supabase.from('cancellation_requests').insert({
        booking_id: bookingId, reason, status: 'pending', requested_at: new Date().toISOString(),
      });
      await supabase.from('bookings').update({ status: 'cancel_pending', cancel_reason: reason }).eq('id', bookingId);
      await supabase.from('notifications').insert({ user_id: user?.id, message: `Cancellation requested for ${bookingId.slice(0, 8)}` });
      await fetchBookings();
      await fetchNotifications();
    } catch (err) { console.error('requestCancellation error:', err); throw err; }
  };

  const joinWaitlist = async (slotKey, userName) => {
    try {
      if (!user) return;
      const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('slot_key', slotKey);
      await supabase.from('waitlist').insert({ user_id: user.id, slot_key: slotKey, position: (count || 0) + 1 });
      await supabase.from('notifications').insert({ user_id: user.id, message: `Joined waitlist for slot ${slotKey}` });
      await fetchWaitlists();
    } catch (err) { console.error('joinWaitlist error:', err); }
  };

  const updatePricing = async (newPricing, withWeekendSurcharge) => {
    try {
      for (const sport of COURT_SPORTS) {
        const r = newPricing[sport];
        await supabase.from('pricing').update({
          morning_rate: r.morning, afternoon_rate: r.afternoon, evening_rate: r.evening,
          weekend_surcharge_pct: withWeekendSurcharge.enabled ? withWeekendSurcharge.rate : 0,
        }).eq('sport', sport);
      }
      await fetchPricing();
    } catch (err) { console.error('updatePricing error:', err); }
  };

  const updateTurfStatus = async (statusObj) => {
    try {
      const { data: row } = await supabase.from('turf_status').select('id').limit(1).maybeSingle();
      const payload = { status: statusObj.status, reason: statusObj.reason, reopen_date: statusObj.reopenDate || null };
      if (row) {
        await supabase.from('turf_status').update(payload).eq('id', row.id);
      } else {
        await supabase.from('turf_status').insert(payload);
      }
      await fetchTurfStatus();
    } catch (err) { console.error('updateTurfStatus error:', err); }
  };

  const addMaintenanceBlock = async (block) => {
    try {
      await supabase.from('maintenance_blocks').insert({ date: block.date, start_hour: parseInt(block.startHour), end_hour: parseInt(block.endHour), reason: 'Scheduled Maintenance' });
      await fetchMaintenanceBlocks();
    } catch (err) { console.error('addMaintenanceBlock error:', err); }
  };

  const removeMaintenanceBlock = async (index) => {
    try {
      const block = maintenanceBlocks[index];
      if (!block?.id) return;
      await supabase.from('maintenance_blocks').delete().eq('id', block.id);
      await fetchMaintenanceBlocks();
    } catch (err) { console.error('removeMaintenanceBlock error:', err); }
  };

  // ─── Loyalty tier ──────────────────────────────────────────────
  const getLoyaltyTier = (count) => {
    if (count >= 16) return { name: 'Gold', discount: 15, color: '#D4AF37' };
    if (count >= 6) return { name: 'Silver', discount: 10, color: '#C0C0C0' };
    return { name: 'Bronze', discount: 0, color: '#CD7F32' };
  };

  // Count only THIS user's confirmed/pending bookings for loyalty
  const userBookingsCount = bookings.filter(
    b => b.userId === user?.id && b.status !== 'CANCELLED'
  ).length;

  const userLoyalty = getLoyaltyTier(userBookingsCount);

  // Fixed: filter by userId properly
  const getUserBookingsCount = (userId) => bookings.filter(b => b.userId === userId && b.status !== 'CANCELLED').length;

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      currentUser,
      pricing, weekendSurcharge, pricingLastUpdated, updatePricing,
      turfStatus, updateTurfStatus,
      maintenanceBlocks, addMaintenanceBlock, removeMaintenanceBlock,
      bookings, addBooking, updateBookingStatus, requestCancellation,
      broadcastBanner, setBroadcastBanner,
      features, setFeatures,
      equipmentList, setEquipmentList,
      galleryPhotos, setGalleryPhotos,
      waitlists, joinWaitlist,
      notifications, setNotifications,
      userLoyalty, userBookingsCount, getUserBookingsCount,
      fetchBookings, fetchWaitlists, fetchNotifications, fetchGalleryPhotos,
      COURT_SPORTS,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
