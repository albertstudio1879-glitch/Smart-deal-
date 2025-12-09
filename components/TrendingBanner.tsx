
import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface TrendingBannerProps {
  products: Product[];
  onProductClick: (id: string) => void;
}

export const TrendingBanner: React.FC<TrendingBannerProps> = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get top 5 most liked products
  const topProducts = [...products]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  useEffect(() => {
    if (topProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topProducts.length);
    }, 4000); // Rotate every 4 seconds
    return () => clearInterval(interval);
  }, [topProducts.length]);

  if (topProducts.length === 0) return null;

  const currentProduct = topProducts[currentIndex];
  const displayImage = currentProduct.images[0] || 'https://picsum.photos/400/400';

  return (
    <div className="mb-6 px-2">
      <div 
        onClick={() => onProductClick(currentProduct.id)}
        className="relative w-full h-48 sm:h-56 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="flex h-full items-center relative z-10">
          
          {/* Text Content */}
          <div className="w-1/2 pl-6 sm:pl-10 flex flex-col justify-center">
            <div className="bg-white/20 backdrop-blur-sm inline-block px-3 py-1 rounded-lg text-white text-xs font-bold mb-2 self-start border border-white/20">
              #{currentIndex + 1} Trending
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight drop-shadow-sm line-clamp-2 mb-2">
              {currentProduct.name}
            </h2>
             <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm bg-black/20 px-2 py-0.5 rounded">
                  {currentProduct.offer || 'Best Seller'}
                </span>
             </div>
             <button className="mt-4 bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm self-start shadow-md hover:bg-orange-50 transition-colors">
                Check Deal >
             </button>
          </div>

          {/* Floating Product Image */}
          <div className="w-1/2 h-full relative flex items-center justify-center">
             <div className="absolute w-40 h-40 sm:w-56 sm:h-56 bg-white/20 rounded-full blur-2xl"></div>
             <img 
               src={displayImage} 
               alt={currentProduct.name}
               className="h-32 sm:h-44 object-contain drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110 -rotate-6 group-hover:rotate-0"
             />
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-6 sm:left-10 flex gap-1.5">
           {topProducts.map((_, idx) => (
             <div 
               key={idx} 
               className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
             ></div>
           ))}
        </div>

      </div>
    </div>
  );
};
