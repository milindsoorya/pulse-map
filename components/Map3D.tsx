// components/Map3D.tsx
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

    // --- Pulse Rendering Logic ---
    const addPulseMarker = (pulse: any) => {
        if (!map.current || markersRef.current[pulse.id]) return;

        // Debug logging
        // console.log('Adding pulse:', pulse.title, pulse.latitude, pulse.longitude);

        if (!pulse.latitude || !pulse.longitude || (pulse.latitude === 0 && pulse.longitude === 0)) {
            console.warn('Invalid coordinates for pulse:', pulse);
            return;
        }

        const el = document.createElement('div');
        el.className = 'pulse-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = pulse.type === 'MOVIE' ? '#f472b6' : '#60a5fa'; // Pink or Blue
        el.style.borderRadius = '50%';
        el.style.boxShadow = `0 0 15px ${pulse.type === 'MOVIE' ? '#f472b6' : '#60a5fa'}`;
        el.style.opacity = '0.8';
        el.style.animation = 'pulse-animation 2s infinite';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'glass-popup' })
            .setHTML(`
                <div class="p-2">
                    <h3 class="font-bold text-sm">${pulse.title}</h3>
                    <p class="text-xs opacity-70">${pulse.type}</p>
                </div>
            `);

        const marker = new mapboxgl.Marker(el)
            .setLngLat([pulse.longitude, pulse.latitude])
            .setPopup(popup)
            .addTo(map.current);

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
                projection: 'globe',
                center: [0, 20],
                zoom: 1.8,
                attributionControl: false,
                logoPosition: 'bottom-right',
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
            const { lat, lng, zoom } = e.detail;
            if (map.current) {
                map.current.flyTo({
                    center: [lng, lat],
                    zoom: zoom || 4,
                    speed: 1.5
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

            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full outline-none"
            />

            <style jsx global>{`
                @keyframes pulse-animation {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                .glass-popup .mapboxgl-popup-content {
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    border-radius: 8px;
                    padding: 0;
                }
                .glass-popup .mapboxgl-popup-tip {
                    border-top-color: rgba(0, 0, 0, 0.8);
                }
            `}</style>
        </div>
    );
}