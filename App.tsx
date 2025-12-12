
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { AdminPanel } from './components/AdminPanel';
import { TrendingBanner } from './components/TrendingBanner';
import { BestOfferBanner } from './components/BestOfferBanner';
import { Footer } from './components/Footer';
import { InfoPage } from './components/InfoPage';
import { FilterBar } from './components/FilterBar';
import { ShareModal } from './components/ShareModal';
import { Product, Category, Theme } from './types';
import { getProducts, saveProduct, deleteProduct, updateProductInteraction, getSiteSettings, SiteSettings } from './services/storageService';
import { Language, getTranslation } from './utils/translations';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  
  // Filtering & Sorting State
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  const [activeMinOffer, setActiveMinOffer] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'discount' | 'likes'>('default');

  // Info Page & Navigation State
  const [activeInfoPage, setActiveInfoPage] = useState<{title: string, content: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [returnToSidebar, setReturnToSidebar] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
        if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
    setSiteSettings(getSiteSettings());
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveProduct = async (newProduct: Product) => {
    // Optimistic update for UI speed, but real data comes from sheet refresh
    setProducts(prev => [newProduct, ...prev]);
    const updatedList = await saveProduct(newProduct);
    setProducts(updatedList);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const updatedList = await deleteProduct(id);
    setProducts(updatedList);
  }

  const handleInteraction = (productId: string, type: 'like' | 'dislike', currentLikeState: 'none' | 'liked' | 'disliked') => {
    setProducts(prevProducts => {
       return prevProducts.map(p => {
          if (p.id !== productId) return p;

          let newLikes = p.likes;
          let newDislikes = p.dislikes;
          
          if (type === 'like') {
             if (currentLikeState === 'liked') {
               newLikes--;
             } else {
               newLikes++;
               if (currentLikeState === 'disliked') newDislikes--;
             }
          } else { 
             if (currentLikeState === 'disliked') {
               newDislikes--;
             } else {
               newDislikes++;
               if (currentLikeState === 'liked') newLikes--;
             }
          }
          updateProductInteraction(productId, { likes: newLikes, dislikes: newDislikes });
          return { ...p, likes: newLikes, dislikes: newDislikes };
       });
    });
  };

  const cleanPrice = (val: string | undefined): number => {
      if (!val) return 0;
      return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
  };

  const getDiscount = (p: Product): number => {
       const mrp = cleanPrice(p.mrp);
       const price = cleanPrice(p.price);
       if (!mrp || !price || mrp <= price) return 0;
       return ((mrp - price) / mrp) * 100;
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.code.toLowerCase().includes(query)
      );
    } else {
      // 2. Category Filter
      if (activeCategory === 'All') {
        filtered = products;
      } else if (activeCategory === 'Offer Zone') {
         filtered = filtered
            .filter(p => getDiscount(p) > 55)
            .sort((a, b) => getDiscount(b) - getDiscount(a));
      } else if (activeCategory === 'Trending') {
        const taggedTrending = filtered.filter(p => p.categories && p.categories.includes('Trending'));
        filtered = taggedTrending.length > 0 ? taggedTrending : filtered.slice(0, 10);
      } else if (activeCategory === 'Recently Uploaded') {
        filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
      } else {
        filtered = filtered.filter(p => {
          const cats = p.categories || [];
          if (activeCategory === 'Mobile') {
             return cats.includes('Mobile') || (cats as string[]).includes('Mobiles');
          }
          if (activeCategory === 'Home & Appliances') {
             return cats.includes('Home & Appliances') || cats.includes('Home') || cats.includes('Appliances');
          }
          return cats.includes(activeCategory);
        });
      }
    }

    // 3. Price Range Filter
    if (activePriceRange) {
        filtered = filtered.filter(p => {
            const price = cleanPrice(p.price);
            if (activePriceRange === '100000+') return price >= 100000;
            
            const [min, max] = activePriceRange.split('-').map(Number);
            return price >= min && price <= max;
        });
    }

    // 4. Min Offer Filter
    if (activeMinOffer) {
        filtered = filtered.filter(p => getDiscount(p) >= activeMinOffer);
    }

    // 5. Sorting
    if (sortBy === 'likes') {
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'discount') {
        filtered = [...filtered].sort((a, b) => getDiscount(b) - getDiscount(a));
    }
    
    return filtered;
  }, [products, activeCategory, searchQuery, activePriceRange, activeMinOffer, sortBy]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleBuy = (product: Product) => {
    if (product.affiliateLink) {
        window.open(product.affiliateLink, '_blank');
    }
  };

  const t = (key: string) => getTranslation(currentLang, key);

  const handleOpenInfoPage = (pageKey: 'help' | 'about' | 'legal', fromSidebar: boolean = false) => {
      const title = getTranslation(currentLang, `${pageKey}Title`);
      const content = getTranslation(currentLang, `${pageKey}Content`);
      setActiveInfoPage({ title, content });
      setReturnToSidebar(fromSidebar);
      setIsSidebarOpen(false); 
  };

  const handleInfoPageBack = () => {
    setActiveInfoPage(null);
    if (returnToSidebar) setIsSidebarOpen(true);
    setReturnToSidebar(false);
  };

  const getCategoryTitle = () => {
    if (searchQuery) return `${t('resultsFor')} "${searchQuery}"`;
    if (activeCategory === 'All') return ''; 
    if (activeCategory === 'Offer Zone') return t('offerZone');
    
    const catKey = activeCategory.toLowerCase().replace(/ /g, '').replace('&', '').replace('acc', 'acc') as any;
    return t(catKey) !== catKey ? t(catKey) : activeCategory;
  };

  // Determine if we should show the Best Offer Banner interspersed in the grid
  const showBestOffersBanner = activeCategory === 'All' && !searchQuery && !activePriceRange && !activeMinOffer && sortBy === 'default';
  const productsBeforeBanner = showBestOffersBanner ? filteredProducts.slice(0, 4) : filteredProducts;
  const productsAfterBanner = showBestOffersBanner ? filteredProducts.slice(4) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center flex-col transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      
      {activeInfoPage ? (
          <InfoPage 
            title={activeInfoPage.title}
            content={activeInfoPage.content}
            onBack={handleInfoPageBack}
          />
      ) : selectedProduct ? (
        <ProductDetails 
          product={selectedProduct} 
          allProducts={products}
          onProductClick={setSelectedProductId}
          onBack={() => setSelectedProductId(null)} 
          onInteraction={handleInteraction}
          onBuy={() => handleBuy(selectedProduct)}
          onBuyItem={handleBuy}
          lang={currentLang}
          onShare={(p) => setSharingProduct(p)}
        />
      ) : (
        <>
          <Header 
            activeCategory={activeCategory} 
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setSearchQuery('');
              // Reset filters when changing categories
              setActivePriceRange(null);
              setActiveMinOffer(null);
              setSortBy('default');
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            products={products}
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
            siteSettings={siteSettings}
            onAdminClick={() => setIsAdminOpen(true)}
            currentTheme={theme}
            onThemeChange={setTheme}
            onOpenInfoPage={handleOpenInfoPage}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
            
            {/* Show Trending Banner only on Home (All) tab and when not searching */}
            {activeCategory === 'All' && !searchQuery && !activePriceRange && !activeMinOffer && sortBy === 'default' && (
              <TrendingBanner products={products} onProductClick={setSelectedProductId} />
            )}

            <div className="flex items-center justify-between mb-2 px-2">
              {getCategoryTitle() && (
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {getCategoryTitle()}
                </h2>
              )}
            </div>
            
            {/* Comprehensive Filter Bar */}
            <FilterBar 
              sortBy={sortBy}
              onSortChange={setSortBy}
              activePriceRange={activePriceRange}
              onPriceRangeChange={setActivePriceRange}
              activeMinOffer={activeMinOffer}
              onMinOfferChange={setActiveMinOffer}
              resultCount={filteredProducts.length}
            />

            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mt-2">
                  {productsBeforeBanner.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => setSelectedProductId(product.id)}
                      onInteraction={handleInteraction}
                      onBuy={() => handleBuy(product)}
                      lang={currentLang}
                      onShare={() => setSharingProduct(product)}
                    />
                  ))}
                </div>

                {/* Interstitial Best Offer Banner */}
                {showBestOffersBanner && (
                   <div className="mt-6">
                      <BestOfferBanner products={products} onProductClick={setSelectedProductId} />
                   </div>
                )}

                {productsAfterBanner.length > 0 && (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mt-2 sm:mt-4">
                      {productsAfterBanner.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onClick={() => setSelectedProductId(product.id)}
                          onInteraction={handleInteraction}
                          onBuy={() => handleBuy(product)}
                          lang={currentLang}
                          onShare={() => setSharingProduct(product)}
                        />
                      ))}
                   </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{t('noProducts')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{t('tryAdjusting')}</p>
              </div>
            )}
          </main>

          <Footer 
            settings={siteSettings} 
            onAdminClick={() => setIsAdminOpen(true)} 
            lang={currentLang} 
            onOpenInfoPage={handleOpenInfoPage}
          />
        </>
      )}

      {/* Sharing Modal */}
      {sharingProduct && (
        <ShareModal 
            product={sharingProduct} 
            onClose={() => setSharingProduct(null)} 
        />
      )}

      {isAdminOpen && (
        <AdminPanel 
          onClose={() => {
              setIsAdminOpen(false);
              loadData(); // Refresh on close in case settings changed
          }} 
          onAddProduct={handleSaveProduct}
          products={products}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
};

export default App;
