import React from 'react';
import { useApp } from '../AppContext';
import { ImageOff } from 'lucide-react';

const PhotoGallery = () => {
  const { galleryPhotos } = useApp();

  // If no photos exist in context yet, show a clean, styled placeholder message
  if (!galleryPhotos || galleryPhotos.length === 0) {
    return (
      <div className="border border-dashed border-prime-lightBorder dark:border-prime-darkBorder p-12 text-center text-prime-lightTextMuted dark:text-prime-darkTextMuted font-outfit">
        <ImageOff className="w-8 h-8 mx-auto mb-3 opacity-60 text-prime-lightAccent dark:text-prime-darkAccent" />
        <h4 className="font-playfair text-lg font-bold text-prime-lightText dark:text-prime-darkText">No Gallery Views Available</h4>
        <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
          The editorial image reels are currently empty. Log in as administrator to upload pitch photos to the database.
        </p>
      </div>
    );
  }

  // Split photos for editorial grid
  const mainLandscape = galleryPhotos[0];
  const rightPortrait1 = galleryPhotos[1];
  const rightPortrait2 = galleryPhotos[2];
  const scrollStripPhotos = galleryPhotos.slice(3);

  return (
    <div className="w-full">
      {/* Editorial Grid (3 columns on md) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: 1 Large Landscape Photo (2 columns wide) */}
        {mainLandscape && (
          <div className="md:col-span-2 zoom-image-container relative aspect-[16/10] border border-prime-lightBorder dark:border-prime-darkBorder">
            <img 
              src={mainLandscape.url} 
              alt={mainLandscape.caption || "Court View"} 
              className="w-full h-full object-cover zoom-image" 
            />
            {/* Minimal editorial caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
              <span className="text-[10px] uppercase tracking-widest font-outfit opacity-80">Featured Gallery</span>
              <h3 className="font-playfair text-lg md:text-xl font-medium mt-1">{mainLandscape.caption || "Active Turf View"}</h3>
            </div>
          </div>
        )}

        {/* Right: Two Stacked Portrait-ish Photos */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {rightPortrait1 && (
            <div className="flex-1 zoom-image-container relative aspect-[4/3] md:aspect-[1/1] border border-prime-lightBorder dark:border-prime-darkBorder">
              <img 
                src={rightPortrait1.url} 
                alt={rightPortrait1.caption || "Court View"} 
                className="w-full h-full object-cover zoom-image" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <h4 className="font-playfair text-sm md:text-base font-medium">{rightPortrait1.caption}</h4>
              </div>
            </div>
          )}

          {rightPortrait2 && (
            <div className="flex-1 zoom-image-container relative aspect-[4/3] md:aspect-[1/1] border border-prime-lightBorder dark:border-prime-darkBorder">
              <img 
                src={rightPortrait2.url} 
                alt={rightPortrait2.caption || "Court View"} 
                className="w-full h-full object-cover zoom-image" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <h4 className="font-playfair text-sm md:text-base font-medium">{rightPortrait2.caption}</h4>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom: Horizontal Scroll Strip */}
      {scrollStripPhotos.length > 0 && (
        <div className="mt-8">
          <p className="section-label mb-4">Additional Perspectives</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 custom-scrollbar">
            {scrollStripPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="flex-shrink-0 w-64 h-40 zoom-image-container relative border border-prime-lightBorder dark:border-prime-darkBorder"
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Court View"} 
                  className="w-full h-full object-cover zoom-image" 
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-3 text-white">
                  <p className="font-outfit text-xs font-medium truncate">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
