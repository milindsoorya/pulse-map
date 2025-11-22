"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { HeartButton } from "./HeartButton";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

export function MovieSearch() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);

    const { data, isLoading } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return { results: [] };
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(debouncedQuery)}`);
            if (!res.ok) throw new Error("Failed to search");
            return res.json();
        },
        enabled: debouncedQuery.length > 2
    });

    return (
        <div className="w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/40"
                />
                {isLoading && (
                    <div className="absolute right-4 top-3.5">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                )}
            </div>

            {data?.results && data.results.length > 0 && (
                <div className="mt-4 glass-card rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
                    {data.results.slice(0, 5).map((movie: any) => (
                        <div key={movie.id} className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <div className="relative w-12 h-16 flex-shrink-0 bg-slate-800 rounded overflow-hidden">
                                {movie.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-white/20">No Img</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-white truncate">{movie.title}</h3>
                                <p className="text-xs text-muted-foreground">{movie.release_date?.split("-")[0]}</p>
                            </div>

                            <HeartButton movie={movie} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
