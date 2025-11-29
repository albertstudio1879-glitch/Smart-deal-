
import React, { useState } from 'react';
import { Category, CATEGORIES } from '../types';

interface HeaderProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Row: Brand, Search */}
        <div className="flex flex-col md:flex-row md:items-center py-3 md:py-4 gap-3 md:gap-8">
          
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex-shrink-0 cursor-pointer group" onClick={() => onCategoryChange('Trending')}>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 animate-in fade-in">
                Smart Deal
              </span>
            </div>
          </div>

          {/* Search Area */}
          <div className="flex-1 relative group z-20">
            <div className="relative w-full transition-all duration-300 transform">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-500 shadow-sm hover:bg-white hover:shadow-md focus:shadow-lg sm:text-sm"
                  placeholder="Product name or product code"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
          </div>

        </div>

        {/* Bottom Row: Menu Tabs (Categories) */}
        <div className="flex overflow-x-auto no-scrollbar pb-1 md:pb-0 border-t border-gray-100 md:border-none pt-2 md:pt-0">
           <div className="flex space-x-6 md:space-x-8 min-w-full px-1 md:px-0">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`
                  whitespace-nowrap pb-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 border-b-2
                  ${activeCategory === category
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                `}
              >
                {category}
              </button>
            ))}
           </div>
        </div>

      </div>
    </header>
  );
};
