"use client";

import { Navbar } from "@/components/layout/Navbar";
import { MapComponent } from "@/components/map/MapComponent";
import { MovieSearch } from "@/components/movies/MovieSearch";
import { useState } from "react";

const GENRES = [
  "All", "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction",
  "TV Movie", "Thriller", "War", "Western"
];

export default function Home() {
  const [genre, setGenre] = useState("All");

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      <Navbar />
      <MapComponent genre={genre} />

      {/* Overlay for Search & Filter */}
      <div className="absolute top-24 left-6 z-10 w-full max-w-md pointer-events-none">
        <div className="glass-card p-6 rounded-2xl pointer-events-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Global Pulse
            </h1>
            <p className="text-muted-foreground">
              See what the world is feeling right now.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {GENRES.map(g => (
                <option key={g} value={g} className="bg-black text-white">{g}</option>
              ))}
            </select>
            <div className="flex-1">
              <MovieSearch />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
