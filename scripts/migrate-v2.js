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

async function migrate() {
    console.log('🚀 Starting migration v2...');

    try {
        // Add comment column
        try {
            await db.execute("ALTER TABLE pulses ADD COLUMN comment TEXT");
            console.log('✅ Added comment column');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ comment column already exists');
            } else {
                throw e;
            }
        }

        // Add link column
        try {
            await db.execute("ALTER TABLE pulses ADD COLUMN link TEXT");
            console.log('✅ Added link column');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ link column already exists');
            } else {
                throw e;
            }
        }

        console.log('🎉 Migration v2 complete!');
    } catch (error) {
        console.error('❌ Error running migration:', error);
    }
}

migrate();
