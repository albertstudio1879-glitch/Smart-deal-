
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onInteraction: (id: string, type: 'like' | 'dislike', currentState: 'none' | 'liked' | 'disliked') => void;
  onBuy: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onInteraction, onBuy }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [likeState, setLikeState] = useState<'none' | 'liked' | 'disliked'>('none');

  // Always use the first image
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : 'https://picsum.photos/400/400';

  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.startsWith('₹') ? cleanPrice : `₹${cleanPrice}`;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = likeState === 'liked' ? 'none' : 'liked';
    setLikeState(newState);
    onInteraction(product.id, 'like', likeState);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = likeState === 'disliked' ? 'none' : 'disliked';
    setLikeState(newState);
    onInteraction(product.id, 'dislike', likeState);
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

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy(product);
  };

  return (
    <div 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden relative select-none cursor-pointer"
    >
      
      {/* Static Image */}
      <div className="relative aspect-square block bg-white overflow-hidden p-2">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
          draggable="false"
        />
      </div>

      {/* Details & Interaction */}
      <div className="p-2.5 flex flex-col flex-grow">
        
        {/* Name */}
        <div className="mb-2">
            <h3 className="text-gray-900 font-medium text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.5em]" title={product.name}>
            {product.name}
            </h3>
        </div>

        {/* Horizontal Interaction Row (Below Name) */}
        <div className="flex items-center gap-3 mb-2" onClick={(e) => e.stopPropagation()}>
            {/* Like */}
            <button 
                onClick={handleLike}
                className="flex items-center gap-1 group/btn p-1 -ml-1 hover:bg-red-50 rounded-full transition-all"
            >
                <svg className="w-4 h-4" fill={likeState === 'liked' ? '#ef4444' : 'none'} stroke={likeState === 'liked' ? '#ef4444' : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span className={`text-[10px] font-bold leading-none ${likeState === 'liked' ? 'text-red-500' : 'text-gray-400'}`}>
                    {formatCount(product.likes)}
                </span>
            </button>

            {/* Dislike */}
            <button 
                onClick={handleDislike}
                className="p-1 hover:bg-gray-100 rounded-full transition-transform active:scale-90"
            >
                <svg className="w-4 h-4" fill={likeState === 'disliked' ? '#4b5563' : 'none'} stroke={likeState === 'disliked' ? '#4b5563' : '#9ca3af'} strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
            </button>

            {/* Share */}
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
                className="p-1 hover:bg-blue-50 rounded-full transition-transform active:scale-90"
            >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>
        </div>
        
        <div className="mt-auto pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
                {product.price && (
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                )}
                 {product.mrp && (
                    <span className="text-[10px] text-gray-400 line-through decoration-gray-400">{formatPrice(product.mrp)}</span>
                )}
                {product.offer && (
                    <span className="text-[10px] font-bold text-green-600">
                        {product.offer}
                    </span>
                )}
            </div>
            
            {product.price && (
                <button 
                onClick={handleBuyClick}
                className="block mt-2 text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors active:scale-95 shadow-sm animate-pulse hover:animate-none"
                >
                Buy Only
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
