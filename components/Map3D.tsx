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

    // Fetch pulses periodically
    useEffect(() => {
        if (!loaded || !map.current) return;

        const fetchPulses = async () => {
            try {
                const res = await fetch('/api/pulse');
                const data = await res.json();

                if (data.pulses) {
                    const geojson: GeoJSON.FeatureCollection = {
                        type: 'FeatureCollection',
                        features: data.pulses.map((p: any) => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [p.longitude, p.latitude]
                            },
                            properties: {
                                id: p.id,
                                title: p.title,
                                type: p.reaction_type
                            }
                        }))
                    };

                    const source = map.current?.getSource('pulses') as mapboxgl.GeoJSONSource;
                    if (source) {
                        source.setData(geojson);
                    } else {
                        map.current?.addSource('pulses', {
                            type: 'geojson',
                            data: geojson
                        });

                        // Add a pulsing circle layer
                        map.current?.addLayer({
                            id: 'pulses-layer',
                            type: 'circle',
                            source: 'pulses',
                            paint: {
                                'circle-radius': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 4,
                                    5, 10
                                ],
                                'circle-color': '#ff0055', // Pulse color (pink/red)
                                'circle-opacity': 0.8,
                                'circle-blur': 0.5,
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#ffffff',
                                'circle-stroke-opacity': 0.5
                            }
                        });

                        // Add a glow effect (heatmap-like)
                        map.current?.addLayer({
                            id: 'pulses-heat',
                            type: 'heatmap',
                            source: 'pulses',
                            maxzoom: 9,
                            paint: {
                                'heatmap-weight': 1,
                                'heatmap-intensity': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 1,
                                    9, 3
                                ],
                                'heatmap-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['heatmap-density'],
                                    0, 'rgba(0,0,0,0)',
                                    0.2, 'rgba(255,0,85,0.2)',
                                    0.4, 'rgba(255,0,85,0.4)',
                                    0.6, 'rgba(255,0,85,0.6)',
                                    0.8, 'rgba(255,0,85,0.8)',
                                    1, 'rgba(255,255,255,0.9)'
                                ],
                                'heatmap-radius': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    0, 10,
                                    9, 30
                                ],
                                'heatmap-opacity': 0.7
                            }
                        }, 'pulses-layer'); // Place behind the dots
                    }
                }
            } catch (err) {
                console.error('Error fetching pulses:', err);
            }
        };

        // Initial fetch
        fetchPulses();

        // Poll every 5 seconds
        const interval = setInterval(fetchPulses, 5000);
        return () => clearInterval(interval);
    }, [loaded]);

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
