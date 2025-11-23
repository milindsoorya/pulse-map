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

async function check() {
    console.log('🚀 Checking Turso database...');
    try {
        const result = await db.execute('SELECT * FROM pulses LIMIT 5');
        console.log('Pulses:', result.rows);
    } catch (error) {
        console.error('❌ Error checking database:', error);
    }
}

check();
