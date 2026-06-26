import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M17 14c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.2l-.7.9c-.2.2-.4.3-.7.2a7.7 7.7 0 0 1-2.9-1.8 7.7 7.7 0 0 1-1.8-2.9c-.1-.3 0-.5.2-.7l.9-.7c.3-.2.3-.4.2-.7L8.6 6c-.2-.3-.4-.3-.7-.2-.2.1-.5.3-.6.5l-.2.8c0 .8.3 1.9 1.2 3.1a12.8 12.8 0 0 0 5.4 4.7c.6.2 1.2.2 1.6.2l.8-.2c.5-.1.8-.4.9-.6l.5-.6c.2-.2.2-.5 0-.7z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] py-10 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 font-outfit">
        
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <h3 className="font-playfair font-bold text-lg tracking-[0.1em] text-prime-lightText dark:text-prime-darkText uppercase">
            TANUSH SPORTS CLUB
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
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Everyday: Open 24 Hours</li>
              <li className="font-semibold text-prime-lightAccent dark:text-prime-darkAccent text-[9px] uppercase tracking-wider">Booking opens 7 days in advance</li>
            </ul>
          </div>
          <div className="pt-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText mb-2">Follow Us</h4>
            <div className="flex items-center gap-2">
              <a 
                href="https://instagram.com/tanush_sports_club" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block p-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent transition-all duration-300"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://chat.whatsapp.com/GS3z7pNRksv1az6VFMYg9P" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Join our WhatsApp Community"
                title="Join our WhatsApp Community"
                className="inline-block p-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:border-[#25D366] dark:hover:border-[#25D366] hover:text-[#25D366] dark:hover:text-[#25D366] hover:scale-110 transition-all duration-300"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
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
