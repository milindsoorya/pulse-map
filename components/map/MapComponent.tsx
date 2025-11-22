"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Pulse {
    id: number;
    lat: number;
    lng: number;
    title: string;
    posterPath: string;
}

export function MapComponent() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [lng, setLng] = useState(-0.09);
    const [lat, setLat] = useState(51.505);
    const [zoom, setZoom] = useState(2);
    const [visiblePulses, setVisiblePulses] = useState<Pulse[]>([]);

    const { data: pulsesData } = useQuery({
        queryKey: ["pulses"],
        queryFn: async () => {
            const res = await fetch("/api/pulse");
            if (!res.ok) return { pulses: [] };
            return res.json();
        },
        refetchInterval: 3000
    });

    const pulses = pulsesData?.pulses || [];

    useEffect(() => {
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "pk.placeholder") return;
        if (map.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('move', () => {
            if (!map.current) return;
            const center = map.current.getCenter();
            const z = map.current.getZoom();
            setLng(parseFloat(center.lng.toFixed(4)));
            setLat(parseFloat(center.lat.toFixed(4)));
            setZoom(parseFloat(z.toFixed(2)));

            // Update visible pulses if zoomed in
            if (z > 4) {
                const bounds = map.current.getBounds();
                if (bounds) {
                    const visible = pulses.filter((p: Pulse) =>
                        bounds.contains([p.lng, p.lat])
                    );
                    setVisiblePulses(visible);
                }
            } else {
                setVisiblePulses([]);
            }
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        if (!map.current) return;

        // Clear existing
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pulses.forEach((pulse: Pulse) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.innerHTML = `
            <div class="group relative flex items-center justify-center w-8 h-8 cursor-pointer">
               <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span class="relative inline-flex rounded-full h-4 w-4 bg-primary group-hover:scale-125 transition-transform"></span>
            </div>
        `;

            const tooltip = new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(`<div class="text-black text-xs font-bold p-1">${pulse.title}</div>`);

            el.addEventListener('mouseenter', () => {
                if (map.current) tooltip.setLngLat([pulse.lng, pulse.lat]).addTo(map.current);
            });
            el.addEventListener('mouseleave', () => tooltip.remove());

            const marker = new mapboxgl.Marker(el)
                .setLngLat([pulse.lng, pulse.lat])
                .addTo(map.current!);

            markersRef.current.push(marker);
        });

        // Re-check visible pulses if data updates
        if (map.current && map.current.getZoom() > 4) {
            const bounds = map.current.getBounds();
            if (bounds) {
                const visible = pulses.filter((p: Pulse) =>
                    bounds.contains([p.lng, p.lat])
                );
                setVisiblePulses(visible);
            }
        }

    }, [pulses]);

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "pk.placeholder") {
        return <div className="text-white p-10">Missing Mapbox Token</div>;
    }

    return (
        <div className="w-full h-screen fixed inset-0">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Side Panel */}
            <AnimatePresence>
                {visiblePulses.length > 0 && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-40 pt-24"
                    >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Film className="text-primary" />
                            Local Pulses
                        </h3>
                        <div className="space-y-4">
                            {visiblePulses.map((pulse) => (
                                <div key={pulse.id} className="bg-white/5 p-3 rounded-lg flex gap-3 items-start hover:bg-white/10 transition-colors">
                                    {pulse.posterPath && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${pulse.posterPath}`}
                                            alt={pulse.title}
                                            className="w-12 h-18 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-medium text-white text-sm">{pulse.title}</h4>
                                        <p className="text-xs text-white/50 mt-1">Detected here</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}