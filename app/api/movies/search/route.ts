import { searchMovies } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) return NextResponse.json({ results: [] });

    try {
        const data = await searchMovies(query);
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
