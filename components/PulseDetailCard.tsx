'use client';

import { X, Share2, ExternalLink, MapPin, Clock, Twitter, Copy, Zap } from 'lucide-react';
import { useState } from 'react';

interface PulseDetailCardProps {
    pulse: any;
    onClose: () => void;
}

const REACTION_ICONS: { [key: string]: string } = {
    HEART: '❤️',
    FIRE: '🔥',
    SAD: '😭',
    FUNNY: '🤣',
    ANGRY: '😡',
};

export default function PulseDetailCard({ pulse, onClose }: PulseDetailCardProps) {
    const [copied, setCopied] = useState(false);

    if (!pulse) return null;

    const reactionIcon = REACTION_ICONS[pulse.reaction_type] || '❤️';
    const timeAgo = new Date(pulse.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out "${pulse.title}" on Pulse Map! 🌍 ${reactionIcon}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Background Glow */}
                <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${pulse.type === 'MOVIE' ? 'from-pink-500/20' : 'from-blue-500/20'} to-transparent pointer-events-none`} />

                {/* Header Image / Gradient */}
                <div className="h-32 relative flex items-center justify-center">
                    <div className="text-7xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] filter hover:scale-110 transition-transform cursor-default select-none animate-bounce-slow">
                        {reactionIcon}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-md border border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-6 relative z-10">

                    {/* Title & Type */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full border ${pulse.type === 'MOVIE' ? 'border-pink-500/30 text-pink-300 bg-pink-500/10' : 'border-blue-500/30 text-blue-300 bg-blue-500/10'}`}>
                                {pulse.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 uppercase tracking-wide">
                                <Clock size={10} /> {timeAgo}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">{pulse.title}</h2>
                        {pulse.latitude && (
                            <div className="flex items-center justify-center gap-1 text-zinc-600 text-[10px] font-mono mt-2">
                                <MapPin size={10} />
                                <span>{pulse.latitude.toFixed(4)}, {pulse.longitude.toFixed(4)}</span>
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    {pulse.comment && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 relative group hover:bg-white/10 transition-colors">
                            <div className="absolute -top-3 -left-2 text-5xl text-white/5 font-serif select-none">“</div>
                            <p className="text-zinc-300 text-sm leading-relaxed relative z-10 italic text-center font-medium">
                                "{pulse.comment}"
                            </p>
                        </div>
                    )}

                    {/* Link */}
                    {pulse.link && (
                        <a
                            href={pulse.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all group"
                        >
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <ExternalLink size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-blue-300 font-bold truncate group-hover:text-blue-200 transition-colors">{pulse.link}</p>
                                <p className="text-[10px] text-blue-400/50 uppercase tracking-wider">External Link</p>
                            </div>
                        </a>
                    )}

                    {/* Share Actions */}
                    <div className="pt-4 border-t border-white/5 flex gap-3">
                        <button
                            onClick={handleTwitterShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#000] hover:bg-zinc-900 border border-zinc-800 text-white py-3 rounded-xl transition-all font-medium text-sm hover:border-zinc-700"
                        >
                            <Twitter size={16} className="text-[#1d9bf0]" />
                            Share
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl transition-colors font-bold text-sm"
                        >
                            {copied ? <span className="text-green-600 flex items-center gap-1"><Zap size={14} /> Copied!</span> : <><Copy size={16} /> Copy Link</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
