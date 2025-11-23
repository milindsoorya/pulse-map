const { createClient } = require('@libsql/client');
// require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function inspect() {
    console.log('🔍 Inspecting Turso database schema...\n');

    try {
        // Get all tables
        const tables = await db.execute(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);

        console.log('📋 Tables:', tables.rows.map(r => r.name).join(', '));

        // Check each table's schema
        for (const table of tables.rows) {
            if (table.name.startsWith('sqlite_')) continue;

            console.log(`\n📦 Table: ${table.name}`);
            const info = await db.execute(`PRAGMA table_info(${table.name})`);
            console.log('Columns:', info.rows.map(r => `${r.name} (${r.type})`).join(', '));

            // Get row count
            const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${table.name}`);
            console.log(`Rows: ${count.rows[0].cnt}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

inspect();
