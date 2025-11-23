'use client';

import { X, Share2, ExternalLink, MapPin, Clock, Twitter, Copy } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
            <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 backdrop-blur-xl">

                {/* Header Image / Gradient */}
                <div className="h-32 bg-gradient-to-br from-primary-900/50 to-purple-900/50 relative">
                    <div className="absolute -bottom-8 left-8 text-6xl drop-shadow-2xl filter hover:scale-110 transition-transform cursor-default">
                        {reactionIcon}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="pt-12 pb-6 px-6 space-y-6">

                    {/* Title & Type */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold tracking-wider text-primary-400 uppercase bg-primary-500/10 px-2 py-0.5 rounded-full">
                                {pulse.type}
                            </span>
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <Clock size={12} /> {timeAgo}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight">{pulse.title}</h2>
                        {pulse.latitude && (
                            <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
                                <MapPin size={12} />
                                <span>{pulse.latitude.toFixed(4)}, {pulse.longitude.toFixed(4)}</span>
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    {pulse.comment && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative">
                            <div className="absolute -top-2 -left-1 text-4xl text-white/10 font-serif">“</div>
                            <p className="text-zinc-300 text-sm leading-relaxed relative z-10 italic">
                                {pulse.comment}
                            </p>
                        </div>
                    )}

                    {/* Link */}
                    {pulse.link && (
                        <a
                            href={pulse.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                        >
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <ExternalLink size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-blue-300 font-medium truncate">{pulse.link}</p>
                                <p className="text-[10px] text-blue-400/60">External Link</p>
                            </div>
                        </a>
                    )}

                    {/* Share Actions */}
                    <div className="pt-4 border-t border-white/10 flex gap-3">
                        <button
                            onClick={handleTwitterShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 border border-zinc-800 text-white py-3 rounded-xl transition-colors font-medium text-sm"
                        >
                            <Twitter size={16} className="text-blue-400" />
                            Share on X
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl transition-colors font-medium text-sm"
                        >
                            {copied ? <span className="text-green-600">Copied!</span> : <><Copy size={16} /> Copy Link</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
