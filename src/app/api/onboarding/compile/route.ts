import { NextResponse } from 'next/server';
import { compileBio } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

function generateAbstractAvatar(seed: string) {
    const colors = ['#aecccc', '#b6cbc3', '#e4c199', '#4f625c', '#1a3636', '#b4946f', '#829f9f', '#cfe4dc'];
    const idx = seed.length % colors.length;
    const color = colors[idx];
    const shapes = ['circle', 'rect', 'polygon'];
    const shape = shapes[seed.length % shapes.length];

    if (shape === 'circle') {
        return `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${color}"/></svg>`;
    } else if (shape === 'rect') {
        return `<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/></svg>`;
    } else {
        return `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="${color}"/></svg>`;
    }
}

export async function POST(req: Request) {
    try {
        const { initialPrompt, followUpAnswer } = await req.json();
        const bio = await compileBio(initialPrompt, followUpAnswer);
        
        // Save to supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const avatar = generateAbstractAvatar(user.id);
            await supabase.from('profiles').update({ bio, avatar_svg: avatar }).eq('id', user.id);
        }

        return NextResponse.json({ bio });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to compile bio' }, { status: 500 });
    }
}
