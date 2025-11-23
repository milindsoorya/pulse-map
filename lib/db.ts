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
            genre TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  // Migration for existing tables (idempotent-ish)
  try {
    await db.execute("ALTER TABLE pulses ADD COLUMN genre TEXT");
  } catch (e) {
    // Ignore error if column already exists
  }
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
  genre?: string;
  createdAt: string;
}

export async function addPulse(pulse: Omit<Pulse, 'id' | 'createdAt'>) {
  await db.execute({
    sql: `INSERT INTO pulses (movieId, title, posterPath, lat, lng, countryCode, genre)
          VALUES (:movieId, :title, :posterPath, :lat, :lng, :countryCode, :genre)`,
    args: {
      movieId: pulse.movieId,
      title: pulse.title,
      posterPath: pulse.posterPath,
      lat: pulse.lat,
      lng: pulse.lng,
      countryCode: pulse.countryCode,
      genre: pulse.genre || null
    }
  });
}

export async function getPulses(limit = 100, genre?: string): Promise<Pulse[]> {
  let sql = 'SELECT * FROM pulses';
  const args: any[] = [];

  if (genre && genre !== 'All') {
    sql += ' WHERE genre = ?';
    args.push(genre);
  }

  sql += ' ORDER BY createdAt DESC LIMIT ?';
  args.push(limit);

  const result = await db.execute({
    sql,
    args
  });

  return result.rows as unknown as Pulse[];
}
