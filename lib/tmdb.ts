const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function searchMovies(query: string) {
    if (!TMDB_API_KEY || TMDB_API_KEY === "placeholder") {
        console.warn("TMDB_API_KEY is missing or placeholder");
        // Return mock data if no key
        return {
            results: [
                { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", release_date: "1999-10-15", overview: "A ticking-time-bomb insomniac..." },
                { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", release_date: "2010-07-15", overview: "Cobb, a skilled thief who commits corporate espionage..." }
            ]
        };
    }
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch movies");
    return res.json();
}

export async function getTrendingMovies() {
    if (!TMDB_API_KEY || TMDB_API_KEY === "placeholder") {
        return {
            results: [
                { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
                { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" }
            ]
        };
    }
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error("Failed to fetch trending movies");
    return res.json();
}
