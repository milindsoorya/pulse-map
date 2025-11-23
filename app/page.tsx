'use client';

import Map3D from '@/components/Map3D';
import PulseOverlay from '@/components/PulseOverlay';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Map Layer - The Core */}
      <div className="absolute inset-0 z-0">
        <Map3D />
      </div>

      {/* UI Layer - Minimal Overlay */}
      <div className="absolute inset-0 z-10">
        <PulseOverlay />
      </div>
    </main>
  );
}
