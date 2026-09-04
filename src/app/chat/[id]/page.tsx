'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import ReportBlockModal from '@/components/ReportBlockModal'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState('')
  const [otherUser, setOtherUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single()
      if (!match) return router.push('/')

      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherId).single()
      setOtherUser(profile)

      const { data: msgs } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true })
      if (msgs) setMessages(msgs)
    }
    loadData()

    const channel = supabase.channel(`match_${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload: any) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !otherUser) return

    const content = input.trim()
    setInput('')

    const supabase = createClient()
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: userId,
      receiver_id: otherUser.id,
      content
    })
  }

  return (
    <div className="flex flex-col h-screen max-w-[720px] mx-auto bg-surface relative">
      <header className="shrink-0 p-6 border-b border-outline-variant flex items-center justify-between bg-surface/90 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="font-sans text-sm text-on-surface-variant hover:text-primary">← Leave</button>
          {otherUser && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center opacity-80" dangerouslySetInnerHTML={{ __html: otherUser.avatar_svg }} />
              <span className="font-serif font-medium">{otherUser.display_name}</span>
            </div>
          )}
        </div>
        
        {otherUser && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none p-2"
          >
            <span className="material-symbols-outlined text-[20px]">flag</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-4 rounded-lg font-serif text-[16px] leading-relaxed ${isMe ? 'bg-primary-container text-on-primary-container rounded-tr-sm' : 'bg-surface-container text-on-surface rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="shrink-0 p-6 bg-surface/90 backdrop-blur border-t border-outline-variant">
        <form onSubmit={handleSend} className="flex gap-4 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-full px-6 py-3 font-serif focus:outline-none focus:border-primary transition-colors"
          />
          <button type="submit" disabled={!input.trim()} className="btn-primary rounded-full px-6 py-3">Send</button>
        </form>
      </footer>
      
      {otherUser && (
        <ReportBlockModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportedUserId={otherUser.id}
          matchId={matchId}
        />
      )}
    </div>
  )
}
