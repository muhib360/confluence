'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<'idle' | 'searching' | 'queued'>('idle')
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setStatus('searching')
    
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()

      if (data.matchId) {
        router.push(`/match/${data.matchId}`)
      } else if (data.queued) {
        setStatus('queued')
      }
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-[720px] mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-8 mt-4 sm:mt-6">
        <h1
          className="font-serif font-semibold text-2xl"
          style={{ color: 'var(--color-primary)' }}
        >
          Confluence
        </h1>
        <button
          onClick={() => router.push('/profile')}
          aria-label="Profile"
          title="Profile"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/60 hover:border-primary hover:bg-surface-container text-on-surface hover:text-primary transition-all"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      <main className={`flex-1 flex flex-col ${status === 'idle' ? 'mt-16 sm:mt-20' : 'items-center justify-center -mt-10 pb-16'}`}>
        {status === 'idle' && (
          <div className="fade-in-up">
            <h2
              className="font-serif font-semibold mb-8 max-w-[620px]"
              style={{
                fontSize: 'clamp(24px, 3.2vw, 32px)',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: 'var(--color-primary)',
              }}
            >
              What would you like to explore today?
            </h2>
            <form onSubmit={handleSearch}>
              <input 
                type="text"
                placeholder="e.g. History of Roman institutions..."
                className="input-underline text-lg sm:text-xl placeholder:opacity-40"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                autoFocus
              />
              <button type="submit" disabled={!topic.trim()} className="btn-primary mt-10 px-10">
                Find Conversation
              </button>
            </form>
          </div>
        )}

        {status === 'searching' && (
          <div className="fade-in-up text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-serif text-lg sm:text-xl text-on-surface-variant">Searching for resonance on &quot;{topic}&quot;...</p>
          </div>
        )}

        {status === 'queued' && (
          <div className="fade-in-up text-center">
            <div className="w-14 h-14 bg-surface-container rounded-full mx-auto mb-6 flex items-center justify-center opacity-70">
               <span className="text-primary text-xl font-serif">...</span>
            </div>
            <p className="font-serif text-lg sm:text-xl text-on-surface-variant mb-3">No immediate match found.</p>
            <p className="font-sans text-sm text-on-surface-variant max-w-md mx-auto">You are in the queue for &quot;{topic}&quot;. We will notify you when someone joins.</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary mt-10">
              Cancel Search
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

