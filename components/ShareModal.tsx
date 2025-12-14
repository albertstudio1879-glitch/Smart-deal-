
import React, { useRef, useState } from 'react';
import { Product } from '../types';
import { X, Copy, MessageCircle, Facebook, Globe, Link, Download, Share2, Check } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

interface ShareModalProps {
  product: Product;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Explicit URL requested by user
  const WEBSITE_URL = 'https://smartdeal-online-com.vercel.app/';
  // Deep link with code for direct access
  const shareUrl = `${WEBSITE_URL}?code=${product.code}`;
  
  const shareText = `Check out ${product.name} on Smart Deal Online!`;

  const handleDownload = async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsDownloading(true);
    try {
        // Increase pixel ratio for better quality on mobile
        const dataUrl = await toPng(cardRef.current, { 
            cacheBust: true, 
            pixelRatio: 3, 
            backgroundColor: '#ffffff' 
        });
        const link = document.createElement('a');
        link.download = `SmartDeal-${product.code}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to download image', err);
        alert('Could not download image.');
    } finally {
        setIsDownloading(false);
    }
  };

  const handleSystemShare = async () => {
      if (navigator.share) {
          try {
              // Share the deep link
              await navigator.share({
                  title: 'Smart Deal Online',
                  text: shareText,
                  url: shareUrl
              });
          } catch (err) {
              console.log('Error sharing:', err);
          }
      } else {
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          alert("Link copied to clipboard!");
      }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareToWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const formatPrice = (price?: string) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.startsWith('₹') ? cleanPrice : `₹${cleanPrice}`;
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        onClick={onClose}
    >
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #share-card-container, #share-card-container * {
            visibility: visible;
          }
          #share-card-container {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 350px;
            margin: 0;
            padding: 24px;
            box-shadow: none;
            border: 1px solid #ddd;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div 
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header / Close */}
        <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Share Product</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950/50 flex items-center justify-center">
            
            {/* The Compact Printable Card */}
            <div 
                id="share-card-container" 
                ref={cardRef}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center w-full max-w-[320px]"
            >
                
                {/* Branding */}
                <h2 className="text-[18px] font-bold text-[#0ea5e9] tracking-tight mb-1">SMART DEAL ONLINE</h2>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 mb-3">
                    <Globe className="w-3 h-3" />
                    <span>smartdeal-online-com.vercel.app</span>
                </div>
                
                <div className="border-t border-dashed border-gray-200 w-full mb-4"></div>

                {/* Product Image */}
                <div className="h-48 w-full bg-white rounded-lg flex items-center justify-center mb-4 p-2">
                    <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain" 
                        crossOrigin="anonymous"
                    />
                </div>

                {/* Product Name */}
                <h1 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-4 px-1">
                    {product.name}
                </h1>

                {/* Code Box */}
                <div className="flex justify-center mb-4">
                    <button 
                        onClick={handleCopyCode}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg flex items-center gap-2 border border-gray-200 transition-colors"
                        title="Click to copy code"
                    >
                        <span className="text-[11px] text-gray-500">Code :</span>
                        <span className="text-[11px] font-mono font-bold text-gray-900">{product.code}</span>
                        {copiedCode ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </button>
                </div>

                {/* Price Row */}
                <div className="flex items-center justify-center gap-2.5 mb-6">
                    <span className="text-2xl font-black text-gray-900">{formatPrice(product.price)}</span>
                    {product.mrp && <span className="text-sm text-gray-400 line-through font-medium">{formatPrice(product.mrp)}</span>}
                    {product.offer && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">
                            {product.offer}
                        </span>
                    )}
                </div>

                {/* Footer Section */}
                <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">WEBSITE</p>
                        <a 
                          href={shareUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-[10px] text-blue-600 font-bold truncate underline decoration-blue-300 underline-offset-2 mb-1 hover:text-blue-800"
                        >
                            {shareUrl.replace('https://', '')}
                        </a>
                        <p className="text-[9px] text-gray-400 leading-tight">
                            Scan to find this product instantly on our app.
                        </p>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
                         <QRCode 
                            value={shareUrl} 
                            size={56}
                            style={{ height: "auto", maxWidth: "100%", width: "56px" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>
            </div>

        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 space-y-2 z-10">
            <div className="grid grid-cols-4 gap-2">
                <button onClick={shareToWhatsapp} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[9px] font-medium">WhatsApp</span>
                </button>
                <button onClick={shareToFacebook} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                    <Facebook className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Facebook</span>
                </button>
                <button onClick={handleSystemShare} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Share</span>
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors">
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Download className="w-5 h-5" />
                    )}
                    <span className="text-[9px] font-medium">Download</span>
                </button>
            </div>
            
            <a 
                href={product.affiliateLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-center py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
            >
                <span>Buy Now</span>
                <Link className="w-3.5 h-3.5" />
            </a>
        </div>
      </div>
    </div>
  );
};
