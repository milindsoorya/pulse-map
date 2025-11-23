const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || 'file:pulse.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function setup() {
    console.log('🚀 Setting up database...');

    try {
        // Pulse Objects Table (Universal)
        await db.execute(`
      CREATE TABLE IF NOT EXISTS pulse_objects (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL, -- 'MOVIE', 'TOPIC', etc.
        external_id TEXT,   -- e.g., TMDB ID
        title TEXT NOT NULL,
        metadata TEXT,      -- JSON string
        created_at INTEGER DEFAULT (unixepoch())
      );
    `);
        console.log('✅ Created pulse_objects table');

        // Pulses Table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS pulses (
        id TEXT PRIMARY KEY,
        object_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        reaction_type TEXT DEFAULT 'HEART',
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY(object_id) REFERENCES pulse_objects(id)
      );
    `);
        console.log('✅ Created pulses table');

        console.log('🎉 Database setup complete!');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

setup();
