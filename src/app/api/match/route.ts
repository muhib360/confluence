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

        const excludedIds = new Set([user.id]);

        // Fetch the user's blocked and blockers (gracefully handle if table doesn't exist)
        try {
            const { data: blocks } = await supabase
                .from('blocks')
                .select('blocker_id, blocked_id')
                .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

            if (blocks) {
                blocks.forEach(block => {
                    excludedIds.add(block.blocker_id);
                    excludedIds.add(block.blocked_id);
                });
            }
        } catch {
            // blocks table may not exist yet — skip gracefully
        }

        // Also exclude users from previously declined matches
        const { data: declinedMatches } = await supabase
            .from('matches')
            .select('user1_id, user2_id')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .eq('status', 'declined');

        if (declinedMatches) {
            declinedMatches.forEach(m => {
                excludedIds.add(m.user1_id === user.id ? m.user2_id : m.user1_id);
            });
        }

        // Also check if another user is queued for a similar topic — match them first
        const { data: waitingQueues } = await supabase
            .from('queues')
            .select('*')
            .eq('status', 'searching')
            .neq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(20);

        if (waitingQueues && waitingQueues.length > 0) {
            // Find a queued user who isn't excluded
            const eligibleQueue = waitingQueues.find(q => !excludedIds.has(q.user_id));

            if (eligibleQueue) {
                // Generate context
                const context = await generateMatchContext(topic);

                // Create match between current user and the queued user
                const { data: match, error } = await supabase
                    .from('matches')
                    .insert({
                        user1_id: user.id,
                        user2_id: eligibleQueue.user_id,
                        topic,
                        reasoning: context.reason,
                        icebreaker: context.icebreaker,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (!error && match) {
                    // Mark the other user's queue entry as matched
                    await supabase
                        .from('queues')
                        .update({ status: 'matched' })
                        .eq('id', eligibleQueue.id);

                    return NextResponse.json({ matchId: match.id });
                }
            }
        }

        // Find a match from profiles (excluding blocked/blockers and declined)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, bio')
            .not('id', 'in', `(${Array.from(excludedIds).join(',')})`)
            .limit(50);

        if (!profiles || profiles.length === 0) {
            // No profiles available — queue the user
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
        console.error('Match API error:', error);
        return NextResponse.json({ error: 'Match failed' }, { status: 500 });
    }
}
