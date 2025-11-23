import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Get trending pulses based on count in last 7 days
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

        const result = await db.execute(`
            SELECT 
                o.id,
                o.title,
                o.type,
                COUNT(p.id) as pulse_count
            FROM pulse_objects o
            JOIN pulses p ON o.id = p.object_id
            WHERE p.created_at >= ?
            GROUP BY o.id, o.title, o.type
            ORDER BY pulse_count DESC, o.title ASC
            LIMIT 10
        `, [sevenDaysAgo]);

        return NextResponse.json({ trending: result.rows });
    } catch (error) {
        console.error('Error fetching trending pulses:', error);
        return NextResponse.json({ error: 'Failed to fetch trending pulses' }, { status: 500 });
    }
}
