const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Cache genres in memory to avoid fetching on every request
let genreCache: Record<number, string> | null = null;

export async function getGenres() {
    if (genreCache) return genreCache;

    if (!TMDB_API_KEY || TMDB_API_KEY === "placeholder") {
        return { 28: "Action", 35: "Comedy", 18: "Drama" };
    }

    try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch genres");
        const data = await res.json();
        const map: Record<number, string> = {};
        data.genres.forEach((g: any) => {
            map[g.id] = g.name;
        });
        genreCache = map;
        return map;
    } catch (e) {
        console.error("Error fetching genres", e);
        return {};
    }
}

async function mapGenres(movies: any[]) {
    const genres = await getGenres();
    return movies.map(movie => ({
        ...movie,
        // Map first genre ID to name, or "Unknown"
        genre: movie.genre_ids && movie.genre_ids.length > 0 ? genres[movie.genre_ids[0]] : "Unknown"
    }));
}

export async function searchMovies(query: string) {
    if (!TMDB_API_KEY || TMDB_API_KEY === "placeholder") {
        console.warn("TMDB_API_KEY is missing or placeholder");
        // Return mock data if no key
        return {
            results: [
                { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", release_date: "1999-10-15", overview: "A ticking-time-bomb insomniac...", genre_ids: [18], genre: "Drama" },
                { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", release_date: "2010-07-15", overview: "Cobb, a skilled thief who commits corporate espionage...", genre_ids: [28], genre: "Action" }
            ]
        };
    }
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch movies");
    const data = await res.json();

    // Map genres
    data.results = await mapGenres(data.results);

    return data;
}

export async function getTrendingMovies() {
    if (!TMDB_API_KEY || TMDB_API_KEY === "placeholder") {
        return {
            results: [
                { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", genre: "Drama" },
                { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", genre: "Action" }
            ]
        };
    }
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error("Failed to fetch trending movies");
    const data = await res.json();

    // Map genres
    data.results = await mapGenres(data.results);

    return data;
}
