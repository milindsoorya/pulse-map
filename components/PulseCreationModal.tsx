'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Send } from 'lucide-react';

interface PulseCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { reactionType: string; comment: string; link: string }) => void;
    title: string;
}

const REACTIONS = [
    { id: 'HEART', icon: '❤️', label: 'Love' },
    { id: 'FIRE', icon: '🔥', label: 'Fire' },
    { id: 'SAD', icon: '😭', label: 'Sad' },
    { id: 'FUNNY', icon: '🤣', label: 'Funny' },
    { id: 'ANGRY', icon: '😡', label: 'Angry' },
];

export default function PulseCreationModal({ isOpen, onClose, onSubmit, title }: PulseCreationModalProps) {
    const [reaction, setReaction] = useState('HEART');
    const [comment, setComment] = useState('');
    const [link, setLink] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ reactionType: reaction, comment, link });
        // Reset form
        setReaction('HEART');
        setComment('');
        setLink('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h3 className="text-lg font-medium text-white truncate pr-4">
                        Pulse <span className="text-primary-400">"{title}"</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-6">

                    {/* Reaction Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Reaction</label>
                        <div className="flex justify-between gap-2">
                            {REACTIONS.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setReaction(r.id)}
                                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${reaction === r.id
                                            ? 'bg-primary-500/20 border-primary-500/50 scale-105'
                                            : 'bg-zinc-800/50 border-transparent hover:bg-zinc-800 hover:scale-105'
                                        } border`}
                                >
                                    <span className="text-2xl mb-1">{r.icon}</span>
                                    <span className={`text-[10px] font-medium ${reaction === r.id ? 'text-primary-300' : 'text-zinc-500'}`}>
                                        {r.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Comment</label>
                            <span className={`text-xs ${comment.length > 200 ? 'text-amber-500' : 'text-zinc-600'}`}>
                                {comment.length}/250
                            </span>
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={250}
                            placeholder="What's on your mind? (Optional)"
                            className="w-full h-24 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                        />
                    </div>

                    {/* Link Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Link (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon size={16} className="text-zinc-600" />
                            </div>
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-primary-900/20"
                    >
                        <Send size={18} />
                        <span>Send Pulse</span>
                    </button>

                </form>
            </div>
        </div>
    );
}
