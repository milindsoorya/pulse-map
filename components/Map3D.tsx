'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: You must set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function Map3D() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (!MAPBOX_TOKEN) {
            console.error('Mapbox token is missing!');
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Dark minimal style
            projection: 'globe', // 3D Globe
            center: [0, 20],
            zoom: 1.5,
            attributionControl: false,
        });

        map.current.on('style.load', () => {
            if (!map.current) return;

            // Add atmosphere (stars/fog)
            map.current.setFog({
                color: 'rgb(10, 10, 20)', // Lower atmosphere
                'high-color': 'rgb(0, 0, 0)', // Upper atmosphere
                'horizon-blend': 0.2, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(0, 0, 0)', // Background color
                'star-intensity': 0.6, // Background star brightness (default 0.35 at low zoooms )
            });

            setLoaded(true);
        });

        // Clean up on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <div className="w-full h-full">
            {!MAPBOX_TOKEN && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black text-red-500">
                    Missing NEXT_PUBLIC_MAPBOX_TOKEN
                </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
}
