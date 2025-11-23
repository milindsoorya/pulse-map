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
        const { objectId, objectType, title, latitude, longitude, reactionType, comment, link } = body;

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Missing location' }, { status: 400 });
        }

        if (comment && comment.length > 250) {
            return NextResponse.json({ error: 'Comment too long (max 250 chars)' }, { status: 400 });
        }

        let finalObjectId = objectId;

        // If we have object details but no ID (or we want to ensure it exists), create/find it
        if (objectType && title) {
            // Check if it exists (by externalId or title+type)
            // For simplicity in V1/V2, we'll just create it if we don't have an ID provided
            // In a real app, we'd check for duplicates.

            if (!finalObjectId) {
                finalObjectId = randomUUID();
                await db.execute({
                    sql: `INSERT INTO pulse_objects (id, type, title, created_at) VALUES (?, ?, ?, unixepoch())`,
                    args: [finalObjectId, objectType, title]
                });
            } else {
                // Ensure it exists (ignore if exists)
                // For movies, we might have passed the TMDB ID as objectId.
                // Let's try to insert, ignore on conflict if we had a unique constraint (we don't yet).
                // So let's just check.
                const existing = await db.execute({
                    sql: `SELECT id FROM pulse_objects WHERE id = ?`,
                    args: [finalObjectId]
                });

                if (existing.rows.length === 0) {
                    await db.execute({
                        sql: `INSERT INTO pulse_objects (id, type, title, external_id, created_at) VALUES (?, ?, ?, ?, unixepoch())`,
                        args: [finalObjectId, objectType, title, objectId] // Use objectId as externalId for movies
                    });
                }
            }
        }

        if (!finalObjectId) {
            return NextResponse.json({ error: 'Missing object ID or details' }, { status: 400 });
        }

        const id = randomUUID();

        await db.execute({
            sql: `
        INSERT INTO pulses (id, object_id, latitude, longitude, reaction_type, comment, link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
            args: [id, finalObjectId, latitude, longitude, reactionType || 'HEART', comment || null, link || null]
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error creating pulse:', error);
        return NextResponse.json({ error: 'Failed to create pulse' }, { status: 500 });
    }
}
