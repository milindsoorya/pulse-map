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

async function addIndexes() {
    console.log('🔧 Adding database indexes for better performance...\n');

    try {
        // Index on created_at for trending queries
        await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_pulses_created_at ON pulses(created_at);
    `);
        console.log('✅ Created index on pulses.created_at');

        // Index on latitude and longitude for spatial queries
        await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_pulses_location ON pulses(latitude, longitude);
    `);
        console.log('✅ Created index on pulses.latitude, pulses.longitude');

        // Index on object type for filtering
        await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_objects_type ON pulse_objects(type);
    `);
        console.log('✅ Created index on pulse_objects.type');

        console.log('\n🎉 All indexes created successfully!');
    } catch (error) {
        console.error('❌ Error adding indexes:', error);
    }
}

addIndexes();
