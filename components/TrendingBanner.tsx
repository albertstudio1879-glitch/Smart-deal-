
import React, { useState, useEffect, TouchEvent } from 'react';
import { Product } from '../types';
import { ChevronRight } from 'lucide-react';

interface TrendingBannerProps {
  products: Product[];
  onProductClick: (id: string) => void;
}

export const TrendingBanner: React.FC<TrendingBannerProps> = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Get top 5 most liked products
  // Memoization isn't strictly necessary here as standard render cycles handle updates fast enough
  const topProducts = [...products]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  // 5 Attractive Gradients
  const bgGradients = [
    'from-orange-500 to-amber-500',   // 1
    'from-violet-600 to-fuchsia-600', // 2
    'from-cyan-500 to-blue-600',      // 3
    'from-emerald-500 to-teal-500',   // 4
    'from-rose-500 to-red-600'        // 5
  ];

  useEffect(() => {
    if (topProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topProducts.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [topProducts.length]);

  const handleManualSlide = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setCurrentIndex(index);
  };

  // Swipe Logic
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
        setCurrentIndex((prev) => (prev + 1) % topProducts.length);
    }
    if (isRightSwipe) {
        setCurrentIndex((prev) => (prev - 1 + topProducts.length) % topProducts.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.startsWith('₹') ? cleanPrice : `₹${cleanPrice}`;
  };

  if (topProducts.length === 0) return null;

  const currentProduct = topProducts[currentIndex];
  const displayImage = currentProduct.images[0] || 'https://picsum.photos/400/400';
  const currentGradient = bgGradients[currentIndex % bgGradients.length];

  // Specific Display Logic 1-5
  const renderOfferLabel = (product: Product, index: number) => {
     const cyclePosition = (index % 5) + 1; // 1 to 5
     
     // Common styles - adjusted padding and font size for compactness
     const badgeBase = "shadow-md backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1 flex items-center justify-center gap-1 transform transition-all duration-500";
     
     // 1st: Offer %
     if (cyclePosition === 1) {
         return product.offer ? (
            <div className={`${badgeBase} bg-white/20 text-white`}>
                <span className="text-base sm:text-2xl font-black">{product.offer}</span>
            </div>
         ) : null;
     }

     // 2nd: Offer Price
     if (cyclePosition === 2) {
         return product.price ? (
            <div className={`${badgeBase} bg-yellow-400 text-black rotate-[-2deg]`}>
                 <span className="text-[10px] sm:text-xs font-bold uppercase mr-1">Deal</span>
                 <span className="text-base sm:text-2xl font-black">{formatPrice(product.price)}</span>
            </div>
         ) : null;
     }

     // 3rd: Image showing Offer % AND Price
     if (cyclePosition === 3) {
         return (
            <div className="flex flex-col gap-1 items-start">
                {product.offer && (
                    <div className="bg-red-600 text-white px-2 py-0.5 rounded font-bold text-xs sm:text-lg shadow-sm">
                        {product.offer}
                    </div>
                )}
                {product.price && (
                    <div className="bg-white text-gray-900 px-2 py-0.5 rounded font-black text-base sm:text-2xl shadow-sm border border-red-600">
                        {formatPrice(product.price)}
                    </div>
                )}
            </div>
         );
     }

     // 4th: Offer %
     if (cyclePosition === 4) {
        return product.offer ? (
            <div className={`${badgeBase} bg-black/30 text-white`}>
                <span className="text-[10px] sm:text-xs font-medium uppercase mr-1">Flat</span>
                <span className="text-base sm:text-2xl font-black">{product.offer}</span>
            </div>
         ) : null;
     }

     // 5th: Offer Price
     if (cyclePosition === 5) {
        return product.price ? (
            <div className={`${badgeBase} bg-white text-brand-600 border-white`}>
                 <span className="text-[10px] sm:text-xs font-bold uppercase mr-1">Only</span>
                 <span className="text-base sm:text-2xl font-black">{formatPrice(product.price)}</span>
            </div>
         ) : null;
     }

     return null;
  };

  return (
    <div className="mb-4 px-2">
      <div 
        onClick={() => onProductClick(currentProduct.id)}
        className={`relative w-full h-[200px] sm:h-[260px] bg-gradient-to-r ${currentGradient} rounded-2xl overflow-hidden shadow-md group transition-colors duration-700 cursor-pointer select-none ring-2 ring-white/20`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* Main Content Area */}
        <div className="flex h-full relative z-10">
          
          {/* Left: Text Content - Matches BestOfferBanner layout logic */}
          <div className="w-[60%] sm:w-[55%] pl-4 sm:pl-8 flex flex-col justify-center h-full relative z-20">
            <div className="bg-black/20 backdrop-blur-sm inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-bold mb-2 self-start border border-white/10 uppercase tracking-wider">
              #{currentIndex + 1} Trending
            </div>
            
            <h2 className="text-base sm:text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2 mb-2 pr-1">
              {currentProduct.name}
            </h2>

            {/* Dynamic Label Area */}
            <div className="mb-2 scale-[0.9] origin-left sm:scale-100">
                {renderOfferLabel(currentProduct, currentIndex)}
            </div>
          </div>

          {/* Right: Floating Product Image - Adjusted to match BestOfferBanner proportions */}
          <div className="w-[40%] sm:w-[45%] h-full relative flex items-center justify-center pr-2">
             <div className="absolute w-28 h-28 sm:w-48 sm:h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
             
             {/* Image Container with Curve */}
             <div className="relative transform transition-transform duration-700 ease-out hover:scale-105 hover:-rotate-1">
                 <img 
                   src={displayImage} 
                   alt={currentProduct.name}
                   className="h-36 sm:h-52 w-auto object-contain rounded-2xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] bg-white/5 backdrop-blur-sm border border-white/10 p-1"
                 />
             </div>
          </div>
        </div>

        {/* Bottom Area: Controls (Dots + Check Deal Button) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-30">
           
           {/* Check Deal Button */}
           <button 
             className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-[10px] sm:text-xs shadow-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-1 group/btn"
           >
              Check Deal 
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover/btn:text-gray-900 transition-colors" />
           </button>

           {/* Indicators */}
           <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
             {topProducts.map((_, idx) => (
               <button 
                 key={idx} 
                 onClick={(e) => handleManualSlide(e, idx)}
                 className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-5 sm:w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                 aria-label={`Go to slide ${idx + 1}`}
               />
             ))}
           </div>

        </div>

      </div>
    </div>
  );
};
