import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && (!form.name || !form.phone)) {
      setError('Name and phone number are required for registration.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.email, form.password, form.name, form.phone);
        alert("Account created successfully! Welcome to Prime Turf.");
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://prime-turf-nu.vercel.app/'
      }
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-prime-lightBg dark:bg-prime-darkBg transition-colors duration-300">
      <div className="w-full max-w-md border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] p-8 md:p-10 font-outfit shadow-sm">

        {/* Header Branding */}
        <div className="text-center pb-6 border-b border-prime-lightBorder/50 dark:border-prime-darkBorder/30 mb-8">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-prime-lightAccent dark:text-prime-darkAccent">Athletics Hub</span>
          <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-1.5">
            {mode === 'login' ? 'Sign In' : 'Register'}
          </h2>
          <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest mt-1">
            Prime Turf Booking Access
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-prime-lightTextMuted dark:text-prime-darkTextMuted opacity-60">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-prime-lightAccent dark:focus:border-prime-darkAccent transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-prime-lightTextMuted dark:text-prime-darkTextMuted opacity-60">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-prime-lightAccent dark:focus:border-prime-darkAccent transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-prime-lightTextMuted dark:text-prime-darkTextMuted opacity-60">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="player@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-prime-lightAccent dark:focus:border-prime-darkAccent transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-bold tracking-wider text-prime-lightTextMuted dark:text-prime-darkTextMuted">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-prime-lightTextMuted dark:text-prime-darkTextMuted opacity-60">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg/30 text-prime-lightText dark:text-prime-darkText text-xs outline-none focus:border-prime-lightAccent dark:focus:border-prime-darkAccent transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-xs font-semibold pt-1">
              * {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-prime-lightAccent dark:bg-prime-darkAccent hover:bg-transparent hover:text-prime-lightAccent hover:border-prime-lightAccent dark:hover:text-prime-darkAccent dark:hover:border-prime-darkAccent border border-transparent font-outfit uppercase tracking-widest text-xs font-semibold text-white transition-all duration-300 text-center flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-prime-lightBorder dark:border-prime-darkBorder lg:w-1/4"></span>
          <span className="text-xs text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest">or</span>
          <span className="w-1/5 border-b border-prime-lightBorder dark:border-prime-darkBorder lg:w-1/4"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="mt-4 w-full flex items-center justify-center gap-2 rounded bg-white dark:bg-[#2A2D35] px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-prime-darkBorder hover:bg-gray-50 dark:hover:bg-[#343842] transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Mode Toggle Footer */}
        <div className="mt-8 pt-4 border-t border-prime-lightBorder/50 dark:border-prime-darkBorder/30 text-center text-xs">
          <p className="text-prime-lightTextMuted dark:text-prime-darkTextMuted">
            {mode === 'login' ? "Don't have a player account? " : 'Already registered with us? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-prime-lightAccent dark:text-prime-darkAccent font-bold hover:underline ml-1"
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted">
            <ShieldCheck className="w-3.5 h-3.5 opacity-60" />
            <span>Secured booking channel via Supabase Auth</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;