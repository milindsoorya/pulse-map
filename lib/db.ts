import Database from 'better-sqlite3';

const db = new Database('pulse.db');

// Initialize DB
db.exec(`
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

export function addPulse(pulse: Omit<Pulse, 'id' | 'createdAt'>) {
    const stmt = db.prepare(`
    INSERT INTO pulses (movieId, title, posterPath, lat, lng, countryCode)
    VALUES (@movieId, @title, @posterPath, @lat, @lng, @countryCode)
  `);
    return stmt.run(pulse);
}

export function getPulses(limit = 100): Pulse[] {
    const stmt = db.prepare('SELECT * FROM pulses ORDER BY createdAt DESC LIMIT ?');
    return stmt.all(limit) as Pulse[];
}
