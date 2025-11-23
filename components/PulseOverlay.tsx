'use client';

import React, { useState, useEffect } from 'react';
import { Search, Heart, Globe, Menu, Loader2, Hash, Film } from 'lucide-react';

type Category = 'MOVIES' | 'TOPICS';

export default function PulseOverlay() {
    const [category, setCategory] = useState<Category>('MOVIES');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPulsing, setIsPulsing] = useState(false);

    // Debounced search (only for Movies)
    useEffect(() => {
        if (category === 'TOPICS') {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSearchResults(data.results || []);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, category]);

    const handlePulse = async () => {
        // For topics, the search query IS the item if nothing selected
        const itemToPulse = category === 'TOPICS'
            ? { title: searchQuery, type: 'TOPIC' }
            : selectedItem;

        if (!itemToPulse && category === 'MOVIES') return;
        if (!searchQuery && category === 'TOPICS') return;

        setIsPulsing(true);
        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                await fetch('/api/pulse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        objectId: itemToPulse.id, // Might be undefined for new topics
                        objectType: category === 'MOVIES' ? 'MOVIE' : 'TOPIC',
                        title: itemToPulse.title || searchQuery,
                        latitude,
                        longitude,
                        reactionType: 'HEART'
                    })
                });

                alert('Pulsed!');
                setSelectedItem(null);
                setSearchQuery('');
            }, (err) => {
                console.error(err);
                alert('Could not get location');
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsPulsing(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-between p-6 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full pointer-events-auto relative">
                {/* Brand / Category Switcher */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tighter text-white drop-shadow-lg">
                        PULSE
                    </h1>
                    <div className="flex bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-1">
                        <button
                            onClick={() => { setCategory('MOVIES'); setSearchQuery(''); setSelectedItem(null); }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${category === 'MOVIES' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            MOVIES
                        </button>
                        <button
                            onClick={() => { setCategory('TOPICS'); setSearchQuery(''); setSelectedItem(null); }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${category === 'TOPICS' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                            TOPICS
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 text-white/50 animate-spin" />
                            ) : category === 'MOVIES' ? (
                                <Search className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                            ) : (
                                <Hash className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                            )}
                        </div>
                        <input
                            type="text"
                            className="bg-black/40 backdrop-blur-xl border border-white/10 text-white text-sm rounded-full block w-64 pl-10 p-2.5 focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:outline-none transition-all placeholder-white/30"
                            placeholder={category === 'MOVIES' ? "Search for a movie..." : "Type a topic (e.g. AI, Elections)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Search Results Dropdown (Movies only) */}
                    {category === 'MOVIES' && searchResults.length > 0 && (
                        <div className="absolute top-12 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                            {searchResults.map((movie) => (
                                <div
                                    key={movie.id}
                                    className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedItem(movie);
                                        setSearchResults([]);
                                        setSearchQuery(movie.title);
                                    }}
                                >
                                    {movie.poster_path && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-medium truncate">{movie.title}</h4>
                                        <p className="text-white/50 text-xs truncate">{movie.release_date?.split('-')[0]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                        <Globe className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Bottom / Pulse Button (Floating) */}
            <div className="flex justify-center pb-8 pointer-events-auto">
                {(selectedItem || (category === 'TOPICS' && searchQuery.length > 0)) && (
                    <button
                        onClick={handlePulse}
                        disabled={isPulsing}
                        className="group relative flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPulsing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Heart className="w-5 h-5 fill-black text-black group-hover:scale-110 transition-transform" />
                        )}
                        <span>
                            PULSE {category === 'MOVIES' ? selectedItem?.title.toUpperCase() : searchQuery.toUpperCase()}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
