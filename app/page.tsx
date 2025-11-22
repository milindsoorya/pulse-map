import { Navbar } from "@/components/layout/Navbar";
import { MapComponent } from "@/components/map/MapComponent";
import { MovieSearch } from "@/components/movies/MovieSearch";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <Navbar />
      <MapComponent />

      {/* Overlay for Search */}
      <div className="absolute top-24 left-6 z-10 w-full max-w-md pointer-events-none">
        <div className="glass-card p-6 rounded-2xl pointer-events-auto">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Global Pulse
          </h1>
          <p className="text-muted-foreground mb-4">
            See what the world is feeling right now.
          </p>

          <MovieSearch />
        </div>
      </div>
    </main>
  );
}
