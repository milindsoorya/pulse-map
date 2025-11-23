'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, TrendingUp, MapPin, Filter, X, Zap } from 'lucide-react';
import Toast from './ui/Toast';

export default function PulseOverlay() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showTrending, setShowTrending] = useState(false);
    const [trendingPulses, setTrendingPulses] = useState<any[]>([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(false);
    const [showNearby, setShowNearby] = useState(false);
    const [nearbyPulses, setNearbyPulses] = useState<any[]>([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // --- Data Fetching Logic ---
    useEffect(() => {
        if (!showTrending) return;
        const fetchData = async () => {
            setIsLoadingTrending(true);
            try {
                const res = await fetch('/api/pulse/trending');
                const data = await res.json();
                setTrendingPulses(data.trending || []);
            } catch (e) { console.error(e); } finally { setIsLoadingTrending(false); }
        };
        fetchData();
    }, [showTrending]);

    // --- Nearby Data Fetching ---
    useEffect(() => {
        if (!showNearby) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            setIsLoadingNearby(true);
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`/api/pulse/nearby?latitude=${latitude}&longitude=${longitude}&radius=1000`);
                const data = await res.json();
                setNearbyPulses(data.nearby || []);
            } catch (e) { console.error(e); } finally { setIsLoadingNearby(false); }
        }, () => {
            setToast({ message: 'Location required for Nearby', type: 'error' });
            setShowNearby(false);
        });
    }, [showNearby]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    const results = data.results || [];
                    const topicOption = { id: 'new-topic', title: searchQuery, type: 'TOPIC', isTopic: true };
                    setSearchResults([topicOption, ...results]);
                } catch (e) { console.error(e); } finally { setIsSearching(false); }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePulse = async () => {
        const item = selectedItem || { title: searchQuery, type: 'TOPIC' };
        if (!item.title) return;
        setIsPulsing(true);
        try {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;

                const newPulse = {
                    id: `temp-${Date.now()}`,
                    title: item.title,
                    type: item.isTopic ? 'TOPIC' : 'MOVIE',
                    latitude,
                    longitude
                };

                // Dispatch event for Map3D to pick up instantly
                window.dispatchEvent(new CustomEvent('pulse-added', { detail: newPulse }));

                await fetch('/api/pulse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        objectId: item.id === 'new-topic' ? undefined : item.id,
                        objectType: item.isTopic ? 'TOPIC' : 'MOVIE',
                        title: item.title,
                        latitude,
                        longitude,
                        reactionType: 'HEART'
                    })
                });
                setToast({ message: 'Pulse sent to the world!', type: 'success' });
                setSelectedItem(null);
                setSearchQuery('');
                setSearchResults([]);
            }, () => alert('Location required to pulse.'));
        } catch (e) { console.error(e); } finally { setIsPulsing(false); }
    };

    return (
        <div className="w-full h-full pointer-events-none flex flex-col justify-between p-4 md:p-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header (Title Only) - Changed to pointer-events-none to avoid blocking map */}
            <div className="w-full flex flex-col items-center gap-4 pointer-events-none z-50 pt-8">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 drop-shadow-2xl select-none">
                    PULSE
                </h1>
            </div>

            {/* Bottom Action Area (Unified) */}
            <div className="w-full flex justify-center items-end pb-8 z-50 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto bg-black/40 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">

                    {/* Current Location Button */}
                    <button
                        onClick={() => {
                            navigator.geolocation.getCurrentPosition((pos) => {
                                window.dispatchEvent(new CustomEvent('fly-to-location', {
                                    detail: { lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 14 }
                                }));
                            });
                        }}
                        className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                        title="Go to my location"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>

                    {/* Search Bar */}
                    <div className="relative group w-64 md:w-80 transition-all focus-within:w-80 md:focus-within:w-96">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            {isSearching ? <Loader2 className="w-4 h-4 text-white/50 animate-spin" /> : <Search className="w-4 h-4 text-white/50" />}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What's moving you?"
                            className="w-full bg-transparent text-white rounded-full py-3 pl-10 pr-4 focus:outline-none placeholder:text-white/30"
                        />

                        {/* Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute bottom-full mb-4 left-0 w-full glass-panel rounded-2xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-bottom-2">
                                {searchResults.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => { setSelectedItem(item); setSearchResults([]); setSearchQuery(item.title); }}
                                        className="flex items-center gap-4 p-4 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                    >
                                        {item.poster_path ? (
                                            <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-10 h-14 rounded object-cover shadow-md" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><span className="text-lg">#</span></div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{item.title}</p>
                                            <p className="text-white/40 text-xs">{item.isTopic ? 'Topic' : 'Movie'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1"></div>

                    {/* Trending Toggle */}
                    <button
                        onClick={() => { setShowTrending(!showTrending); setShowNearby(false); }}
                        className={`p-3 rounded-full hover:bg-white/10 transition-colors ${showTrending ? 'text-pink-500 bg-white/10' : 'text-white/70 hover:text-white'}`}
                        title="Trending"
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>

                    {/* Nearby Toggle */}
                    <button
                        onClick={() => { setShowNearby(!showNearby); setShowTrending(false); }}
                        className={`p-3 rounded-full hover:bg-white/10 transition-colors ${showNearby ? 'text-blue-400 bg-white/10' : 'text-white/70 hover:text-white'}`}
                        title="Nearby"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>

                    {/* Pulse Button (Only shows when ready) */}
                    {(selectedItem || searchQuery) && (
                        <button
                            onClick={handlePulse}
                            disabled={isPulsing}
                            className="ml-2 bg-white text-black px-6 py-3 rounded-full font-bold tracking-wide hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {isPulsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-black" />}
                            <span>PULSE</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Trending Drawer (Right) */}
            <div className={`fixed right-0 top-0 bottom-0 w-80 glass-panel border-l border-white/10 transform transition-transform duration-500 ease-out z-40 p-6 pt-24 overflow-y-auto pointer-events-auto ${showTrending ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-pink-500" /> Trending</h2>
                    <button onClick={() => setShowTrending(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-white/50" /></button>
                </div>

                {isLoadingTrending ? (
                    <div className="flex justify-center"><Loader2 className="w-8 h-8 text-white/20 animate-spin" /></div>
                ) : (
                    <div className="space-y-3">
                        {trendingPulses.map((p, i) => (
                            <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                                onClick={() => {
                                    if (p.latitude && p.longitude) {
                                        window.dispatchEvent(new CustomEvent('fly-to-location', {
                                            detail: { lat: p.latitude, lng: p.longitude, zoom: 10 }
                                        }));
                                        setToast({ message: `Flying to ${p.title}`, type: 'info' });
                                    } else {
                                        setToast({ message: `📍 ${p.title} - ${p.pulse_count} pulses (No location)`, type: 'info' });
                                    }
                                }}
                            >
                                <span className="text-2xl font-black text-white/10 group-hover:text-white/30 transition-colors">{i + 1}</span>
                                <div>
                                    <p className="text-white font-medium">{p.title}</p>
                                    <p className="text-white/40 text-xs">{p.pulse_count} pulses</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Nearby Drawer (Right - Same position as Trending) */}
            <div className={`fixed right-0 top-0 bottom-0 w-80 glass-panel border-l border-white/10 transform transition-transform duration-500 ease-out z-40 p-6 pt-24 overflow-y-auto pointer-events-auto ${showNearby ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" /> Nearby</h2>
                    <button onClick={() => setShowNearby(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-white/50" /></button>
                </div>

                {isLoadingNearby ? (
                    <div className="flex justify-center"><Loader2 className="w-8 h-8 text-white/20 animate-spin" /></div>
                ) : nearbyPulses.length === 0 ? (
                    <div className="text-white/40 text-center">No pulses nearby. Be the first!</div>
                ) : (
                    <div className="space-y-3">
                        {nearbyPulses.map((p, i) => (
                            <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('fly-to-location', {
                                        detail: { lat: p.latitude, lng: p.longitude, zoom: 14 }
                                    }));
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                    {Math.round(p.distance)}m
                                </div>
                                <div>
                                    <p className="text-white font-medium">{p.title}</p>
                                    <p className="text-white/40 text-xs">{p.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
