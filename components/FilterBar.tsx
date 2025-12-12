
import React, { useState } from 'react';
import { ChevronDown, Heart, Percent, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  sortBy: 'default' | 'discount' | 'likes';
  onSortChange: (sort: 'default' | 'discount' | 'likes') => void;
  activePriceRange: string | null;
  onPriceRangeChange: (range: string | null) => void;
  activeMinOffer: number | null;
  onMinOfferChange: (offer: number | null) => void;
  resultCount: number;
}

const PRICE_RANGES = [
  { label: '₹0 - ₹499', value: '0-499' },
  { label: '₹500 - ₹1000', value: '500-1000' },
  { label: '₹1000 - ₹2000', value: '1000-2000' },
  { label: '₹2000 - ₹5000', value: '2000-5000' },
  { label: '₹5000 - ₹10000', value: '5000-10000' },
  { label: '₹10000 - ₹20000', value: '10000-20000' },
  { label: '₹20000 - ₹40000', value: '20000-40000' },
  { label: '₹40000 - ₹80000', value: '40000-80000' },
  { label: '₹80000 - ₹100000', value: '80000-100000' },
  { label: 'Above ₹100000', value: '100000+' },
];

const OFFER_RANGES = [
  { label: '10% Off+', value: 10 },
  { label: '30% Off+', value: 30 },
  { label: '50% Off+', value: 50 },
  { label: '70% Off+', value: 70 },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  onSortChange,
  activePriceRange,
  onPriceRangeChange,
  activeMinOffer,
  onMinOfferChange,
  resultCount
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="mb-4">
      {/* Header Row: Filter Toggle + Result Count */}
      <div className="flex items-center justify-between px-2 mb-2">
         <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isFiltersOpen
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700'
            }`}
         >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
         </button>

         <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {resultCount} Items Found
         </span>
      </div>

      {/* Expandable Filter Options Area */}
      {isFiltersOpen && (
          <div className="animate-in slide-in-from-top-2 duration-200 fade-in">
              <div className="flex items-center gap-2 overflow-x-auto px-2 pb-2 no-scrollbar">
                  
                  {/* Sort: Most Liked - Full Name */}
                  <button
                    onClick={() => onSortChange(sortBy === 'likes' ? 'default' : 'likes')}
                    className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        sortBy === 'likes'
                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${sortBy === 'likes' ? 'fill-current' : ''}`} />
                    Most Liked
                  </button>

                  {/* Sort: Best Offer - Full Name */}
                  <button
                    onClick={() => onSortChange(sortBy === 'discount' ? 'default' : 'discount')}
                    className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        sortBy === 'discount'
                        ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Best Offer
                  </button>

                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-slate-700 mx-1 flex-shrink-0"></div>

                  {/* Price Filter - Reduced Size */}
                  <div className="relative flex-shrink-0">
                    <select
                        value={activePriceRange || ''}
                        onChange={(e) => onPriceRangeChange(e.target.value || null)}
                        className={`appearance-none pl-3 pr-6 py-1.5 rounded-full text-xs font-medium border focus:outline-none transition-colors cursor-pointer ${
                            activePriceRange 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300'
                        }`}
                    >
                        <option value="">Price</option>
                        {PRICE_RANGES.map((range) => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                    <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${activePriceRange ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>

                  {/* Offer Filter */}
                  <div className="relative flex-shrink-0">
                    <select
                        value={activeMinOffer || ''}
                        onChange={(e) => onMinOfferChange(e.target.value ? Number(e.target.value) : null)}
                        className={`appearance-none pl-3 pr-6 py-1.5 rounded-full text-xs font-medium border focus:outline-none transition-colors cursor-pointer ${
                            activeMinOffer 
                            ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300'
                        }`}
                    >
                        <option value="">Min Offer</option>
                        {OFFER_RANGES.map((range) => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                    <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${activeMinOffer ? 'text-orange-600' : 'text-gray-400'}`} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
