import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, HelpCircle, MapPin, Phone, Clock } from 'lucide-react';
import { useApp } from '../AppContext';
import PhotoGallery from '../components/PhotoGallery';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const { features, equipmentList, galleryPhotos } = useApp();

  // Seeding custom high-quality images for categories
  const sportCategories = [
    {
      name: 'Football',
      url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80',
      tagline: 'Premium grass, 7-a-side dimensions'
    },
    {
      name: 'Cricket',
      url: 'https://images.unsplash.com/photo-1531415080290-bc98513ff86b?auto=format&fit=crop&w=800&q=80',
      tagline: 'Clay pitches with net enclosures'
    },
    {
      name: 'Badminton',
      url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      tagline: 'Synthetic indoor court mats'
    }
  ];

  const handleCategoryClick = (sportName) => {
    navigate(`/book?sport=${sportName}`);
  };

  // SVGs for features matching minimal outline style
  const getFeatureIcon = (id) => {
    const classVal = "w-5 h-5 text-prime-lightAccent dark:text-prime-darkAccent opacity-90 stroke-[1.5]";
    switch (id) {
      case 'floodlit':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314-.707-.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
          </svg>
        );
      case 'changing':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        );
      case 'parking':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h7.5m3-3h-10.5m10.5 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0v-4.5m-13.5 0h16.5M3 10.5h18M3 10.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-6Z" />
          </svg>
        );
      case 'water':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-3.176 0-5.75-2.574-5.75-5.75 0-3.834 3.75-9 5.75-11.25 2 2.25 5.75 7.416 5.75 11.25 0 3.176-2.574 5.75-5.75 5.75Z" />
          </svg>
        );
      case 'firstaid':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        );
      case 'seating':
        return (
          <svg className={classVal} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-1.5m7.5 0V18a2.25 2.25 0 0 0 2.25 2.25h1.5A2.25 2.25 0 0 0 17.25 18v-1.5" />
          </svg>
        );
      default:
        return <HelpCircle className={classVal} />;
    }
  };

  const mockReviews = [
    { id: 1, name: "Arjun Mehta", rating: 5, quote: "The turf is top tier. The floodlights are perfectly positioned, no blindspots. Playfair typography on the board is a nice touch too!", date: "Yesterday" },
    { id: 2, name: "Sarah D'Souza", rating: 5, quote: "Loved the badminton court. Clean layout, professional mats, and the booking flow was seamless. Silver loyalty tier discount applied!", date: "2 days ago" },
    { id: 3, name: "Kabir Sen", rating: 4, quote: "Excellent football pitch. Easy parking and pure minimal design. Re-booking feature saved me a lot of clicks.", date: "4 days ago" },
    { id: 4, name: "Meera Nair", rating: 5, quote: "Boutique feel. A premium sports club experience, not just a casual booking platform. Booking here feels special.", date: "Last week" }
  ];

  return (
    <div className="w-full">
      {/* 1. Hero Section: Full-Bleed Turf Photo with bottom fade */}
      <section className="relative w-full h-[85vh] overflow-hidden bg-black flex items-end">
        <img 
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80" 
          alt="Prime Turf Field" 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        
        {/* Gradients to fade to page background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5F0] dark:from-[#0F1117] via-black/10 to-transparent"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 w-full pb-16 md:pb-24 z-10 font-outfit text-white">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-prime-lightAccent dark:text-prime-darkAccent">BOUTIQUE ATHLETICS CLUB</span>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tight text-white mt-4 max-w-2xl leading-none">
            Book Your Game<span className="text-prime-lightAccent dark:text-prime-darkAccent">.</span>
          </h1>
          <p className="text-sm md:text-base font-light text-white/80 mt-6 max-w-md leading-relaxed font-outfit">
            A premium sports magazine layout crossed with a boutique scheduling platform. Curated court specs, clean air spaces, and absolute play precision.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => navigate('/book')}
              className="px-8 py-4 bg-prime-lightAccent dark:bg-prime-darkAccent hover:bg-white hover:text-[#1A1A1A] font-semibold text-xs uppercase tracking-widest text-white transition-all duration-300 inline-flex items-center gap-2"
            >
              Reserve a Slot <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Sport Type Category Strip */}
      <section className="max-w-7xl mx-auto px-6 py-20 font-outfit">
        <span className="section-label">BOOK A SLOT</span>
        <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-10">Select Arena Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sportCategories.map((sport) => (
            <div 
              key={sport.name}
              onClick={() => handleCategoryClick(sport.name)}
              className="zoom-image-container relative aspect-[4/5] border border-prime-lightBorder dark:border-prime-darkBorder cursor-pointer flex items-end group"
            >
              <img 
                src={sport.url} 
                alt={sport.name} 
                className="absolute inset-0 w-full h-full object-cover zoom-image" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300"></div>
              
              <div className="relative p-6 text-white w-full">
                <h3 className="font-playfair text-3xl font-bold italic tracking-wide">{sport.name}</h3>
                <p className="text-[11px] font-outfit font-light tracking-wide text-white/70 mt-1 uppercase">{sport.tagline}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-prime-darkAccent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Select Slots <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thin horizontal divider */}
      <div className="max-w-7xl mx-auto px-6"><hr /></div>

      {/* 3. Facilities / Features Section */}
      <section id="facilities" className="max-w-7xl mx-auto px-6 py-20 font-outfit">
        <span className="section-label">FACILITIES</span>
        <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-12">Engineered for Performance</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className={`flex items-start space-x-4 transition-all duration-300 ${feature.enabled ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className="p-3 border border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] flex-shrink-0">
                {getFeatureIcon(feature.id)}
              </div>
              <div>
                <h4 className="font-outfit text-sm font-semibold text-prime-lightText dark:text-prime-darkText">{feature.name}</h4>
                <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-1 leading-relaxed">
                  Fully operational and certified for tournament grade athletics operations daily.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thin horizontal divider */}
      <div className="max-w-7xl mx-auto px-6"><hr /></div>

      {/* 4. Equipment Rentals list */}
      <section className="max-w-7xl mx-auto px-6 py-16 font-outfit text-center bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder my-8">
        <span className="section-label">EQUIPMENT RENTALS</span>
        <h3 className="font-playfair text-xl font-bold text-prime-lightText dark:text-prime-darkText mt-1.5 mb-6">
          Everything You Need To Play
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs md:text-sm font-medium text-prime-lightText dark:text-prime-darkText max-w-2xl mx-auto">
          {equipmentList.map((item, idx) => (
            <React.Fragment key={item}>
              <span className="px-3.5 py-2 border border-prime-lightBorder dark:border-prime-darkBorder bg-prime-lightBg dark:bg-prime-darkBg font-medium select-none">
                {item}
              </span>
              {idx < equipmentList.length - 1 && <span className="text-prime-lightAccent dark:text-prime-darkAccent font-bold">·</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-prime-lightTextMuted dark:text-prime-darkTextMuted mt-4 uppercase tracking-widest font-semibold">
          * Included free of cost on Gold loyalty tier accounts
        </p>
      </section>

      {/* Thin horizontal divider */}
      <div className="max-w-7xl mx-auto px-6"><hr /></div>

      {/* 5. Editorial Gallery Section */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-20 font-outfit">
        <span className="section-label">GALLERY</span>
        <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-10">Boutique Viewports</h2>
        <PhotoGallery />
      </section>

      {/* Thin horizontal divider */}
      <div className="max-w-7xl mx-auto px-6"><hr /></div>

      {/* 6. Testimonials Reviews Carousel */}
      <section id="reviews" className="max-w-7xl mx-auto px-6 py-20 font-outfit">
        <span className="section-label">REVIEWS</span>
        <h2 className="font-playfair text-3xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-10">Voice of the Pitch</h2>
        
        {/* Horizontal scroll reviews */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 custom-scrollbar">
          {mockReviews.map((review) => (
            <div 
              key={review.id} 
              className="flex-shrink-0 w-80 bg-white dark:bg-[#1A1D26] border border-prime-lightBorder dark:border-prime-darkBorder p-6 flex flex-col justify-between font-outfit shadow-sm"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center space-x-0.5 text-prime-lightAccent dark:text-prime-darkAccent">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} 
                    />
                  ))}
                </div>
                <p className="font-outfit text-sm italic font-light text-prime-lightText dark:text-prime-darkText mt-4 leading-relaxed">
                  "{review.quote}"
                </p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-prime-lightBorder/50 dark:border-prime-darkBorder/30 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-prime-lightTextMuted dark:text-prime-darkTextMuted">
                <span>{review.name}</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-prime-lightBorder dark:border-prime-darkBorder bg-white dark:bg-[#1A1D26] py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 font-outfit">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <h3 className="font-playfair font-bold text-lg tracking-[0.2em] text-prime-lightText dark:text-prime-darkText uppercase">
              PRIME<span className="text-prime-lightAccent dark:text-prime-darkAccent">.</span>TURF
            </h3>
            <p className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted leading-relaxed max-w-xs">
              A bespoke private athletic booking ground in the city center. Tailored pitches, high illumination sports lighting, and premium hardware hire.
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText">Contact Details</h4>
            <ul className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> 84 Prime Club Cross, Indiranagar, Bangalore</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 98845 28100</li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText">Operational Hours</h4>
            <ul className="text-xs text-prime-lightTextMuted dark:text-prime-darkTextMuted space-y-2">
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Everyday: 06:00 AM - 11:00 PM</li>
              <li className="font-semibold text-prime-lightAccent dark:text-prime-darkAccent mt-1 uppercase text-[9px] tracking-wider">
                * Booking calendar opens 7 days in advance
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-prime-lightText dark:text-prime-darkText">Connect Online</h4>
            <div className="flex space-x-3.5">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 border border-prime-lightBorder dark:border-prime-darkBorder text-prime-lightTextMuted dark:text-prime-darkTextMuted hover:border-prime-lightAccent dark:hover:border-prime-darkAccent hover:text-prime-lightAccent dark:hover:text-prime-darkAccent transition-all duration-300"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[9px] text-prime-lightTextMuted dark:text-prime-darkTextMuted uppercase tracking-widest mt-4">
              © 2026 Prime Turf Arena. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
