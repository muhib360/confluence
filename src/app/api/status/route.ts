import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = db.prepare(`SELECT status FROM users WHERE id = ?`).get(userId) as any;

    if (!user) {
        return NextResponse.json({ status: 'not_found' });
    }

    if (user.status === 'matched') {
        const match = db.prepare(`
            SELECT * FROM matches 
            WHERE user1_id = ? OR user2_id = ? 
            ORDER BY created_at DESC LIMIT 1
        `).get(userId, userId) as any;

        if (match) {
            const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;
            const partner = db.prepare(`SELECT name, bio, topic, stance FROM users WHERE id = ?`).get(partnerId) as any;
            
            return NextResponse.json({
                status: 'matched',
                partner,
                reason: match.reason,
                icebreaker: match.icebreaker
            });
        }
    }

    return NextResponse.json({ status: user.status }); // 'waiting'
}
