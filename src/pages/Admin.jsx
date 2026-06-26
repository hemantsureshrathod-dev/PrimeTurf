import React, { useState, useEffect } from 'react';
import {
  BarChart3, Settings, Shield, Plus, Trash2, FileText, CheckCircle2, XCircle,
  Tv, Eye, Play, Megaphone, Calendar, HelpCircle, ToggleLeft, ToggleRight, Sparkles, ShieldAlert, Upload, Loader
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { TIME_SLOTS } from '../components/SlotGrid';

const Admin = () => {
  const {
    bookings,
    pricing,
    weekendSurcharge,
    pricingLastUpdated,
    updatePricing,
    turfStatus,
    updateTurfStatus,
    maintenanceBlocks,
    addMaintenanceBlock,
    removeMaintenanceBlock,
    notifications,
    broadcastBanner,
    features,
    setFeatures,
    equipmentList,
    setEquipmentList,
    galleryPhotos,
    fetchGalleryPhotos,
    fetchBookings,
    fetchNotifications,
    fetchWaitlists,
    fetchBookings: contextFetchBookings
  } = useApp();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Stats calculation
  const todayStr = "2026-05-28";

  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'CANCELLED');
  const revenueToday = todayBookings.reduce((sum, b) => sum + b.amount, 0);
  const pendingCancellations = bookings.filter(b => b.status === 'CANCEL_PENDING').length;
  const isTurfOpen = turfStatus.status === 'open';

  // 1. Dashboard State and Tab handlers
  const handleApproveCancel = async (bookingId) => {
    try {
      // Update cancellation_requests row status to 'approved'
      const { error: cancelError } = await supabase
        .from('cancellation_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('booking_id', bookingId);
      if (cancelError) throw cancelError;

      // Update bookings status to 'cancelled'
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (bookingError) throw bookingError;

      // Log notification
      await supabase.from('notifications').insert({
        user_id: user?.id,
        message: `Cancellation approved for booking: ${bookingId.slice(0, 8)}`
      });

      alert("Cancellation approved.");
      await contextFetchBookings();
      await fetchNotifications();
    } catch (err) {
      console.error("Error approving cancellation:", err);
      alert("Action failed: " + err.message);
    }
  };

  const handleRejectCancel = async (bookingId) => {
    try {
      // Update cancellation_requests row status to 'rejected'
      const { error: cancelError } = await supabase
        .from('cancellation_requests')
        .update({ status: 'rejected', approved_at: new Date().toISOString(), admin_notes: 'Rejected by administrator' })
        .eq('booking_id', bookingId);
      if (cancelError) throw cancelError;

      // Reset bookings status back to 'confirmed'
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      if (bookingError) throw bookingError;

      // Log notification
      await supabase.from('notifications').insert({
        user_id: user?.id,
        message: `Cancellation request rejected for booking: ${bookingId.slice(0, 8)}`
      });

      alert("Cancellation request rejected.");
      await contextFetchBookings();
      await fetchNotifications();
    } catch (err) {
      console.error("Error rejecting cancellation:", err);
      alert("Action failed: " + err.message);
    }
  };

  // 2. Pricing Manager Form States
  const [formPricing, setFormPricing] = useState({ ...pricing });
  const [formSurcharge, setFormSurcharge] = useState({ ...weekendSurcharge });

  useEffect(() => {
    setFormPricing({ ...pricing });
    setFormSurcharge({ ...weekendSurcharge });
  }, [pricing, weekendSurcharge]);

  const handlePricingChange = (sport, tier, val) => {
    setFormPricing(prev => ({
      ...prev,
      [sport]: {
        ...prev[sport],
        [tier]: parseInt(val) || 0
      }
    }));
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    await updatePricing(formPricing, formSurcharge);
    alert("Pricing configurations updated in Supabase.");
  };

  // 3. Bookings Manager Filters
  const [filterSport, setFilterSport] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  const filteredBookings = bookings.filter(b => {
    const matchesSport = filterSport === 'All' || b.sport === filterSport;
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesDate = !filterDate || b.date === filterDate;
    return matchesSport && matchesStatus && matchesDate;
  });

  // 4. Content Manager States
  const [newEquip, setNewEquip] = useState("");
  const [formAboutText, setFormAboutText] = useState("Tanush Sports Club is the city's premier sports club venue. Built in 2024, our pitches offer tournament-grade playing surfaces for soccer, cricket, and badminton enthusiasts alike.");

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!newEquip.trim()) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .insert({ name: newEquip.trim() });
      if (error) throw error;

      setEquipmentList(prev => [...prev, newEquip.trim()]);
      setNewEquip("");
      alert("Equipment added to database.");
    } catch (err) {
      console.error(err);
      alert("Failed to add equipment.");
    }
  };

  const handleRemoveEquipment = async (name) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('name', name);
      if (error) throw error;

      setEquipmentList(prev => prev.filter(item => item !== name));
      alert("Equipment removed from database.");
    } catch (err) {
      console.error(err);
      alert("Failed to remove equipment.");
    }
  };

  const handleFeatureToggle = async (id, currentEnabled) => {
    try {
      const { error } = await supabase
        .from('features')
        .update({ enabled: !currentEnabled })
        .eq('id', id);
      if (error) throw error;

      setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !currentEnabled } : f));
    } catch (err) {
      console.error(err);
      alert("Failed to update feature.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;

      // Upload file to Supabase Storage bucket 'gallery'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Retrieve public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      // Insert record in gallery_photos table
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          url: urlData.publicUrl,
          caption: file.name.split('.')[0] || 'Turf Pitch View'
        });

      if (dbError) throw dbError;

      alert("Photo uploaded successfully to Supabase Storage!");
      await fetchGalleryPhotos();
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo from the gallery?")) return;
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', id);
      if (error) throw error;

      alert("Photo deleted.");
      await fetchGalleryPhotos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo.");
    }
  };

  // 5. Turf Status Panel States
  const [closureReason, setClosureReason] = useState("");
  const [reopenDate, setReopenDate] = useState("");
  const [maintDate, setMaintDate] = useState(todayStr);
  const [maintStart, setMaintStart] = useState("08");
  const [maintEnd, setMaintEnd] = useState("12");

  const handleToggleTurfStatus = async () => {
    if (isTurfOpen) {
      await updateTurfStatus({ status: 'closed', reason: closureReason, reopenDate });
    } else {
      await updateTurfStatus({ status: 'open', reason: '', reopenDate: '' });
      setClosureReason("");
      setReopenDate("");
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    const startNum = parseInt(maintStart);
    const endNum = parseInt(maintEnd);
    if (startNum >= endNum) {
      alert("Start hour must be before end hour!");
      return;
    }
    await addMaintenanceBlock({
      date: maintDate,
      startHour: maintStart,
      endHour: maintEnd
    });
    alert(`Maintenance block added for ${maintDate} from ${maintStart}:00 to ${maintEnd}:00!`);
  };

  const handleRemoveMaintenance = async (idx) => {
    await removeMaintenanceBlock(idx);
    alert("Maintenance block removed.");
  };

  // 6. Broadcast Banner states
  const [bannerText, setBannerText] = useState(broadcastBanner.text);

  useEffect(() => {
    setBannerText(broadcastBanner.text);
  }, [broadcastBanner]);

  const handleBannerGoLive = async (e) => {
    e.preventDefault();
    if (!bannerText.trim()) return;

    try {
      const { data: activeRow } = await supabase.from('turf_status').select('id').limit(1).maybeSingle();

      let query;
      if (activeRow) {
        query = supabase.from('turf_status').update({
          reason: bannerText.trim()
        }).eq('id', activeRow.id);
      } else {
        query = supabase.from('turf_status').insert({
          status: 'open',
          reason: bannerText.trim()
        });
      }

      const { error } = await query;
      if (error) throw error;

      alert("Announcement banner pushed live globally!");
      // Force reload turf_status
      const { data: refreshedStatus } = await supabase.from('turf_status').select('*').limit(1).maybeSingle();
      if (refreshedStatus) {
        updateTurfStatus({ status: refreshedStatus.status, reason: refreshedStatus.reason, reopenDate: refreshedStatus.reopen_date || '' });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to push banner.");
    }
  };

  const handleRemoveBanner = async () => {
    try {
      const { data: activeRow } = await supabase.from('turf_status').select('id').limit(1).maybeSingle();
      if (activeRow) {
        const { error } = await supabase
          .from('turf_status')
          .update({ reason: '' })
          .eq('id', activeRow.id);
        if (error) throw error;
      }
      alert("Broadcast banner removed.");
      // Force reload turf_status
      const { data: refreshedStatus } = await supabase.from('turf_status').select('*').limit(1).maybeSingle();
      if (refreshedStatus) {
        updateTurfStatus({ status: refreshedStatus.status, reason: '', reopenDate: refreshedStatus.reopen_date || '' });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove banner.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-outfit">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-prime-lightBorder dark:border-prime-darkBorder pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] tracking-widest font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400">
              Admin Access
            </span>
          </div>
          <h1 className="font-playfair text-4xl font-bold text-prime-lightText dark:text-prime-darkText mt-1.5">
            Management Panel
          </h1>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 text-xs uppercase font-bold tracking-widest">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 border transition-all duration-200 cursor-pointer ${activeTab === 'dashboard' ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117]' : 'bg-transparent border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 border transition-all duration-200 cursor-pointer ${activeTab === 'bookings' ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117]' : 'bg-transparent border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 border transition-all duration-200 cursor-pointer ${activeTab === 'pricing' ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117]' : 'bg-transparent border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted'}`}
          >
            Pricing & Status
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 border transition-all duration-200 cursor-pointer ${activeTab === 'content' ? 'bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117]' : 'bg-transparent border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted'}`}
          >
            Content & Banner
          </button>
        </div>
      </div>

      {/* ACTIVE TAB CONTENT */}

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Left: Stats + Today Bookings list */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Today's Bookings</span>
                <h3 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-1.5">
                  {todayBookings.length}
                </h3>
              </div>

              <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Revenue Today</span>
                <h3 className="font-playfair text-3xl font-bold text-prime-lightAccent dark:text-prime-darkAccent mt-1.5">
                  ₹{revenueToday}
                </h3>
              </div>

              <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Pending Cancels</span>
                <h3 className={`font-playfair text-3xl font-bold mt-1.5 ${pendingCancellations > 0 ? 'text-amber-500' : 'text-prime-lightText'}`}>
                  {pendingCancellations}
                </h3>
              </div>

              <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">Turf Status</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isTurfOpen ? 'bg-prime-lightAccent' : 'bg-red-500'}`}></span>
                  <span className="font-bold text-xs uppercase tracking-wider text-prime-lightText dark:text-prime-darkText">
                    {turfStatus.status}
                  </span>
                </div>
              </div>

            </div>

            {/* Today's Bookings list table */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">TODAY'S SCHEDULE</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Active Logs ({todayStr})</h3>

              {todayBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted">
                  No slots booked for today.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-outfit">
                    <thead>
                      <tr className="border-b border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-2">Time Slot</th>
                        <th className="py-3 px-2">Sport</th>
                        <th className="py-3 px-2">Player</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                        <th className="py-3 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayBookings.map((b) => (
                        <tr key={b.id} className="border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30 text-prime-lightText dark:text-prime-darkText hover:bg-prime-lightBg dark:hover:bg-prime-darkBg/20">
                          <td className="py-4 px-2 font-semibold">{b.slots.join(', ')}</td>
                          <td className="py-4 px-2 font-medium">{b.sport}</td>
                          <td className="py-4 px-2">{b.user}</td>
                          <td className="py-4 px-2 text-right font-bold">₹{b.amount}</td>
                          <td className="py-4 px-2 text-right">
                            <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wider ${b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'} border border-current uppercase`}>
                              {b.status === 'CONFIRMED' ? 'Confirmed' : 'Pending Cancel'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar: Notification Feed */}
          <div className="lg:col-span-1 border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm h-fit">
            <span className="section-label">LIVE SYSTEM FEED</span>
            <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Activity Notification Feed</h3>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar font-outfit">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted">No live logs.</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-xs">
                    <p className="text-prime-lightText dark:text-prime-darkText leading-relaxed">{notif.message}</p>
                    <span className="block text-[9px] text-prime-lightTextMuted dark:text-prime-darkTextMuted font-bold tracking-wide mt-2">
                      {notif.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. BOOKINGS MANAGER */}
      {activeTab === 'bookings' && (
        <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
          <span className="section-label">RESERVATION ARCHIVES</span>
          <h2 className="font-playfair text-2xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-8">Filter & Resolve Bookings</h2>

          {/* Filters strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 text-xs font-outfit">

            {/* Sport select */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2">Sport Type</label>
              <select
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="w-full p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText font-medium outline-none focus:border-prime-lightAccent"
              >
                <option value="All">All Sports</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>

              </select>
            </div>

            {/* Status select */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2">Booking Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText font-medium outline-none focus:border-prime-lightAccent"
              >
                <option value="All">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCEL_PENDING">CANCEL PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2">Selected Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText font-medium outline-none focus:border-prime-lightAccent"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => { setFilterSport('All'); setFilterStatus('All'); setFilterDate(''); }}
                className="w-full py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder text-[10px] uppercase tracking-wider font-semibold hover:border-prime-lightTextMuted cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

          </div>

          {/* Bookings Table */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted border border-dashed border-prime-lightBorder">
              No matching bookings found for current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-outfit">
                <thead>
                  <tr className="border-b border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-wider text-[10px] font-bold bg-prime-lightBg dark:bg-[#1C1F2A] px-2 py-3">
                    <th className="p-3">ID / User</th>
                    <th className="p-3">Sport & Date</th>
                    <th className="p-3">Time Slots</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30 text-prime-lightText dark:text-prime-darkText hover:bg-prime-lightBg dark:hover:bg-prime-darkBg/10">
                      <td className="p-3">
                        <div className="font-semibold font-mono truncate max-w-[120px]">{b.id}</div>
                        <div className="text-[10px] text-prime-lightTextMuted mt-0.5">{b.user}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{b.sport}</div>
                        <div className="text-[10px] text-prime-lightTextMuted mt-0.5">{b.date}</div>
                      </td>
                      <td className="p-3 font-medium">{b.slots.join(', ')}</td>
                      <td className="p-3 text-right font-bold">₹{b.amount}</td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wider ${b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' :
                            b.status === 'CANCELLED' ? 'bg-red-50 text-red-700 dark:bg-red-950/20' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                            } border border-current uppercase`}>
                            {b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Cancel Requested'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2.5">

                          {/* Cancel requests Approve/Reject buttons */}
                          {b.status === 'CANCEL_PENDING' && (
                            <div className="flex space-x-1.5">
                              <button
                                onClick={() => handleApproveCancel(b.id)}
                                className="p-1 border border-emerald-500 hover:bg-emerald-500 hover:text-white text-emerald-500 transition-colors cursor-pointer"
                                title="Approve Cancellation"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectCancel(b.id)}
                                className="p-1 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 transition-colors cursor-pointer"
                                title="Reject / Keep Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Print details navigation */}
                          <Link
                            to={`/receipt/${b.id}`}
                            className="p-1.5 border border-prime-lightBorder dark:border-prime-darkBorder hover:border-prime-lightAccent hover:text-prime-lightAccent text-prime-lightTextMuted dark:text-prime-darkTextMuted transition-colors"
                            title="View / Download Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>

                        </div>
                        {b.cancelReason && b.status === 'CANCEL_PENDING' && (
                          <div className="text-[10px] text-red-500 italic mt-1 text-right max-w-xs ml-auto">
                            "{b.cancelReason}"
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. PRICING & STATUS MANAGER */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Pricing form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">TARIFF MANAGER</span>
              <h2 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Modify Hourly Rates</h2>

              <form onSubmit={handleSavePricing} className="space-y-6 text-xs font-outfit">

                {['Football', 'Cricket'].map((sport) => (
                  <div key={sport} className="border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30 pb-6 last:border-0 last:pb-0">
                    <h4 className="font-playfair text-base font-bold text-prime-lightText dark:text-prime-darkText mb-3">{sport} Rates (₹/hr)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase font-semibold text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-1.5">Morning (6AM - 12PM)</label>
                        <input
                          type="number"
                          value={formPricing[sport]?.morning || 0}
                          onChange={(e) => handlePricingChange(sport, 'morning', e.target.value)}
                          className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-semibold text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-1.5">Afternoon (12PM - 5PM)</label>
                        <input
                          type="number"
                          value={formPricing[sport]?.afternoon || 0}
                          onChange={(e) => handlePricingChange(sport, 'afternoon', e.target.value)}
                          className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-semibold text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-1.5">Evening (5PM - 11PM)</label>
                        <input
                          type="number"
                          value={formPricing[sport]?.evening || 0}
                          onChange={(e) => handlePricingChange(sport, 'evening', e.target.value)}
                          className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Surcharge Toggle */}
                <div className="pt-4 border-t border-prime-lightBorder dark:border-prime-darkBorder flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-prime-lightText dark:text-prime-darkText">Weekend Surcharge</h4>
                    <p className="text-[10px] text-prime-lightTextMuted">Apply rate scaling modification on Saturday & Sunday slots.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={formSurcharge.rate}
                      onChange={(e) => setFormSurcharge(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                      className="w-16 p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText text-center font-bold"
                      placeholder="%"
                    />
                    <span className="font-bold text-prime-lightText dark:text-prime-darkText">%</span>
                    <button
                      type="button"
                      onClick={() => setFormSurcharge(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className="text-prime-lightAccent dark:text-prime-darkAccent cursor-pointer"
                    >
                      {formSurcharge.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 opacity-50" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted italic">
                    Last modified: {pricingLastUpdated}
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-prime-lightAccent text-white dark:bg-prime-darkAccent uppercase font-bold tracking-widest text-[10px] cursor-pointer"
                  >
                    Save Pricing Modifier Rules
                  </button>
                </div>

              </form>
            </div>

            {/* Live Pricing Preview (What users see) */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-[#FCFAF6] dark:bg-[#1D202A] p-6">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-prime-lightAccent dark:text-prime-darkAccent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> LIVE CLIENT GRID PREVIEW
              </span>
              <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1">
                Visualizing user slot billing options (excluding weekend modifiers).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {['Football', 'Cricket'].map((sport) => (
                  <div key={sport} className="border border-prime-lightBorder dark:border-prime-darkBorder/40 bg-white dark:bg-[#1A1D26] p-4 font-outfit">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60 block">{sport} Preview</span>
                    <hr className="my-2 border-prime-lightBorder/40" />
                    <div className="space-y-1.5 text-[11px] font-semibold text-prime-lightText dark:text-prime-darkText">
                      <div className="flex justify-between"><span>🌅 Morning slot</span><span>₹{formPricing[sport]?.morning || 0}</span></div>
                      <div className="flex justify-between"><span>☀️ Afternoon slot</span><span>₹{formPricing[sport]?.afternoon || 0}</span></div>
                      <div className="flex justify-between"><span>🌙 Evening slot</span><span>₹{formPricing[sport]?.evening || 0}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Turf Status Panel & Maintenance Schedule */}
          <div className="lg:col-span-1 space-y-8">

            {/* Turf open/close toggle */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">OPERATIONS SWITCH</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Turf Status Switch</h3>

              <div className="space-y-5 text-xs font-outfit">
                <div className="flex items-center justify-between p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg">
                  <div className="font-semibold text-prime-lightText dark:text-prime-darkText">
                    Status: {isTurfOpen ? (
                      <span className="text-prime-lightAccent dark:text-prime-darkAccent font-bold">OPEN</span>
                    ) : (
                      <span className="text-red-500 font-bold">CLOSED</span>
                    )}
                  </div>
                  <button
                    onClick={handleToggleTurfStatus}
                    className={`px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] text-white transition-all cursor-pointer ${isTurfOpen ? 'bg-red-600 hover:bg-red-800' : 'bg-prime-lightAccent hover:bg-prime-lightAccent/80'}`}
                  >
                    {isTurfOpen ? "Close Turf" : "Open Turf"}
                  </button>
                </div>

                {!isTurfOpen && (
                  <div className="space-y-3.5 border-t border-prime-lightBorder/50 pt-4 animate-fade-in">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">Closure Reason</label>
                      <input
                        type="text"
                        value={closureReason}
                        onChange={(e) => setClosureReason(e.target.value)}
                        placeholder="e.g. Undergoing pitch maintenance"
                        className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">Expected Reopen Date</label>
                      <input
                        type="text"
                        value={reopenDate}
                        onChange={(e) => setReopenDate(e.target.value)}
                        placeholder="e.g. May 30, 2026"
                        className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        updateTurfStatus({ status: 'closed', reason: closureReason, reopenDate });
                        alert("Closure details updated in database!");
                      }}
                      className="w-full py-2 bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                    >
                      Update Closure Info
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Block Schedule Maintenance */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">MAINTENANCE SCHEDULER</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Block Slots (Maintenance)</h3>

              <form onSubmit={handleAddMaintenance} className="space-y-4 text-xs font-outfit">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    required
                    className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">Start Hour (24h)</label>
                    <select
                      value={maintStart}
                      onChange={(e) => setMaintStart(e.target.value)}
                      className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i < 10 ? `0${i}` : `${i}`}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">End Hour (24h)</label>
                    <select
                      value={maintEnd}
                      onChange={(e) => setMaintEnd(e.target.value)}
                      className="w-full p-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={i < 10 ? `0${i}` : `${i}`}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-prime-lightAccent text-white dark:bg-prime-darkAccent uppercase font-bold tracking-widest text-[10px] cursor-pointer"
                >
                  Block Selected Range
                </button>
              </form>

              {/* Maintenance Blocks lists */}
              {maintenanceBlocks.length > 0 && (
                <div className="mt-6 border-t border-prime-lightBorder/50 pt-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-2.5">Active Blocks List</p>
                  <div className="space-y-1.5">
                    {maintenanceBlocks.map((block, idx) => (
                      <div key={block.id || idx} className="flex justify-between items-center text-[10px] p-2 bg-prime-lightBg dark:bg-prime-darkBg">
                        <span>{block.date} @ {block.startHour}:00 - {block.endHour}:00</span>
                        <button
                          onClick={() => handleRemoveMaintenance(idx)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 4. CONTENT & BROADCAST BANNER */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-outfit text-xs">

          {/* Main Left column: photo upload, turf features, equipment list */}
          <div className="lg:col-span-2 space-y-8">

            {/* Features checkboxes */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">AMENITIES INDEX</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Turf Features Index</h3>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-[#1E212A]"
                  >
                    <span className="font-semibold text-prime-lightText dark:text-prime-darkText">{feature.name}</span>
                    <button
                      onClick={() => handleFeatureToggle(feature.id, feature.enabled)}
                      className="text-prime-lightAccent dark:text-prime-darkAccent cursor-pointer"
                    >
                      {feature.enabled ? (
                        <span className="text-[10px] font-bold text-emerald-600">ENABLED</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 opacity-60">DISABLED</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment lists rows */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">INVENTORY LOGS</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Rentable Equipment Inventory</h3>

              <form onSubmit={handleAddEquipment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newEquip}
                  onChange={(e) => setNewEquip(e.target.value)}
                  placeholder="e.g. 🏸 Pro Racquets"
                  required
                  className="flex-grow p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none"
                />
                <button
                  type="submit"
                  className="px-5 bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                >
                  Add Item
                </button>
              </form>

              <div className="flex flex-wrap gap-2.5">
                {equipmentList.map((item, index) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText border border-prime-lightBorder dark:border-prime-darkBorder font-medium flex items-center gap-2"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveEquipment(item)}
                      className="text-prime-lightTextMuted hover:text-red-500 hover:scale-110 transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Photos upload grid */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">PHOTO MANAGEMENT</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Editorial Photo Gallery</h3>

              {/* Hidden file input */}
              <input
                type="file"
                id="photo-upload-input"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Upload click zone */}
              <label
                htmlFor="photo-upload-input"
                className="border-2 border-dashed border-prime-lightBorder dark:border-prime-darkBorder hover:border-prime-lightAccent dark:hover:border-prime-darkAccent py-8 text-center cursor-pointer mb-6 transition-colors duration-200 flex flex-col items-center justify-center"
              >
                {uploadingPhoto ? (
                  <Loader className="w-8 h-8 text-prime-lightAccent dark:text-prime-darkAccent animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-prime-lightTextMuted dark:text-prime-darkTextMuted mb-2" />
                )}
                <p className="font-semibold text-xs text-prime-lightText dark:text-prime-darkText">
                  {uploadingPhoto ? 'Uploading to Supabase Storage...' : 'Click to select and upload turf photo'}
                </p>
                <p className="text-[10px] text-prime-lightTextMuted mt-0.5">* Stores file in Supabase bucket</p>
              </label>

              {/* Thumbnail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-video border border-prime-lightBorder dark:border-prime-darkBorder group overflow-hidden bg-black">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-800 text-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 truncate text-[8px] text-white uppercase text-center font-bold">
                      {photo.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right sidebar Column: Broadcast Banner Tool & About text */}
          <div className="lg:col-span-1 space-y-8">

            {/* Broadcast Banner Tool */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">EMERGENCY BROADCASTS</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Broadcast Banner Tool</h3>

              <form onSubmit={handleBannerGoLive} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-prime-lightTextMuted mb-1.5">Banner Announcement Text</label>
                  <textarea
                    rows="4"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="e.g. 🚨 Maintenance Notice: Turf 2 closed Sunday..."
                    required
                    className="w-full p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none text-xs"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow py-2 bg-[#F9EB8E] text-[#5C4D1C] hover:bg-[#F3DE66] uppercase font-bold tracking-widest text-[9px] flex items-center justify-center gap-1 border border-[#E9D66E] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Go Live PUSH
                  </button>
                  {broadcastBanner.active && (
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="px-4 py-2 border border-red-300 dark:border-red-900/50 hover:border-red-600 text-red-500 hover:text-red-700 uppercase font-bold tracking-widest text-[9px] cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </form>

              {broadcastBanner.active && (
                <div className="mt-4 p-3 bg-[#FFFDEB] text-[#5C4D1C] dark:bg-[#1C1A12] dark:text-[#E6D69E] border border-[#F5E8C4] text-[10px] font-medium leading-relaxed">
                  <span className="font-bold tracking-widest uppercase text-[8px] bg-[#EBE0C2] px-1 mr-1">ACTIVE MESSAGE:</span>
                  {broadcastBanner.text}
                </div>
              )}
            </div>

            {/* About text textarea */}
            <div className="border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-6 shadow-sm">
              <span className="section-label">ABOUT TEXT AREA</span>
              <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1 mb-6">Boutique Brand Details</h3>

              <div className="space-y-4">
                <textarea
                  rows="5"
                  value={formAboutText}
                  onChange={(e) => setFormAboutText(e.target.value)}
                  className="w-full p-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg text-prime-lightText dark:text-prime-darkText outline-none text-xs leading-relaxed"
                ></textarea>
                <button
                  onClick={() => alert("Brand details text saved (persisted mockup).")}
                  className="w-full py-2.5 bg-prime-lightAccent text-white dark:bg-prime-darkAccent uppercase font-bold tracking-widest text-[10px] cursor-pointer"
                >
                  Save Brand Text
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Admin;
