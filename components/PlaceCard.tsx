import React from 'react';
import { GroundingChunk } from '../services/gemini';
import { MapPin, Star, ExternalLink } from 'lucide-react';

export const PlaceCard: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
    if (!chunk.maps) return null;

    const { title, uri, placeAnswerSources } = chunk.maps;
    const review = placeAnswerSources?.reviewSnippets?.[0];

    return (
        <a 
            href={uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className="flex gap-2">
                    <div className="mt-1 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                            {title || 'Unknown Place'}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
            
            {review && (
                <div className="mt-3 bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                    <div className="flex items-center gap-1 mb-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-medium text-slate-700">Review</span>
                    </div>
                    <p className="line-clamp-2 italic">"{review.snippet}"</p>
                </div>
            )}
        </a>
    );
};