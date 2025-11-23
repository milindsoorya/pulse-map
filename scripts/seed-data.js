const { createClient } = require('@libsql/client');
const { randomUUID } = require('crypto');
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

// Diverse locations across the globe
const locations = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
];

// Popular movies and topics
const content = [
    { type: 'MOVIE', id: '27205', title: 'Inception' },
    { type: 'MOVIE', id: '550', title: 'Fight Club' },
    { type: 'MOVIE', id: '13', title: 'Forrest Gump' },
    { type: 'MOVIE', id: '155', title: 'The Dark Knight' },
    { type: 'MOVIE', id: '122', title: 'The Lord of the Rings: The Return of the King' },
    { type: 'MOVIE', id: '680', title: 'Pulp Fiction' },
    { type: 'MOVIE', id: '497', title: 'The Green Mile' },
    { type: 'MOVIE', id: '424', title: 'Schindler\'s List' },
    { type: 'MOVIE', id: '278', title: 'The Shawshank Redemption' },
    { type: 'MOVIE', id: '238', title: 'The Godfather' },
    { type: 'TOPIC', title: 'Climate Change' },
    { type: 'TOPIC', title: 'AI Revolution' },
    { type: 'TOPIC', title: 'Space Exploration' },
    { type: 'TOPIC', title: 'Mental Health Awareness' },
    { type: 'TOPIC', title: 'Sustainable Living' },
    { type: 'TOPIC', title: 'Remote Work Culture' },
    { type: 'TOPIC', title: 'Cybersecurity' },
    { type: 'TOPIC', title: 'Electric Vehicles' },
];

// Generate random timestamp within last 30 days
function randomTimestamp() {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    return Math.floor(Math.random() * (now - thirtyDaysAgo)) + thirtyDaysAgo;
}

// Add some variance to location (within ~5km radius)
function addLocationVariance(lat, lng) {
    const latVariance = (Math.random() - 0.5) * 0.09; // ~5km
    const lngVariance = (Math.random() - 0.5) * 0.09;
    return {
        lat: lat + latVariance,
        lng: lng + lngVariance
    };
}

async function seed() {
    console.log('🌱 Seeding database with dummy data...\n');

    try {
        let totalPulses = 0;

        // Create popular items with multiple pulses
        for (const item of content) {
            const objectId = item.id || randomUUID();

            // Create pulse object
            await db.execute({
                sql: `INSERT OR IGNORE INTO pulse_objects (id, type, title, external_id, created_at) VALUES (?, ?, ?, ?, ?)`,
                args: [objectId, item.type, item.title, item.id || null, Math.floor(Date.now() / 1000)]
            });

            // Create 2-8 pulses for each item across different locations
            const numPulses = Math.floor(Math.random() * 7) + 2;

            for (let i = 0; i < numPulses; i++) {
                const location = locations[Math.floor(Math.random() * locations.length)];
                const { lat, lng } = addLocationVariance(location.lat, location.lng);
                const pulseId = randomUUID();
                const timestamp = randomTimestamp();

                await db.execute({
                    sql: `INSERT INTO pulses (id, object_id, latitude, longitude, reaction_type, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
                    args: [pulseId, objectId, lat, lng, 'HEART', timestamp]
                });

                totalPulses++;
            }

            console.log(`✅ Created ${numPulses} pulses for "${item.title}"`);
        }

        console.log(`\n🎉 Seeding complete! Created ${totalPulses} pulses across ${content.length} items.`);

        // Verify
        const count = await db.execute('SELECT COUNT(*) as count FROM pulses');
        console.log(`📊 Total pulses in database: ${count.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

seed();
