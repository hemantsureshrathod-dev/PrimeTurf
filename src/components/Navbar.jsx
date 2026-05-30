import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, User, ChevronDown, ShieldAlert, Award, LogOut } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { 
    theme, 
    toggleTheme, 
    currentUser, 
    userLoyalty 
  } = useApp();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for page load, then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeLinkClass = (path) => {
    return location.pathname === path 
      ? "text-prime-lightAccent dark:text-prime-darkAccent font-semibold"
      : "text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F1117]/80 backdrop-blur-md border-b border-prime-lightBorder dark:border-prime-darkBorder transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="font-playfair font-bold text-lg md:text-xl tracking-[0.2em] text-prime-lightText dark:text-prime-darkText uppercase select-none">
          PRIME<span className="text-prime-lightAccent dark:text-prime-darkAccent">.</span>TURF
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center space-x-8 font-outfit text-xs font-medium uppercase tracking-wider">
          <Link to="/" className={`${activeLinkClass('/')} transition-all duration-200`}>Home</Link>
          <Link to="/book" className={`${activeLinkClass('/book')} transition-all duration-200`}>Book</Link>
          <button 
            onClick={() => handleNavClick('facilities')}
            className="text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText transition-all duration-200 link-editorial cursor-pointer"
          >
            Facilities
          </button>
          <button 
            onClick={() => handleNavClick('gallery')}
            className="text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText transition-all duration-200 link-editorial cursor-pointer"
          >
            Gallery
          </button>
          <button 
            onClick={() => handleNavClick('reviews')}
            className="text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:text-prime-lightText dark:hover:text-prime-darkText transition-all duration-200 link-editorial cursor-pointer"
          >
            Reviews
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Dark / Light Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 border border-prime-lightBorder dark:border-prime-darkBorder hover:border-prime-lightAccent dark:hover:border-prime-darkAccent transition-all duration-300 text-prime-lightText dark:text-prime-darkText cursor-pointer"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Profile Dropdown Selector or Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightText dark:text-prime-darkText font-outfit text-xs hover:border-prime-lightAccent dark:hover:border-prime-darkAccent transition-all duration-300 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder py-2 z-50 text-xs font-outfit shadow-sm">
                  
                  {/* User Loyalty Header */}
                  <div className="px-4 py-2.5 border-b border-prime-lightBorder dark:border-prime-darkBorder">
                    <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest">Active Profile</p>
                    <p className="font-semibold text-prime-lightText dark:text-prime-darkText mt-0.5">{currentUser.name}</p>
                    <div className="flex items-center mt-2.5 space-x-1.5">
                      <span 
                        className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-semibold text-white flex items-center gap-1"
                        style={{ backgroundColor: userLoyalty.color }}
                      >
                        <Award className="w-2.5 h-2.5" />
                        {userLoyalty.name}
                      </span>
                      {userLoyalty.discount > 0 && (
                        <span className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted">
                          ({userLoyalty.discount}% Discount)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation Options */}
                  <div className="py-1">
                    <Link 
                      to="/my-bookings" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-prime-lightText dark:text-prime-darkText hover:bg-prime-lightBg dark:hover:bg-prime-darkBg"
                    >
                      My Bookings
                    </Link>
                    <Link 
                      to="/book" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-prime-lightText dark:text-prime-darkText hover:bg-prime-lightBg dark:hover:bg-prime-darkBg"
                    >
                      Book a Slot
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-prime-lightBg dark:hover:bg-prime-darkBg font-medium"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <button 
                      onClick={async () => {
                        await signOut();
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-prime-lightText dark:text-prime-darkText hover:bg-prime-lightBg dark:hover:bg-prime-darkBg border-t border-prime-lightBorder/50 dark:border-prime-darkBorder/30 mt-1 pt-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      Sign Out
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center px-4 py-2 bg-prime-lightText dark:bg-prime-darkText text-white dark:text-[#0F1117] font-outfit text-xs font-semibold uppercase tracking-wider border border-transparent hover:border-prime-lightText dark:hover:border-prime-darkText hover:bg-transparent hover:text-prime-lightText dark:hover:text-prime-darkText transition-all duration-300"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
