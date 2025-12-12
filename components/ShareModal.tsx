
import React, { useRef, useState } from 'react';
import { Product } from '../types';
import { X, Printer, Copy, MessageCircle, Facebook, Globe, Link, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

interface ShareModalProps {
  product: Product;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const websiteUrl = 'https://smart-deal-ebon.vercel.app/';
  const productLink = product.affiliateLink;
  const shareText = `Check out ${product.name} on Smart Deal Online! Code: ${product.code}`;
  
  // Construct QR Data with all details
  const qrData = `Name: ${product.name}\nPrice: ${product.price}\nCode: ${product.code}\nLink: ${productLink}\nWebsite: ${websiteUrl}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsDownloading(true);
    try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, useCORS: true, backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.download = `SmartDeal-${product.code}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to download image', err);
        alert('Could not download image. Try printing instead.');
    } finally {
        setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\nLink: ${productLink}`);
    alert("Link and details copied to clipboard!");
  };

  const shareToWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productLink)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      
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
            padding: 16px;
            box-shadow: none;
            border: 1px solid #ddd;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          #close-button, #action-buttons {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header / Close */}
        <div id="close-button" className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
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
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center w-full max-w-[300px]"
            >
                
                {/* Branding */}
                <div className="border-b border-dashed border-gray-200 pb-2 mb-2">
                    <h2 className="text-lg font-black text-brand-600 tracking-tight uppercase leading-none">Smart Deal Online</h2>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-1">
                        <Globe className="w-3 h-3" />
                        <span>{websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                    </div>
                </div>

                {/* Product Image - Fixed height for mobile compactness */}
                <div className="h-40 w-full bg-white rounded-lg overflow-hidden border border-gray-100 p-1 mb-2 flex items-center justify-center">
                    <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain" 
                        crossOrigin="anonymous"
                    />
                </div>

                {/* Product Info */}
                <div className="mb-2">
                    <h1 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{product.name}</h1>
                    <div className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-mono border border-gray-200">
                        Code: {product.code}
                    </div>
                </div>

                {/* Price Row */}
                <div className="flex items-baseline justify-center gap-2 mb-3">
                    <span className="text-xl font-black text-gray-900">{product.price}</span>
                    {product.mrp && <span className="text-xs text-gray-400 line-through">{product.mrp}</span>}
                    {product.offer && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            {product.offer}
                        </span>
                    )}
                </div>

                {/* Footer: Split View (Links + QR) */}
                <div className="flex gap-2 items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100 text-left">
                     <div className="flex-1 min-w-0 space-y-1.5">
                        <div>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Product Link</p>
                            <p className="text-[9px] text-blue-600 truncate leading-none font-medium">{productLink}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Scan to Buy</p>
                            <p className="text-[8px] text-gray-400 leading-none">Use camera to scan QR</p>
                        </div>
                     </div>
                     <div className="bg-white p-1 rounded border border-gray-100 flex-shrink-0">
                        <QRCode 
                            value={qrData} 
                            size={64}
                            style={{ height: "auto", maxWidth: "100%", width: "64px" }}
                            viewBox={`0 0 256 256`}
                        />
                     </div>
                </div>
            </div>

        </div>

        {/* Action Buttons */}
        <div id="action-buttons" className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 space-y-2 z-10">
            <div className="grid grid-cols-4 gap-2">
                <button onClick={shareToWhatsapp} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[9px] font-medium">WhatsApp</span>
                </button>
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <Copy className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Copy</span>
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors">
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Download className="w-5 h-5" />
                    )}
                    <span className="text-[9px] font-medium">Download</span>
                </button>
                <button onClick={handlePrint} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-gray-900 transition-colors">
                    <Printer className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Print</span>
                </button>
            </div>
            
            <a 
                href={productLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-center py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
                <span>Open Product Link</span>
                <Link className="w-3.5 h-3.5" />
            </a>
        </div>
      </div>
    </div>
  );
};
