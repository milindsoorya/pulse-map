import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB API Key missing' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
        );

        if (!response.ok) {
            throw new Error('TMDB API error');
        }

        const data = await response.json();

        // Transform to our minimal format
        const results = data.results.slice(0, 5).map((movie: any) => ({
            id: movie.id.toString(),
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            overview: movie.overview,
        }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Error searching TMDB:', error);
        return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
    }
}
