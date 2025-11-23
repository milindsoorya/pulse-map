import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM pulses ORDER BY created_at DESC LIMIT 50');
        return NextResponse.json({ pulses: result.rows });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
