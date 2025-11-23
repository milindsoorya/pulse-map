const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || 'file:pulse.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function check() {
    console.log('🔍 Checking database...');

    try {
        const objects = await db.execute('SELECT * FROM pulse_objects');
        console.log('Objects:', objects.rows);

        const pulses = await db.execute('SELECT * FROM pulses');
        console.log('Pulses:', pulses.rows);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

check();
