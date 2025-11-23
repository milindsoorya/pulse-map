const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('❌ TURSO_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function setup() {
  console.log('🚀 Setting up Turso database...');
  console.log('📍 URL:', url);

  try {
    // Pulse Objects Table (Universal)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pulse_objects (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        external_id TEXT,
        title TEXT NOT NULL,
        metadata TEXT,
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
        comment TEXT,
        link TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY(object_id) REFERENCES pulse_objects(id)
      );
    `);
    console.log('✅ Created pulses table');

    console.log('🎉 Turso database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setup();
