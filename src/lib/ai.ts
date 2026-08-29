import OpenAI from 'openai';
import { pipeline, env } from '@huggingface/transformers';

// Ensure it downloads models and doesn't try to use restricted local paths
env.allowLocalModels = false;

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'MISSING_API_KEY',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', 
        'X-Title': 'Confluence',
    }
});

// We use the free gemini model provided via OpenRouter
const GENERATIVE_MODEL = 'google/gemini-2.5-flash-free'; 

let embeddingPipeline: any = null;

export async function getEmbedding(text: string): Promise<number[]> {
    if (!embeddingPipeline) {
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

export async function extractBioSignal(bio: string) {
    const prompt = `
    Analyze the following user bio and extract structured signal.
    Return ONLY a JSON object with these exact keys:
    - "topic": A short 3-6 word summary of their core intellectual interest.
    - "stance": A short sentence summarizing their personal opinion/stance on the topic.
    - "preference": Return strictly "agree" if they want to connect with someone similar, or "argue" if they want to debate/be challenged.
    
    Bio: "${bio}"
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
        console.error("Failed to parse LLM signal", e);
        return { topic: 'Unknown topic', stance: 'Unknown', preference: 'agree' };
    }
}

export async function generateMatchContext(user1Bio: string, user2Bio: string) {
    const prompt = `
    Two users have been matched for a 1:1 conversation based on their bios.
    User 1: "${user1Bio}"
    User 2: "${user2Bio}"

    Return ONLY a JSON object with two keys:
    - "reason": A 1-2 sentence fun explanation of why they were matched (highlighting similarities or interesting contrasts).
    - "icebreaker": A thoughtful, specific question to kick off their conversation based on their overlapping interests.
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
