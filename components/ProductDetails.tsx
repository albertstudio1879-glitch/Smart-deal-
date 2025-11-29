
import React, { useState, TouchEvent, useEffect, useRef } from 'react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onInteraction: (id: string, type: 'like' | 'dislike', currentState: 'none' | 'liked' | 'disliked') => void;
  onBuy: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onInteraction, onBuy }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Like/Dislike State
  const [likeState, setLikeState] = useState<'none' | 'liked' | 'disliked'>('none');

  const images = product.images && product.images.length > 0 ? product.images : ['https://picsum.photos/400/400'];
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return;

    const startSlideTimer = () => {
        stopSlideTimer(); // Clear existing
        slideInterval.current = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000); // 3 seconds
    };

    const stopSlideTimer = () => {
        if (slideInterval.current) {
            clearInterval(slideInterval.current);
            slideInterval.current = null;
        }
    };

    // Start only if not touching
    if (touchStart === null) {
        startSlideTimer();
    } else {
        stopSlideTimer();
    }

    return () => stopSlideTimer();
  }, [images.length, touchStart]);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
  }

  const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  }

  const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setTouchStart(null);
        return;
      }
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;
      
      if (isLeftSwipe) nextImage();
      if (isRightSwipe) prevImage();
      
      setTouchStart(null);
  }

  const handleLike = () => {
    const newState = likeState === 'liked' ? 'none' : 'liked';
    setLikeState(newState);
    onInteraction(product.id, 'like', likeState);
  };

  const handleDislike = () => {
    const newState = likeState === 'disliked' ? 'none' : 'disliked';
    setLikeState(newState);
    onInteraction(product.id, 'dislike', likeState);
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.startsWith('₹') ? cleanPrice : `₹${cleanPrice}`;
  };

  const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: product.name,
            text: `Check out this ${product.name}! Code: ${product.code}`,
            url: product.affiliateLink,
          });
        } catch (error) {
          console.log('Error sharing', error);
        }
      } else {
        navigator.clipboard.writeText(`${product.name} - ${product.affiliateLink}`);
        alert('Link copied to clipboard!');
      }
    };

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-200 no-scrollbar">
      
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 truncate flex-1">{product.name}</h1>
      </div>

      <div className="max-w-3xl mx-auto pb-32">
        
        {/* Image Carousel */}
        <div 
          className="relative aspect-square bg-white border-b border-gray-100 overflow-hidden group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          
          {/* Dots only (Arrows removed) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 pointer-events-none">
              {images.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-brand-600 scale-125' : 'bg-gray-300'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Header Section */}
          <div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Interaction Buttons (Below Name) */}
              <div className="flex items-center gap-4 mt-2">
                {/* Like */}
                <button 
                  onClick={handleLike} 
                  className="flex items-center gap-1.5 py-1.5 px-3 -ml-3 hover:bg-red-50 rounded-full transition-colors group"
                >
                  <svg className="w-6 h-6" fill={likeState === 'liked' ? '#ef4444' : 'none'} stroke={likeState === 'liked' ? '#ef4444' : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className={`text-sm font-bold ${likeState === 'liked' ? 'text-red-500' : 'text-gray-500'}`}>
                    {formatCount(product.likes)}
                  </span>
                </button>

                {/* Dislike */}
                <button 
                  onClick={handleDislike} 
                  className="flex items-center gap-1.5 py-1.5 px-3 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <svg className="w-6 h-6" fill={likeState === 'disliked' ? '#4b5563' : 'none'} stroke={likeState === 'disliked' ? '#4b5563' : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  <span className={`text-sm font-bold ${likeState === 'disliked' ? 'text-gray-700' : 'text-gray-500'}`}>
                    {product.dislikes > 0 ? formatCount(product.dislikes) : 0}
                  </span>
                </button>

                {/* Share */}
                <button 
                  onClick={handleShare} 
                  className="flex items-center gap-1.5 py-1.5 px-3 hover:bg-blue-50 rounded-full transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Share</span>
                </button>
              </div>
              
              {/* Offer and Price */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price || '')}</span>
                {product.mrp && (
                  <span className="text-lg text-gray-500 line-through">{formatPrice(product.mrp)}</span>
                )}
                {product.offer && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    {product.offer}
                    </span>
                )}
              </div>
              
              {product.code && (
                <div className="text-xs text-gray-400 font-medium mt-1">
                   CODE: <span className="font-mono text-gray-600 select-all">{product.code}</span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights & Description Separate Cards */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Details
            </h3>
            
            <div className="space-y-6">
              
              {/* Highlights Card - with Animation */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="bg-gradient-to-br from-brand-50/50 to-white rounded-xl p-5 sm:p-6 border border-brand-100 shadow-sm overflow-hidden relative">
                   {/* Decorative background circle */}
                   <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-100/50 rounded-full blur-2xl pointer-events-none"></div>

                   <h4 className="text-sm font-bold text-brand-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span className="bg-brand-100 p-1 rounded text-brand-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </span>
                      Highlights
                   </h4>
                   <ul className="space-y-3">
                     {product.highlights.map((point, index) => (
                       <li 
                         key={index} 
                         className="flex items-start gap-3 text-sm text-gray-700 animate-fade-in-up opacity-0"
                         style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
                       >
                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-sm flex-shrink-0 ring-4 ring-brand-50/50"></div>
                         <span className="leading-relaxed font-medium">{point}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              )}

              {/* Description Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm relative group hover:border-gray-200 transition-colors">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    Description
                 </h4>
                 <div className="prose prose-sm prose-blue text-gray-600 leading-relaxed whitespace-pre-line">
                   {product.description}
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-pb">
        <div className="max-w-3xl mx-auto flex gap-4">
           <button 
             onClick={onBuy}
             className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-3.5 px-6 rounded-xl shadow-md text-center transition-all active:scale-95 animate-pulse hover:animate-none flex items-center justify-center gap-2"
           >
             <span>Buy on {platformName}</span>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
           </button>
        </div>
      </div>

    </div>
  );
};
