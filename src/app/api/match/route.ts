import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMatchContext } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Simulate search delay
        await new Promise(r => setTimeout(r, 1500));

        // Fetch the user's blocked and blockers
        const { data: blocks } = await supabase
            .from('blocks')
            .select('blocker_id, blocked_id')
            .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
            
        const excludedIds = new Set([user.id]);
        if (blocks) {
            blocks.forEach(block => {
                excludedIds.add(block.blocker_id);
                excludedIds.add(block.blocked_id);
            });
        }

        // Find a match (excluding blocked/blockers)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, bio')
            .not('id', 'in', `(${Array.from(excludedIds).join(',')})`)
            .limit(50);
        if (!profiles || profiles.length === 0) {
            // Queue state
            await supabase.from('queues').insert({ user_id: user.id, topic, status: 'searching' });
            return NextResponse.json({ queued: true });
        }

        // Pick random profile
        const matchedProfile = profiles[Math.floor(Math.random() * profiles.length)];

        // Generate context
        const context = await generateMatchContext(topic);

        // Create match
        const { data: match, error } = await supabase
            .from('matches')
            .insert({
                user1_id: user.id,
                user2_id: matchedProfile.id,
                topic,
                reasoning: context.reason,
                icebreaker: context.icebreaker,
                status: 'pending'
            })
            .select()
            .single();

        if (error || !match) throw error;

        return NextResponse.json({ matchId: match.id });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Match failed' }, { status: 500 });
    }
}
