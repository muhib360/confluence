'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen flex flex-col">
      <header
        className="flex justify-between items-center px-6 sm:px-10 py-4"
        style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
      >
        <Link
          href="/"
          onClick={(e) => {
            if (status !== 'idle') {
              setStatus('idle')
              setTopic('')
            }
          }}
          className="font-serif font-semibold text-2xl tracking-tight transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          Confluence
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/chats"
            className="flex items-center gap-2 px-3 py-1.5 rounded font-sans text-[13px] font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="uppercase tracking-widest">Chats</span>
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)',
              }}
            >
              0
            </span>
          </Link>
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
        </div>
      </header>

      <main className={`flex-1 flex flex-col p-6 max-w-[720px] mx-auto w-full ${status === 'idle' ? 'mt-16 sm:mt-20' : 'items-center justify-center -mt-10 pb-16'}`}>
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
            <div className="flex items-center justify-center mt-10">
              <button 
                onClick={() => {
                  setStatus('idle')
                  setTopic('')
                }} 
                className="btn-primary w-full sm:w-auto min-w-[160px]"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

