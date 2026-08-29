import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'confluence.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT NOT NULL,
    topic TEXT NOT NULL,
    stance TEXT NOT NULL,
    preference TEXT NOT NULL,
    embedding TEXT, 
    status TEXT DEFAULT 'waiting',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    icebreaker TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users (id),
    FOREIGN KEY (user2_id) REFERENCES users (id)
  );
`);

export function seedDummyData() {
    const check = db.prepare('SELECT COUNT(*) as count FROM users WHERE id LIKE "dummy_%"').get() as { count: number };
    
    if (check.count === 0) {
        console.log('Seeding dummy profiles...');
        const insertUser = db.prepare(`
            INSERT INTO users (id, name, bio, topic, stance, preference, status)
            VALUES (@id, @name, @bio, @topic, @stance, @preference, 'waiting')
        `);

        const dummies = [
            {
                id: 'dummy_1',
                name: 'Alice',
                bio: 'I just finished reading about the impact of artificial intelligence on modern art. I strongly believe AI cannot replace human creativity and want to debate this.',
                topic: 'AI in art',
                stance: 'AI cannot replace human creativity',
                preference: 'argue'
            },
            {
                id: 'dummy_2',
                name: 'Bob',
                bio: 'Currently exploring how AI tools like Midjourney are expanding the boundaries of human imagination. Looking to connect with someone who shares this excitement.',
                topic: 'AI in art',
                stance: 'AI expands human imagination',
                preference: 'agree'
            },
            {
                id: 'dummy_3',
                name: 'Charlie',
                bio: 'Deep diving into the ethics of autonomous vehicles. I think they are inherently dangerous until proven otherwise in edge cases.',
                topic: 'Ethics of autonomous vehicles',
                stance: 'Autonomous vehicles are dangerous',
                preference: 'agree'
            },
            {
                id: 'dummy_4',
                name: 'Diana',
                bio: 'Fascinated by urban planning and 15-minute cities. I believe cars should be banned from city centers entirely. Ready to debate someone on car-centric infrastructure.',
                topic: '15-minute cities and urban planning',
                stance: 'Cars should be banned from city centers',
                preference: 'argue'
            },
            {
                id: 'dummy_5',
                name: 'Eve',
                bio: 'Reading a lot about stoicism recently. Trying to figure out how to apply it to modern corporate stress.',
                topic: 'Stoicism in modern life',
                stance: 'Stoicism helps manage corporate stress',
                preference: 'agree'
            }
        ];

        const insertMany = db.transaction((users) => {
            for (const user of users) {
                insertUser.run(user);
            }
        });

        insertMany(dummies);
        console.log('Dummy profiles seeded.');
    }
}

// Ensure seeding happens
seedDummyData();

export default db;
