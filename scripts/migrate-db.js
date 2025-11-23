const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function migrate() {
    console.log('🔄 Migrating Turso database to new schema...\n');

    try {
        // Drop old tables if they exist
        console.log('🗑️  Dropping old tables...');
        await db.execute('DROP TABLE IF EXISTS pulses');
        await db.execute('DROP TABLE IF EXISTS pulse_objects');
        console.log('✅ Old tables dropped');

        // Create new tables with correct schema
        await db.execute(`
      CREATE TABLE pulse_objects (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        external_id TEXT,
        title TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      );
    `);
        console.log('✅ Created pulse_objects table');

        await db.execute(`
      CREATE TABLE pulses (
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

        console.log('\n🎉 Migration complete! Database is ready.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

migrate();
