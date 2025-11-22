"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface HeartButtonProps {
    movie: {
        id: number;
        title: string;
        poster_path: string | null;
        release_date: string;
        overview: string;
    };
    initialHearted?: boolean;
}

export function HeartButton({ movie, initialHearted = false }: HeartButtonProps) {
    const [isHearted, setIsHearted] = useState(initialHearted);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            // Get location
            let lat = 0, lng = 0;
            if (typeof navigator !== "undefined" && navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (e) {
                    console.warn("Geolocation failed", e);
                }
            }

            const res = await fetch("/api/pulse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    movieId: movie.id,
                    movieData: movie,
                    lat,
                    lng
                })
            });

            if (!res.ok) throw new Error("Failed to pulse");
            return res.json();
        },
        onMutate: async () => {
            setIsHearted(!isHearted); // Toggle immediately
        },
        onError: () => {
            setIsHearted(!isHearted); // Revert on error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pulses"] });
        }
    });

    const handleHeart = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Guest mode: Everyone can heart
        mutation.mutate();
    };

    return (
        <button
            onClick={handleHeart}
            disabled={mutation.isPending}
            className={cn(
                "p-2 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-95",
                isHearted ? "text-primary" : "text-white/50 hover:text-primary"
            )}
        >
            <Heart
                className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isHearted && "fill-current scale-110 drop-shadow-[0_0_8px_rgba(255,51,153,0.6)]"
                )}
            />
        </button>
    );
}
