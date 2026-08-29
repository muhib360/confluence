import db from './db';
import { getEmbedding } from './ai';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findBestMatch(userId: string, userEmbedding: number[], preference: string) {
    const waitingUsers = db.prepare(`SELECT id, bio, embedding, preference FROM users WHERE status = 'waiting' AND id != ?`).all(userId) as any[];

    let bestMatch = null;
    let highestScore = -1;

    for (const other of waitingUsers) {
        let otherEmbedding = null;
        
        if (!other.embedding) {
            // Lazily generate embedding for dummy data if missing
            const embed = await getEmbedding(other.bio);
            db.prepare(`UPDATE users SET embedding = ? WHERE id = ?`).run(JSON.stringify(embed), other.id);
            otherEmbedding = embed;
        } else {
            otherEmbedding = JSON.parse(other.embedding);
        }

        const score = cosineSimilarity(userEmbedding, otherEmbedding);

        let finalScore = score;
        if (preference === 'argue' && other.preference === 'argue') {
            finalScore += 0.1; 
        } else if (preference === 'agree' && other.preference === 'agree') {
            finalScore += 0.1;
        } else if (preference !== other.preference) {
            // Penalty if one wants to argue and other wants to agree
            finalScore -= 0.1;
        }

        if (finalScore > highestScore) {
            highestScore = finalScore;
            bestMatch = other;
        }
    }

    // Threshold for a match (0.4 is a reasonable baseline for MiniLM cosine similarity)
    if (highestScore > 0.4 && bestMatch) {
        return bestMatch;
    }

    return null;
}
