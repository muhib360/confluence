import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { extractBioSignal, getEmbedding, generateMatchContext } from '@/lib/ai';
import { findBestMatch } from '@/lib/matching';

export async function POST(req: Request) {
    try {
        const { bio, userId } = await req.json();
        
        if (!bio || !userId) {
            return NextResponse.json({ error: 'Missing bio or userId' }, { status: 400 });
        }

        // 1. Extract signal
        const signal = await extractBioSignal(bio);
        const { topic, stance, preference } = signal;

        // 2. Generate embedding for the bio
        const embedding = await getEmbedding(bio);

        // 3. Look for a match
        const match = await findBestMatch(userId, embedding, preference);

        if (match) {
            // Found a match!
            const matchContext = await generateMatchContext(bio, match.bio);
            const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Transaction to update both users and create match
            const createMatchTransaction = db.transaction(() => {
                db.prepare(`UPDATE users SET status = 'matched' WHERE id = ?`).run(userId);
                db.prepare(`UPDATE users SET status = 'matched' WHERE id = ?`).run(match.id);
                
                // If user is new, insert them first before matching
                const existingUser = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);
                if (!existingUser) {
                    db.prepare(`
                        INSERT INTO users (id, name, bio, topic, stance, preference, embedding, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'matched')
                    `).run(userId, 'You', bio, topic, stance, preference, JSON.stringify(embedding));
                } else {
                     db.prepare(`
                        UPDATE users SET bio = ?, topic = ?, stance = ?, preference = ?, embedding = ?, status = 'matched'
                        WHERE id = ?
                    `).run(bio, topic, stance, preference, JSON.stringify(embedding), userId);
                }

                db.prepare(`
                    INSERT INTO matches (id, user1_id, user2_id, reason, icebreaker)
                    VALUES (?, ?, ?, ?, ?)
                `).run(matchId, userId, match.id, matchContext.reason, matchContext.icebreaker);
            });

            createMatchTransaction();

            return NextResponse.json({
                status: 'matched',
                matchId,
                partner: {
                    name: match.name,
                    bio: match.bio,
                    topic: match.topic,
                    stance: match.stance
                },
                reason: matchContext.reason,
                icebreaker: matchContext.icebreaker
            });
        }

        // 4. No match, put in waiting queue
        const existingUser = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);
        if (!existingUser) {
            db.prepare(`
                INSERT INTO users (id, name, bio, topic, stance, preference, embedding, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting')
            `).run(userId, 'You', bio, topic, stance, preference, JSON.stringify(embedding));
        } else {
            db.prepare(`
                UPDATE users SET bio = ?, topic = ?, stance = ?, preference = ?, embedding = ?, status = 'waiting'
                WHERE id = ?
            `).run(bio, topic, stance, preference, JSON.stringify(embedding), userId);
        }

        return NextResponse.json({ status: 'waiting', topic, stance });

    } catch (error) {
        console.error('Error in join route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
