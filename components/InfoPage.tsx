
import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface InfoPageProps {
  title: string;
  content: string;
  onBack: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ title, content, onBack }) => {
  // Split content by double newlines to create paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-4 flex items-center gap-4 shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors group"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">Support Area</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 sm:py-16">
        <div className="space-y-10">
            {/* Animated Title */}
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700 leading-tight">
                {title}
            </h1>
            
            {/* Animated Paragraphs */}
            <div className="space-y-8">
                {paragraphs.map((para, idx) => (
                    <div 
                        key={idx} 
                        className="opacity-0 animate-fade-in-up"
                        style={{ animationDelay: `${idx * 150 + 300}ms`, animationFillMode: 'forwards' }}
                    >
                        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                            {para}
                        </p>
                    </div>
                ))}
            </div>

            {/* Footer decoration */}
            <div className="mt-16 pt-10 border-t border-gray-100 dark:border-slate-800 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-600 italic text-center font-medium">
                    Smart Deal Online — Making shopping smarter.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
