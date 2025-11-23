'use client';

import React, { useState, useEffect } from 'react';
import { Search, Heart, Globe, Menu, Loader2, TrendingUp, MapPin } from 'lucide-react';

export default function PulseOverlay() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showTrending, setShowTrending] = useState(false);
    const [trendingPulses, setTrendingPulses] = useState<any[]>([]);
    const [nearbyPulses, setNearbyPulses] = useState<any[]>([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get user location on mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (err) => {
                console.error('Error getting location:', err);
            }
        );
    }, []);

    // Fetch trending and nearby data when slider opens
    useEffect(() => {
        if (!showTrending) return;

        const fetchData = async () => {
            setIsLoadingTrending(true);
            try {
                // Fetch trending
                const trendingRes = await fetch('/api/pulse/trending');
                const trendingData = await trendingRes.json();
                setTrendingPulses(trendingData.trending || []);

                // Fetch nearby if we have user location
                if (userLocation) {
                    const nearbyRes = await fetch(
                        `/api/pulse/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=50`
                    );
                    const nearbyData = await nearbyRes.json();
                    setNearbyPulses(nearbyData.nearby || []);
                }
            } catch (err) {
                console.error('Error fetching trending/nearby:', err);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        fetchData();
    }, [showTrending, userLocation]);

    // Debounced search (TMDB + Topic suggestion)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    // 1. Search TMDB
                    const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();

                    // 2. Add "Create Topic" option
                    const results = data.results || [];

                    // Always add the topic option at the top
                    const topicOption = {
                        id: 'new-topic',
                        title: searchQuery,
                        type: 'TOPIC',
                        isTopic: true
                    };

                    setSearchResults([topicOption, ...results]);
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
    }, [searchQuery]);

    const handlePulse = async () => {
        const itemToPulse = selectedItem || { title: searchQuery, type: 'TOPIC' };

        if (!itemToPulse.title) return;

        setIsPulsing(true);
        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                await fetch('/api/pulse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        objectId: itemToPulse.id === 'new-topic' ? undefined : itemToPulse.id,
                        objectType: itemToPulse.isTopic ? 'TOPIC' : 'MOVIE',
                        title: itemToPulse.title,
                        latitude,
                        longitude,
                        reactionType: 'HEART'
                    })
                });

                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                setSelectedItem(null);
                setSearchQuery('');
                setSearchResults([]);
                setIsPulsing(false);
            }, (err) => {
                console.error(err);
                alert('Could not get location');
                setIsPulsing(false);
            });
        } catch (err) {
            console.error(err);
            setIsPulsing(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-between p-6 pointer-events-none">
            {/* Success Message */}
            {showSuccess && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg pointer-events-auto z-50 animate-pulse">
                    ✓ Pulse created successfully!
                </div>
            )}

            {/* Top Bar */}
            <div className="flex justify-between items-start w-full pointer-events-auto relative">
                {/* Brand */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tighter text-white drop-shadow-lg">
                        PULSE
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative group flex flex-col items-center z-50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 text-white/50 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                            )}
                        </div>
                        <input
                            type="text"
                            className="bg-black/40 backdrop-blur-xl border border-white/10 text-white text-sm rounded-full block w-80 pl-10 p-3 focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:outline-none transition-all placeholder-white/30 shadow-lg"
                            placeholder="Pulse a movie, topic, or idea..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-14 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            {searchResults.map((item, idx) => (
                                <div
                                    key={item.id === 'new-topic' ? `topic-${idx}` : item.id}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${item.isTopic ? 'bg-white/5 hover:bg-white/10 border-b border-white/5' : 'hover:bg-white/10'}`}
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setSearchResults([]);
                                        setSearchQuery(item.title);
                                    }}
                                >
                                    {item.isTopic ? (
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="text-white font-bold">#</span>
                                        </div>
                                    ) : item.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                            alt={item.title}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                    ) : null}

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-medium truncate">
                                            {item.isTopic ? `Pulse Topic: "${item.title}"` : item.title}
                                        </h4>
                                        {!item.isTopic && (
                                            <p className="text-white/50 text-xs truncate">{item.release_date?.split('-')[0]}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowTrending(!showTrending)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${showTrending ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Trending Sidebar (Right) */}
            <div className={`absolute right-0 top-20 bottom-20 w-64 bg-black/80 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 pointer-events-auto overflow-y-auto ${showTrending ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-pink-500" /> Global Trending
                    </h3>
                    {isLoadingTrending ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                        </div>
                    ) : trendingPulses.length > 0 ? (
                        <div className="space-y-4">
                            {trendingPulses.map((item, i) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="text-white/30 font-mono text-sm">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium truncate">
                                            {item.title}
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            {item.pulse_count} pulse{item.pulse_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-white/40 text-sm">No trending pulses yet</div>
                    )}

                    <h3 className="text-white font-bold mt-8 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" /> Near You
                    </h3>
                    {isLoadingTrending ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                        </div>
                    ) : nearbyPulses.length > 0 ? (
                        <div className="space-y-4">
                            {nearbyPulses.map((item, i) => (
                                <div key={`${item.id}-${i}`} className="flex items-center gap-3">
                                    <div className="text-white/30 font-mono text-sm">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium truncate">
                                            {item.title}
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            {Math.round(item.distance)} km • {item.pulse_count} pulse{item.pulse_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !userLocation ? (
                        <div className="text-white/40 text-sm">Location unavailable</div>
                    ) : (
                        <div className="text-white/40 text-sm">No nearby pulses</div>
                    )}
                </div>
            </div>

            {/* Bottom / Pulse Button (Floating) */}
            <div className="flex justify-center pb-8 pointer-events-auto">
                {(selectedItem || searchQuery.length > 0) && (
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
                            PULSE {selectedItem ? selectedItem.title.toUpperCase() : searchQuery.toUpperCase()}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
