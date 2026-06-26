import React from 'react';
import PhotoGallery from '../components/PhotoGallery';
import Footer from '../components/Footer';

const Gallery = () => {
  return (
    <div className="w-full bg-[#F7F5F0] dark:bg-[#0F1117] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-12 md:py-20 font-outfit">
        <span className="section-label">Gallery</span>
        <h1 className="font-playfair text-3xl md:text-5xl font-bold text-prime-lightText dark:text-prime-darkText mt-2 mb-8 md:mb-10">
          Tanush Sports Club Gallery
        </h1>
        <PhotoGallery />
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
