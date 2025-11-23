import { addPulse, getPulses } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { movieId, movieData, lat, lng, countryCode } = body;

        if (!movieId || !movieData) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        await addPulse({
            movieId,
            title: movieData.title,
            posterPath: movieData.poster_path,
            lat: lat || 0,
            lng: lng || 0,
            countryCode: countryCode || "Unknown",
            genre: movieData.genre || "Unknown"
        });

        return NextResponse.json({ status: "added" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre") || undefined;

    try {
        const pulses = await getPulses(100, genre);
        return NextResponse.json({ pulses });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch pulses" }, { status: 500 });
    }
}
