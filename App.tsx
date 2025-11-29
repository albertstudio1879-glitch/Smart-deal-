
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetails } from './components/ProductDetails';
import { AdminPanel } from './components/AdminPanel';
import { RedirectionOverlay } from './components/RedirectionOverlay';
import { Product, Category } from './types';
import { getProducts, saveProduct, deleteProduct, updateProductInteraction } from './services/storageService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const [redirectProduct, setRedirectProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
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

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.code.toLowerCase().includes(query)
      );
    } else {
      if (activeCategory === 'Trending') {
        const taggedTrending = filtered.filter(p => p.categories && p.categories.includes('Trending'));
        if (taggedTrending.length > 0) {
          filtered = taggedTrending;
        } else {
          filtered = filtered.slice(0, 10);
        }
      } else if (activeCategory === 'Recently Uploaded') {
        filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
      } else {
        filtered = filtered.filter(p => p.categories && p.categories.includes(activeCategory));
      }
    }
    return filtered;
  }, [products, activeCategory, searchQuery]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleBuy = (product: Product) => {
    setRedirectProduct(product);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading Store...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {redirectProduct && (
        <RedirectionOverlay 
          product={redirectProduct} 
          onClose={() => setRedirectProduct(null)} 
        />
      )}

      {selectedProduct ? (
        <ProductDetails 
          product={selectedProduct} 
          onBack={() => setSelectedProductId(null)} 
          onInteraction={handleInteraction}
          onBuy={() => handleBuy(selectedProduct)}
        />
      ) : (
        <>
          <Header 
            activeCategory={activeCategory} 
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setSearchQuery('');
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-bold text-gray-800">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory}
              </h2>
              <span className="text-xs text-gray-500">
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => setSelectedProductId(product.id)}
                    onInteraction={handleInteraction}
                    onBuy={() => handleBuy(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or category.</p>
              </div>
            )}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-12 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Smart Deal Affiliate Store. All rights reserved.
              </p>
              <div className="flex justify-center items-center gap-4 mt-2">
                <p className="text-gray-400 text-xs">
                  Disclaimer: We earn a commission for products purchased through some links in this site.
                </p>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                  title="Admin Login"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </button>
              </div>
            </div>
          </footer>
        </>
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