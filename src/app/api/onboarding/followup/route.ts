import { NextResponse } from 'next/server';
import { generateFollowUpQuestion } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const { initialPrompt } = await req.json();
        const question = await generateFollowUpQuestion(initialPrompt);
        return NextResponse.json({ question });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate follow-up' }, { status: 500 });
    }
}
