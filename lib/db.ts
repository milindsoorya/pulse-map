import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Initialize DB (Async)
export async function initDB() {
  await db.execute(`
        CREATE TABLE IF NOT EXISTS pulses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movieId INTEGER,
            title TEXT,
            posterPath TEXT,
            lat REAL,
            lng REAL,
            countryCode TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Run init immediately (fire and forget for now, or call in instrumentation)
initDB().catch(console.error);

export interface Pulse {
  id: number;
  movieId: number;
  title: string;
  posterPath: string;
  lat: number;
  lng: number;
  countryCode: string;
  createdAt: string;
}

export async function addPulse(pulse: Omit<Pulse, 'id' | 'createdAt'>) {
  await db.execute({
    sql: `INSERT INTO pulses (movieId, title, posterPath, lat, lng, countryCode)
          VALUES (:movieId, :title, :posterPath, :lat, :lng, :countryCode)`,
    args: {
      movieId: pulse.movieId,
      title: pulse.title,
      posterPath: pulse.posterPath,
      lat: pulse.lat,
      lng: pulse.lng,
      countryCode: pulse.countryCode
    }
  });
}

export async function getPulses(limit = 100): Promise<Pulse[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM pulses ORDER BY createdAt DESC LIMIT ?',
    args: [limit]
  });

  return result.rows as unknown as Pulse[];
}
