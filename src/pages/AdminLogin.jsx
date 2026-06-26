import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await signIn(form.email, form.password);
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles').select('is_admin').eq('id', data.user.id).single();
        if (profileError || !profileData?.is_admin) {
          await signOut();
          throw new Error('Access denied. This account does not have admin privileges.');
        }
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-prime-lightBg dark:bg-prime-darkBg transition-colors duration-300">
      <div className="w-full max-w-md border border-red-200 dark:border-red-950/30 bg-white dark:bg-[#1A1D26] p-8 md:p-10 font-outfit shadow-sm">

        {/* Header */}
        <div className="text-center pb-6 border-b border-red-100 dark:border-red-950/20 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-[10px] uppercase font-bold tracking-widest mb-3 border border-red-200 dark:border-red-900/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Admin Portal
          </div>
          <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-1.5">Admin Access</h2>
          <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest mt-1">Secure Terminal · Authorised Personnel Only</p>
        </div>

        {/* How to get access notice */}
        <div className="bg-prime-lightBg dark:bg-prime-darkBg border border-prime-lightBorder dark:border-prime-darkBorder p-3 mb-6 text-[11px] text-prime-lightTextMuted dark:text-prime-darkTextMuted leading-relaxed">
          <strong className="text-prime-lightText dark:text-prime-darkText block mb-1">How admin access works:</strong>
          Admin accounts must be manually granted in the Supabase database by setting <code className="bg-prime-lightBorder dark:bg-prime-darkBorder px-1 py-0.5 text-[10px]">is_admin = true</code> on the user's profile row. Regular users cannot access this portal.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-50"><Mail className="w-4 h-4" /></span>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@tanushsports.com"
                className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-50"><Lock className="w-4 h-4" /></span>
              <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-red-500 transition-colors" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-semibold pt-1">* {error}</p>}

          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3.5 bg-red-600 dark:bg-red-700 hover:bg-transparent hover:text-red-600 hover:border-red-600 border border-transparent font-outfit uppercase tracking-widest text-xs font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Sign In To Terminal'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-prime-lightBorder/50 dark:border-prime-darkBorder/30 text-center text-xs">
          <p className="text-prime-lightTextMuted dark:text-prime-darkTextMuted">
            Are you a customer?{' '}
            <Link to="/login" className="text-prime-lightAccent dark:text-prime-darkAccent font-bold hover:underline ml-1">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
