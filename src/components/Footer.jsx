import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] py-10 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 font-outfit">
        
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <h3 className="font-playfair font-bold text-lg tracking-[0.2em] text-prime-lightText dark:text-prime-darkText uppercase">
            TANUSH<span className="text-prime-lightAccent dark:text-prime-darkAccent">.</span>SPORTS
          </h3>
          <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted leading-relaxed max-w-xs">
            A premium sports club in Sawantwadi. Football, Cricket, and Pool on world-class facilities.
          </p>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText">Contact</h4>
          <ul className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted space-y-2">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Parmarth Niketan, Near, Vengurla - Belgaum Rd, near Gram Panchayat, Sawantwadi, Kolgaon, Maharashtra 416510
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              +91 9137381239
            </li>
          </ul>
        </div>

        {/* Location Map */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText">
            Location
          </h4>
          <div className="overflow-hidden rounded-xl border border-prime-lightBorder dark:border-prime-darkBorder">
            <iframe
              title="Tanush Sports Club Location"
              src="https://maps.google.com/maps?q=Parmarth%20Niketan%2C%20Near%2C%20Vengurla%20-%20Belgaum%20Rd%2C%20near%20Gram%20Panchayat%2C%20Sawantwadi%2C%20Kolgaon%2C%20Maharashtra%20416510&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Parmarth+Niketan,+Near,+Vengurla+-+Belgaum+Rd,+near+Gram+Panchayat,+Sawantwadi,+Kolgaon,+Maharashtra+416510"
            target="_blank"
            rel="noopener noreferrer"
            className="text-prime-lightAccent dark:text-prime-darkAccent text-xs hover:underline block"
          >
            Open in Google Maps →
          </a>
        </div>

        {/* Hours & Social */}
        <div className="space-y-3">
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText mb-2">Hours</h4>
            <ul className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted space-y-2">
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Everyday: 6 AM – 11 PM</li>
              <li className="font-semibold text-prime-lightAccent dark:text-prime-darkAccent text-[9px] uppercase tracking-wider">Booking opens 7 days in advance</li>
            </ul>
          </div>
          <div className="pt-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText mb-2">Follow Us</h4>
            <a 
              href="https://instagram.com/tanush_sports_club" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block p-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent transition-all duration-300"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <p className="text-[9px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest mt-4">
              © 2026 Tanush Sports Club.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
