
export type Category = 
  | 'Trending'
  | 'Recently Uploaded'
  | 'Kitchen'
  | 'Electronics'
  | 'Beauty'
  | 'Fashion'
  | 'Mobile'
  | 'Others';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  highlights?: string[]; // Bullet points
  images: string[];
  affiliateLink: string;
  platform?: string; // e.g. "Amazon", "Flipkart"
  categories: Category[];
  price?: string; 
  mrp?: string; // Maximum Retail Price for strikethrough
  offer?: string; // e.g. "50% OFF"
  likes: number;    // Replaces rating
  dislikes: number; // Replaces rating
  timestamp: number;
}

export const CATEGORIES: Category[] = [
  'Trending',
  'Recently Uploaded',
  'Kitchen',
  'Electronics',
  'Beauty',
  'Fashion',
  'Mobile',
  'Others'
];
