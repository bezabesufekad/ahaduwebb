import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  // Filter out invalid images
  const validImages = Array.isArray(images) ? 
    images.filter(img => img && typeof img === 'string' && img.trim() !== '') : 
    [];
  
  // Default to placeholder if no valid images
  const defaultImage = validImages.length > 0 ? 
    validImages[0] : 
    'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
  
  const [currentImage, setCurrentImage] = useState<string>(defaultImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showZoomGuide, setShowZoomGuide] = useState(true);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right
  
  // Update current image when images array changes
  useEffect(() => {
    if (validImages.length > 0 && validImages.includes(currentImage) === false) {
      setCurrentImage(validImages[0]);
    }
  }, [validImages, currentImage]);
  
  // Hide zoom guide after some time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowZoomGuide(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePosition({ x, y });
  };
  
  // Handle image change animation
  const handleImageChange = (image: string) => {
    if (!image || image === currentImage) return;
    
    // Disable zooming when changing images
    setIsZoomed(false);
    
    // Determine slide direction based on index
    const currentIndex = validImages.indexOf(currentImage);
    const newIndex = validImages.indexOf(image);
    
    // Only set direction if both images are found
    if (currentIndex !== -1 && newIndex !== -1) {
      setSlideDirection(newIndex > currentIndex ? 1 : -1);
    } else {
      // Default direction if we can't determine
      setSlideDirection(1);
    }
    
    // Update the current image
    setCurrentImage(image);
    console.log('Changed to image:', image);
  };
  
  // Function to navigate to next/previous image
  const navigateImage = (direction: number) => {
    // Guard against empty arrays
    if (validImages.length === 0) return;
    
    const currentIndex = validImages.indexOf(currentImage);
    let newIndex = currentIndex + direction;
    
    // Loop back to beginning or end
    if (newIndex < 0) newIndex = validImages.length - 1;
    if (newIndex >= validImages.length) newIndex = 0;
    
    setSlideDirection(direction);
    setCurrentImage(validImages[newIndex]);
  };
  
  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div 
        className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square cursor-zoom-in shadow-md hover:shadow-lg transition-shadow group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2">
          <button 
            onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
            className="bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1.5 shadow-md text-gray-700 hover:text-primary transition-all hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
            className="bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1.5 shadow-md text-gray-700 hover:text-primary transition-all hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Main Image */}
        <div className="w-full h-full relative transition-opacity duration-300">
          <img 
            src={currentImage || 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg'} 
            alt={productName} 
            className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-[1.5]' : 'scale-100 group-hover:scale-105'}`}
            style={isZoomed ? {
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            } : undefined}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
            }}
          />
        </div>
        
        {/* Zoom indicator */}
        {(showZoomGuide || isZoomed) && (
          <div 
            className="absolute top-3 right-3 bg-white bg-opacity-80 p-2 rounded-full shadow-sm flex items-center gap-2 backdrop-blur-sm border border-gray-100 transition-all duration-300 hover:scale-105"
          >
            <span className="text-xs font-medium text-gray-600 hidden md:inline">Click to zoom</span>
            <div className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Overlay effect when zoomed */}
        {isZoomed && (
          <div className="absolute inset-0 bg-black bg-opacity-5 transition-opacity duration-200" />
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-6 gap-2">
        {validImages.map((image, index) => {
          const isSelected = currentImage === image;
          return (
          <button
            key={index} 
            className={`bg-gray-100 rounded-md aspect-square cursor-pointer overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95
              ${isSelected 
                ? 'ring-2 ring-primary shadow-md' 
                : 'hover:ring-2 hover:ring-primary/50'}`}
            onClick={() => handleImageChange(image)}
          >
            <div className="relative w-full h-full overflow-hidden rounded-md transition-shadow duration-300 hover:shadow-md">
              <img 
                src={image} 
                alt={`${productName} thumbnail ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://static.databutton.com/public/8294408d-bca3-4e9d-9785-1c2e25aa4e78/placeholder.jpg';
                }}
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary bg-opacity-10 transition-opacity duration-200">
                  {/* Simplified indicator */}
                  <div className="absolute bottom-1 inset-x-0 flex justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-sm"></span>
                  </div>
                </div>
              )}
            </div>
          </button>
          );
        })}
      </div>
    </div>
  );
}