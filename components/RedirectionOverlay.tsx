
import React, { useEffect, useState } from 'react';
import { Product } from '../types';

interface RedirectionOverlayProps {
  product: Product;
  onClose: () => void;
}

export const RedirectionOverlay: React.FC<RedirectionOverlayProps> = ({ product, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  const getPlatformName = (prod: Product) => {
    if (prod.platform) return prod.platform;

    const lower = prod.affiliateLink.toLowerCase();
    if (lower.includes('amazon')) return 'Amazon';
    if (lower.includes('flipkart')) return 'Flipkart';
    if (lower.includes('myntra')) return 'Myntra';
    if (lower.includes('ajio')) return 'Ajio';
    if (lower.includes('meesho')) return 'Meesho';
    return 'Partner Store';
  };

  const platformName = getPlatformName(product);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    // Redirect trigger
    const timeout = setTimeout(() => {
      window.open(product.affiliateLink, '_blank');
      onClose();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [product, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-sky-100 to-indigo-200 flex flex-col items-center justify-center p-6 text-center overflow-hidden animate-in fade-in duration-300">
      
      <div className="mb-8 z-10">
         <p className="text-xl text-indigo-900 font-semibold tracking-tight">
           You are going to <span className="text-brand-600 font-extrabold">{platformName}</span>
         </p>
         <p className="text-sm text-indigo-600/70 mt-1">to buy this item</p>
      </div>

      {/* Matchstick Man Animation */}
      <div className="relative w-full max-w-md h-40 border-b-4 border-gray-700/50 bg-white/30 backdrop-blur-sm shadow-xl overflow-hidden rounded-t-2xl">
         
         {/* Scrolling Road Stripes */}
         <div className="absolute bottom-0 w-[200%] h-full flex items-end animate-road opacity-60">
             <div className="w-full flex justify-around pb-2">
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
             </div>
         </div>
         
         {/* Stick Man Running - Centered */}
         <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 animate-bounce-run">
            <svg className="w-16 h-24 overflow-visible" viewBox="0 0 50 100">
               {/* Head */}
               <circle cx="25" cy="15" r="8" stroke="black" strokeWidth="3" fill="white" />
               {/* Body */}
               <line x1="25" y1="23" x2="25" y2="60" stroke="black" strokeWidth="3" />
               {/* Arms */}
               <line x1="25" y1="30" x2="5" y2="50" stroke="black" strokeWidth="3" className="animate-limb origin-top-center" />
               <line x1="25" y1="30" x2="45" y2="50" stroke="black" strokeWidth="3" className="animate-limb-opp origin-top-center" />
               {/* Legs */}
               <line x1="25" y1="60" x2="5" y2="95" stroke="black" strokeWidth="3" className="animate-limb-opp origin-top-center" />
               <line x1="25" y1="60" x2="45" y2="95" stroke="black" strokeWidth="3" className="animate-limb origin-top-center" />
            </svg>
         </div>
      </div>
      
      <div className="mt-8 bg-white/60 backdrop-blur px-4 py-2 rounded-full shadow-sm text-indigo-900 font-medium z-10">
         Opening in <span className="text-brand-600 font-bold text-xl w-6 inline-block text-center">{countdown}</span> s
      </div>
    </div>
  );
};
