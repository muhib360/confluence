'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-6 max-w-[720px] mx-auto">
      <header className="flex justify-between items-center mb-16 mt-8">
        <h1 className="font-serif font-semibold text-2xl text-primary">Confluence</h1>
        <div className="flex gap-4 text-sm font-sans font-semibold">
          <button onClick={() => router.push('/profile')} className="text-on-surface hover:opacity-70 transition-opacity">Profile</button>
          <button onClick={handleLogout} className="text-on-surface hover:opacity-70 transition-opacity">Log out</button>
        </div>
      </header>

      <main className="mt-32">
        {status === 'idle' && (
          <div className="fade-in-up">
            <h2 className="font-serif text-[48px] leading-[56px] tracking-[-0.02em] font-semibold mb-12">
              What would you like to explore today?
            </h2>
            <form onSubmit={handleSearch}>
              <input 
                type="text"
                placeholder="e.g. History of Roman institutions..."
                className="input-underline text-xl placeholder:opacity-40"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                autoFocus
              />
              <button type="submit" disabled={!topic.trim()} className="btn-primary mt-12 px-12">
                Find Conversation
              </button>
            </form>
          </div>
        )}

        {status === 'searching' && (
          <div className="fade-in-up text-center mt-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-serif text-xl text-on-surface-variant">Searching for resonance on &quot;{topic}&quot;...</p>
          </div>
        )}

        {status === 'queued' && (
          <div className="fade-in-up text-center mt-24">
            <div className="w-16 h-16 bg-surface-container rounded-full mx-auto mb-6 flex items-center justify-center opacity-50">
               <span className="text-primary text-xl">...</span>
            </div>
            <p className="font-serif text-xl text-on-surface-variant mb-4">No immediate match found.</p>
            <p className="font-sans text-sm text-on-surface-variant">You are in the queue for &quot;{topic}&quot;. We will notify you when someone joins.</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary mt-12">
              Cancel Search
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
