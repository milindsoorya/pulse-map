const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function test() {
    console.log('🔍 Testing Turso database connection...\n');

    try {
        // Check pulse_objects
        const objects = await db.execute('SELECT * FROM pulse_objects LIMIT 5');
        console.log('📦 Pulse Objects:', objects.rows.length, 'rows');
        if (objects.rows.length > 0) {
            console.log('Sample:', objects.rows[0]);
        }

        // Check pulses
        const pulses = await db.execute('SELECT * FROM pulses LIMIT 5');
        console.log('\n💓 Pulses:', pulses.rows.length, 'rows');
        if (pulses.rows.length > 0) {
            console.log('Sample:', pulses.rows[0]);
        }

        // Check joined data (what the map uses)
        const joined = await db.execute(`
      SELECT p.*, o.title, o.type
      FROM pulses p
      JOIN pulse_objects o ON p.object_id = o.id
      LIMIT 5
    `);
        console.log('\n🗺️  Map Data (joined):', joined.rows.length, 'rows');
        if (joined.rows.length > 0) {
            console.log('Sample:', joined.rows[0]);
        }

        console.log('\n✅ Database connection working!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();
