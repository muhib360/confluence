import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'MISSING_API_KEY',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', 
        'X-Title': 'Confluence',
    }
});

// Free models provided via OpenRouter
const GENERATIVE_MODEL = 'openrouter/free';

export async function generateFollowUpQuestion(initialPrompt: string): Promise<string> {
    const prompt = `
    You are an intellectual conversationalist helping a user write a bio for a platform called "Confluence", 
    which focuses on "Quiet, intentional conversations" and "Modern Editorial" style.
    
    The user was asked: "What brings you here? What topics do you want to explore?"
    Their answer: "${initialPrompt}"
    
    Generate a single, thoughtful follow-up question to dig deeper into their interest. 
    Make it sound human, curious, and intellectual, but keep it concise (1 sentence).
    Return ONLY the question text.
    `;

    const response = await openai.chat.completions.create({
        model: GENERATIVE_MODEL,
        messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0]?.message?.content?.trim() || "What specific aspect of that fascinates you the most?";
}

export async function compileBio(initialPrompt: string, followUpAnswer: string): Promise<string> {
    const prompt = `
    You are helping a user write a bio for a platform called "Confluence", which focuses on deep, intentional conversations.
    The tone should be "Quietly Intellectual" - like a high-end editorial publication or a literary journal. 
    It should be concise, around 2-3 sentences.
    
    User's initial answer about what brings them here: "${initialPrompt}"
    User's answer to a follow up question: "${followUpAnswer}"
    
    Compile this into a cohesive, first-person bio.
    Return ONLY the bio text, no quotes or intro.
    `;

    const response = await openai.chat.completions.create({
        model: GENERATIVE_MODEL,
        messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0]?.message?.content?.trim() || initialPrompt;
}

export async function generateMatchContext(topic: string) {
    const prompt = `
    Two users have been matched for a 1:1 conversation based on their shared interest in the topic: "${topic}".

    Return a JSON object with two keys:
    - "reason": A 1-2 sentence fun explanation of why they were matched (highlighting the topic).
    - "icebreaker": A thoughtful, specific question to kick off their conversation based on this topic.
    `;

    const response = await openai.chat.completions.create({
        model: GENERATIVE_MODEL,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
    });

    try {
        const content = response.choices[0].message.content;
        return JSON.parse(content || '{}');
    } catch (e) {
        console.error("Failed to parse LLM match context", e);
        return { reason: 'You both share similar interests.', icebreaker: 'What are you reading lately?' };
    }
}
