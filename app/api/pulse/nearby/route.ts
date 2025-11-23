import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const radius = parseFloat(searchParams.get('radius') || '50'); // default 50km

        if (!lat || !lng) {
            return NextResponse.json({ error: 'Missing lat/lng parameters' }, { status: 400 });
        }

        // Fetch all pulses (with a reasonable limit)
        // In production, you'd use spatial indexes or bounding box queries
        const result = await db.execute(`
            SELECT 
                o.id,
                o.title,
                o.type,
                p.latitude,
                p.longitude,
                COUNT(p.id) as pulse_count
            FROM pulse_objects o
            JOIN pulses p ON o.id = p.object_id
            GROUP BY o.id, o.title, o.type, p.latitude, p.longitude
            LIMIT 100
        `);

        // Calculate distances and filter by radius
        const nearby = result.rows
            .map((row: any) => ({
                ...row,
                distance: calculateDistance(lat, lng, row.latitude, row.longitude)
            }))
            .filter((item: any) => item.distance <= radius)
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 10);

        return NextResponse.json({ nearby });
    } catch (error) {
        console.error('Error fetching nearby pulses:', error);
        return NextResponse.json({ error: 'Failed to fetch nearby pulses' }, { status: 500 });
    }
}
