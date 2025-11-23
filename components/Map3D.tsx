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
    const addPulseMarker = (pulse: any) => {
        if (!map.current || markersRef.current[pulse.id]) return;

        // Debug logging
        console.log(`Adding pulse: ${pulse.title}`, {
            id: pulse.id,
            lat: pulse.latitude,
            lng: pulse.longitude,
            latType: typeof pulse.latitude,
            lngType: typeof pulse.longitude
        });

        if (!pulse.latitude || !pulse.longitude || (pulse.latitude === 0 && pulse.longitude === 0)) {
            console.warn('Invalid coordinates for pulse:', pulse);
            return;
        }

        // CSS Fix: Wrap in container to separate Mapbox positioning from animation
        const container = document.createElement('div');
        container.className = 'pulse-container';
        // Important: No transform or positioning styles on the container
        // Mapbox handles the positioning via transform

        const inner = document.createElement('div');
        inner.className = 'pulse-inner';
        inner.style.width = '20px';
        inner.style.height = '20px';
        inner.style.backgroundColor = pulse.type === 'MOVIE' ? '#f472b6' : '#60a5fa'; // Pink or Blue
        inner.style.borderRadius = '50%';
        inner.style.boxShadow = `0 0 15px ${pulse.type === 'MOVIE' ? '#f472b6' : '#60a5fa'}`;
        inner.style.opacity = '0.8';
        inner.style.animation = 'pulse-animation 2s infinite';
        inner.style.cursor = 'pointer';

        container.appendChild(inner);

        // Create popup (Mini Card)
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'glass-popup' })
            .setHTML(`
                <div class="p-3 min-w-[150px]">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">${REACTION_ICONS[pulse.reactionType || pulse.reaction_type] || '❤️'}</span>
                        <span class="text-[10px] font-bold opacity-70 uppercase tracking-wider border border-white/20 px-1.5 py-0.5 rounded-full">${pulse.type}</span>
                    </div>
                    <h3 class="font-bold text-sm leading-tight mb-1">${pulse.title}</h3>
                    ${pulse.comment ? `<p class="text-xs opacity-60 truncate">"${pulse.comment}"</p>` : ''}
                    <div class="mt-2 text-[10px] text-blue-400 font-medium flex items-center gap-1">
                        <span>Click for details</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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

                const content = element.querySelector('.mapboxgl-popup-content') as HTMLElement;
                if (content) {
                    content.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('open-pulse-detail', { detail: pulse }));
                    });
                    content.style.cursor = 'pointer';
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
                @keyframes pulse - animation {
                0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 0.8; }
            }
                .glass - popup.mapboxgl - popup - content {
                    background: rgba(0, 0, 0, 0.8);
                    backdrop- filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        border - radius: 8px;
        padding: 0;
    }
                .pulse - marker {
        /* Only essential styles here, let Mapbox handle position */
        pointer - events: auto;
    }
                .glass - popup.mapboxgl - popup - tip {
        border - top - color: rgba(0, 0, 0, 0.8);
    }
    `}</style>
        </div>
    );
}