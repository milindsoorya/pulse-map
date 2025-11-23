'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function Map3D() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const REACTION_ICONS: { [key: string]: string } = {
        HEART: '❤️',
        FIRE: '🔥',
        SAD: '😭',
        FUNNY: '🤣',
        ANGRY: '😡',
    };

    // --- Pulse Rendering Logic ---
    const getTimeAgo = (timestamp: number) => {
        if (!timestamp) return 'Just now';
        const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const addPulseMarker = (pulse: any) => {
        if (!map.current || markersRef.current[pulse.id]) return;

        if (!pulse.latitude || !pulse.longitude || (pulse.latitude === 0 && pulse.longitude === 0)) {
            return;
        }

        // CSS Fix: Wrap in container to separate Mapbox positioning from animation
        const container = document.createElement('div');
        container.className = 'pulse-container';

        const inner = document.createElement('div');
        inner.className = 'pulse-inner';
        inner.style.width = '24px';
        inner.style.height = '24px';
        inner.style.backgroundColor = pulse.type === 'MOVIE' ? '#ec4899' : '#3b82f6'; // Pink-500 or Blue-500
        inner.style.borderRadius = '50%';
        inner.style.boxShadow = `0 0 20px ${pulse.type === 'MOVIE' ? '#ec4899' : '#3b82f6'}`;
        inner.style.opacity = '0.9';
        inner.style.animation = 'pulse-animation 2s infinite';
        inner.style.cursor = 'pointer';
        inner.style.border = '2px solid rgba(255,255,255,0.8)';

        container.appendChild(inner);

        const timeAgo = getTimeAgo(pulse.created_at);
        const reactionIcon = REACTION_ICONS[pulse.reactionType || pulse.reaction_type] || '❤️';

        // Create popup (Modern Glass Card)
        const popup = new mapboxgl.Popup({
            offset: 35,
            closeButton: false,
            className: 'modern-popup',
            maxWidth: '300px'
        })
            .setHTML(`
                <div class="popup-card">
                    <div class="popup-header">
                        <div class="popup-icon">${reactionIcon}</div>
                        <div class="popup-meta">
                            <span class="popup-type ${pulse.type === 'MOVIE' ? 'type-movie' : 'type-topic'}">${pulse.type}</span>
                            <span class="popup-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="popup-content">
                        <h3 class="popup-title">${pulse.title}</h3>
                        ${pulse.comment ? `<p class="popup-comment">"${pulse.comment}"</p>` : ''}
                    </div>
                    <div class="popup-footer">
                        <button class="popup-btn">
                            <span>View Details</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            `);

        const marker = new mapboxgl.Marker({
            element: container,
            anchor: 'center'
        })
            .setLngLat([pulse.longitude, pulse.latitude])
            .setPopup(popup)
            .addTo(map.current);

        // Add event listener to popup content for "Click for details"
        const markerPopup = marker.getPopup();
        if (markerPopup) {
            markerPopup.on('open', () => {
                const element = markerPopup?.getElement();
                if (!element) return;

                const btn = element.querySelector('.popup-btn') as HTMLElement;
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('open-pulse-detail', { detail: pulse }));
                    });
                }

                // Also allow clicking the whole card
                const card = element.querySelector('.popup-card') as HTMLElement;
                if (card) {
                    card.addEventListener('click', (e) => {
                        // If they clicked the button, don't double fire (though stopPropagation above handles it)
                        if ((e.target as HTMLElement).closest('.popup-btn')) return;
                        window.dispatchEvent(new CustomEvent('open-pulse-detail', { detail: pulse }));
                    });
                    card.style.cursor = 'pointer';
                }
            });
        }

        markersRef.current[pulse.id] = marker;
    };

    const fetchPulses = async () => {
        if (!map.current) return;
        try {
            const res = await fetch('/api/pulse');
            const data = await res.json();
            console.log('Fetched pulses:', data.pulses?.length);
            if (data.pulses) {
                data.pulses.forEach(addPulseMarker);
            }
        } catch (err) {
            console.error('Error fetching pulses:', err);
        }
    };

    useEffect(() => {
        if (!MAPBOX_TOKEN) {
            setError('Mapbox token missing');
            setIsLoading(false);
            return;
        }

        if (map.current) return;

        try {
            mapboxgl.accessToken = MAPBOX_TOKEN;

            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/dark-v11',
                projection: 'mercator',
                center: [0, 20],
                zoom: 1.8,
                attributionControl: false,
                logoPosition: 'bottom-right',
                interactive: true,
                dragPan: true,
                scrollZoom: true,
                boxZoom: true,
                dragRotate: true,
                keyboard: true,
                doubleClickZoom: true,
                touchZoomRotate: true,
            });

            map.current.on('load', () => {
                console.log('✅ Map loaded');
                setIsLoading(false);
                map.current?.resize();
                fetchPulses(); // Initial fetch
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
                setError('Map failed to load');
                setIsLoading(false);
            });

        } catch (err) {
            console.error('Init error:', err);
            setError('Initialization failed');
            setIsLoading(false);
        }

        // --- Event Listeners ---
        const handleResize = () => map.current?.resize();

        const handlePulseAdded = (e: any) => {
            const pulse = e.detail;
            if (pulse && map.current) {
                addPulseMarker(pulse);
                map.current.flyTo({
                    center: [pulse.longitude, pulse.latitude],
                    zoom: 4,
                    speed: 1.5
                });
            }
        };

        const handleFlyTo = (e: any) => {
            const { latitude, longitude, zoom = 4 } = e.detail;
            if (map.current && latitude !== undefined && longitude !== undefined) {
                map.current.flyTo({
                    center: [longitude, latitude],
                    zoom: zoom,
                    speed: 1.5,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('pulse-added', handlePulseAdded);
        window.addEventListener('fly-to-location', handleFlyTo);

        // Polling
        const interval = setInterval(fetchPulses, 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('pulse-added', handlePulseAdded);
            window.removeEventListener('fly-to-location', handleFlyTo);
            clearInterval(interval);
            map.current?.remove();
            map.current = null;
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full bg-black">
            {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm text-red-400">
                    <p className="font-mono text-sm">{error}</p>
                </div>
            )}

            {isLoading && !error && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black transition-opacity duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-white/40 text-xs tracking-widest uppercase">Initializing Satellite Link</p>
                    </div>
                </div>
            )}

            {/* Force load Mapbox CSS v3 to match package version */}
            <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css" rel="stylesheet" />

            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full outline-none"
            />

            <style jsx global>{`
                @keyframes pulse-animation {
                    0% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                    70% { transform: scale(1.1); opacity: 0.7; box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0); }
                    100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }

                /* Modern Popup Styles */
                .modern-popup .mapboxgl-popup-content {
                    background: rgba(10, 10, 10, 0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 16px;
                    padding: 0;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    overflow: hidden;
                    color: white;
                }
                
                .modern-popup .mapboxgl-popup-tip {
                    border-top-color: rgba(10, 10, 10, 0.85);
                }

                .popup-card {
                    padding: 16px;
                    min-width: 220px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                }

                .popup-icon {
                    font-size: 24px;
                    line-height: 1;
                    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
                }

                .popup-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 2px;
                }

                .popup-type {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 2px 6px;
                    border-radius: 99px;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .type-movie { background: rgba(236, 72, 153, 0.2); color: #fbcfe8; border-color: rgba(236, 72, 153, 0.4); }
                .type-topic { background: rgba(59, 130, 246, 0.2); color: #bfdbfe; border-color: rgba(59, 130, 246, 0.4); }

                .popup-time {
                    font-size: 10px;
                    color: rgba(255,255,255,0.5);
                    font-weight: 500;
                }

                .popup-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .popup-title {
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.3;
                    color: #fff;
                    margin: 0;
                }

                .popup-comment {
                    font-size: 12px;
                    line-height: 1.5;
                    color: rgba(255,255,255,0.7);
                    font-style: italic;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    padding-left: 8px;
                    border-left: 2px solid rgba(255,255,255,0.2);
                }

                .popup-footer {
                    margin-top: 4px;
                }

                .popup-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 8px;
                    padding: 8px;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .popup-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-1px);
                }

                .pulse-marker {
                    pointer-events: auto;
                }
            `}</style>
        </div>
    );
}