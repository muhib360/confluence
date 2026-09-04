'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { use } from 'react'

import ReportBlockModal from '@/components/ReportBlockModal'

type PageStatus = 'viewing' | 'searching' | 'queued'

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [match, setMatch] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [status, setStatus] = useState<PageStatus>('viewing')
  const [topic, setTopic] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadMatch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single()
      if (!matchData) {
        router.push('/')
        return
      }
      setMatch(matchData)
      setTopic(matchData.topic)

      const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherUserId).single()
      setOtherUser(profile)
      setLoading(false)
    }
    loadMatch()
  }, [id])

  const handleAccept = async () => {
    const supabase = createClient()
    await supabase.from('matches').update({ status: 'accepted' }).eq('id', id)
    router.push(`/chat/${id}`)
  }

  const handleDecline = async () => {
    // 1. Decline the current match
    const supabase = createClient()
    await supabase.from('matches').update({ status: 'declined' }).eq('id', id)

    // 2. Immediately re-attempt match with the same topic
    setStatus('searching')

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()

      if (data.matchId) {
        // Found a new match — navigate to it
        router.replace(`/match/${data.matchId}`)
      } else if (data.queued) {
        // No one else available — show queued state inline
        setStatus('queued')
      }
    } catch (err) {
      console.error(err)
      setStatus('queued')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-xl">Loading connection...</div>

  // Searching for next match after passing
  if (status === 'searching') {
    return (
      <div className="min-h-screen p-6 max-w-[720px] mx-auto flex flex-col items-center justify-center">
        <div className="fade-in-up text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-serif text-lg sm:text-xl text-on-surface-variant">
            Finding another match for &quot;{topic}&quot;...
          </p>
        </div>
      </div>
    )
  }

  // No more matches available — queued
  if (status === 'queued') {
    return (
      <div className="min-h-screen p-6 max-w-[720px] mx-auto flex flex-col items-center justify-center">
        <div className="fade-in-up text-center">
          <div className="w-14 h-14 bg-surface-container rounded-full mx-auto mb-6 flex items-center justify-center opacity-70">
            <span className="text-primary text-xl font-serif">...</span>
          </div>
          <p className="font-serif text-lg sm:text-xl text-on-surface-variant mb-3">No more matches right now.</p>
          <p className="font-sans text-sm text-on-surface-variant max-w-md mx-auto">
            You&apos;re in the queue for &quot;{topic}&quot;. We&apos;ll notify you when someone new joins.
          </p>
          <button onClick={() => router.push('/')} className="btn-secondary mt-10">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-[720px] mx-auto flex flex-col justify-center relative">
      <div className="absolute top-6 right-6">
        {otherUser && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none p-2"
          >
            <span className="material-symbols-outlined text-[20px]">flag</span>
          </button>
        )}
      </div>

      <div className="fade-in-up">
        <h2 className="font-serif text-[32px] font-semibold text-center mb-12 text-primary">A connection was found.</h2>

        <div className="card mb-8 text-center bg-surface-container border-none shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface flex items-center justify-center opacity-80" dangerouslySetInnerHTML={{ __html: otherUser?.avatar_svg }} />
          </div>
          <h3 className="font-serif text-2xl font-medium mb-2">{otherUser?.display_name}</h3>
          <p className="font-serif text-lg text-on-surface-variant mb-6 px-4">{otherUser?.bio}</p>
        </div>

        <div className="mb-12">
          <h4 className="font-sans text-xs tracking-widest uppercase text-on-surface-variant mb-4">Why you matched</h4>
          <p className="font-serif text-lg leading-relaxed">{match?.reasoning}</p>
        </div>

        <div className="mb-12">
          <h4 className="font-sans text-xs tracking-widest uppercase text-on-surface-variant mb-4">Suggested Icebreaker</h4>
          <p className="font-serif text-lg leading-relaxed italic border-l-2 border-primary pl-4">{match?.icebreaker}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button onClick={handleDecline} className="btn-secondary w-full sm:w-auto">Pass</button>
          <button onClick={handleAccept} className="btn-primary w-full sm:w-auto">Begin Conversation</button>
        </div>
      </div>
      
      {otherUser && (
        <ReportBlockModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportedUserId={otherUser.id}
          matchId={id}
        />
      )}
    </div>
  )
}
