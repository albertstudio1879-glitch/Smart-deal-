import React from 'react';

// A lightweight custom renderer to avoid heavy dependencies for simple formatting
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const sections = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-800 leading-relaxed">
      {sections.map((line, index) => {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-indigo-900 mt-8 mb-4 border-b border-indigo-100 pb-2">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-semibold text-slate-900 mt-6 mb-3">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('**Day')) {
             return <h3 key={index} className="text-xl font-bold text-indigo-700 mt-6 mb-2 bg-indigo-50 inline-block px-3 py-1 rounded-lg">{trimmed.replace(/\*\*/g, '')}</h3>;
        }

        // List items
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const text = trimmed.substring(2);
          // Simple bold formatting detection
          const parts = text.split(/(\*\*.*?\*\*)/);
          return (
            <div key={index} className="flex gap-3 ml-2 mb-2">
                <span className="mt-2 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                <p>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </p>
            </div>
          );
        }

        // Empty lines
        if (!trimmed) return <div key={index} className="h-2" />;

        // Regular paragraphs
        return <p key={index} className="mb-2">{trimmed}</p>;
      })}
    </div>
  );
};