
import { Product } from '../types';

const STORAGE_KEY = 'smart_deal_products';
const API_URL_KEY = 'smart_deal_api_url';

// 1. Priority: User manually entered URL in Admin Panel (LocalStorage)
// 2. Priority: Vercel Environment Variable (Public Deployment)
const getEffectiveApiUrl = (): string => {
  const localUrl = localStorage.getItem(API_URL_KEY);
  if (localUrl) return localUrl;
  
  // This comes from Vercel settings
  return (import.meta as any).env.VITE_GOOGLE_SHEET_URL || '';
};

export const getApiUrl = (): string | null => {
  return localStorage.getItem(API_URL_KEY);
};

export const setApiUrl = (url: string) => {
  if (url) {
    localStorage.setItem(API_URL_KEY, url);
  } else {
    localStorage.removeItem(API_URL_KEY);
  }
};

export const getProducts = async (): Promise<Product[]> => {
  const apiUrl = getEffectiveApiUrl();
  
  // 1. Google Sheet Mode (Cloud)
  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}?action=read`);
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((p: any) => {
          // Explicitly strip video field if it exists in raw data to match new type
          const { video, ...rest } = p;
          return rest;
        }).sort((a: any, b: any) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (e) {
      console.error("API Fetch Error:", e);
      // Fallback to local storage if network fails
    }
  }

  // 2. Local Storage Mode (Fallback)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const products = JSON.parse(stored);
    return Array.isArray(products) ? products.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch (e) {
    console.error("Failed to load products from local storage", e);
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<Product[]> => {
  const apiUrl = getEffectiveApiUrl();

  // 1. Google Sheet Mode
  if (apiUrl) {
    try {
      // Check if it's an update or new
      const current = await getProducts();
      const exists = current.find(p => p.id === product.id);
      const action = exists ? 'update' : 'create';

      // We need to send 'video' as empty string to maintain column order in Google Sheet
      const productForSheet = { ...product, video: '' };

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, product: productForSheet }),
      });
      
      // Wait a moment for sheet to update then re-fetch
      await new Promise(r => setTimeout(r, 1000));
      return await getProducts();
    } catch (e) {
      alert("Failed to save to Cloud Database. Please check internet.");
      return await getProducts();
    }
  }

  // 2. Local Storage Mode
  try {
    const currentProducts = await getProducts();
    const existingIndex = currentProducts.findIndex(p => p.id === product.id);
    
    let updatedProducts;
    if (existingIndex >= 0) {
      updatedProducts = [...currentProducts];
      updatedProducts[existingIndex] = product;
    } else {
      updatedProducts = [product, ...currentProducts];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    return updatedProducts.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Failed to save product", e);
    alert("Failed to save. Storage might be full. Try deleting old items or using smaller images.");
    return await getProducts();
  }
};

export const deleteProduct = async (productId: string): Promise<Product[]> => {
  const apiUrl = getEffectiveApiUrl();

  // 1. Google Sheet Mode
  if (apiUrl) {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', id: productId }),
      });
      await new Promise(r => setTimeout(r, 1000));
      return await getProducts();
    } catch (e) {
      alert("Failed to delete from Cloud.");
      return await getProducts();
    }
  }

  // 2. Local Storage Mode
  try {
    const currentProducts = await getProducts();
    const updatedProducts = currentProducts.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  } catch (e) {
    console.error("Failed to delete product", e);
    return await getProducts();
  }
};

export const updateProductInteraction = async (id: string, updates: { likes?: number, dislikes?: number }) => {
  const apiUrl = getEffectiveApiUrl();

  // 1. Google Sheet Mode
  if (apiUrl) {
    // For cloud, we need the full product to update the row.
    // This is expensive, so we do it optimistically in UI, but in background here.
    try {
        const current = await getProducts();
        const product = current.find(p => p.id === id);
        if (product) {
            if (updates.likes !== undefined) product.likes = updates.likes;
            if (updates.dislikes !== undefined) product.dislikes = updates.dislikes;
            
            // Send video as empty string for sheet compatibility
            const productForSheet = { ...product, video: '' };

            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'update', product: productForSheet }),
            });
        }
    } catch (e) {
        console.error("Failed to update interactions in cloud", e);
    }
    return;
  }

  // 2. Local Storage Mode
  try {
    const currentProducts = await getProducts();
    const productIndex = currentProducts.findIndex(p => p.id === id);
    if (productIndex === -1) return;
    
    const product = currentProducts[productIndex];
    if (updates.likes !== undefined) product.likes = updates.likes;
    if (updates.dislikes !== undefined) product.dislikes = updates.dislikes;
    
    currentProducts[productIndex] = product;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProducts));
  } catch (e) {
    console.error("Failed to update interaction", e);
  }
};