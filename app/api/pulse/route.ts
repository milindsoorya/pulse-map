import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
    try {
        // In a real app, we might filter by viewport (lat/lng bounds)
        // For V1, we fetch the last 100 pulses
        const result = await db.execute(`
      SELECT p.*, o.title, o.type, o.metadata 
      FROM pulses p
      JOIN pulse_objects o ON p.object_id = o.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);

        return NextResponse.json({ pulses: result.rows });
    } catch (error) {
        console.error('Error fetching pulses:', error);
        return NextResponse.json({ error: 'Failed to fetch pulses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { objectId, latitude, longitude, reactionType } = body;

        if (!objectId || !latitude || !longitude) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = randomUUID();

        await db.execute({
            sql: `
        INSERT INTO pulses (id, object_id, latitude, longitude, reaction_type)
        VALUES (?, ?, ?, ?, ?)
      `,
            args: [id, objectId, latitude, longitude, reactionType || 'HEART']
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating pulse:', error);
        return NextResponse.json({ error: 'Failed to create pulse' }, { status: 500 });
    }
}
