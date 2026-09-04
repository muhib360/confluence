'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface QueuedTopic {
  id: string
  topic: string
  created_at: string
  status: string
}

interface ActiveConversation {
  matchId: string
  otherUser: {
    display_name: string
    avatar_svg: string
  }
  topic: string
  lastMessage: string | null
  lastMessageAt: string | null
  unread: boolean
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const then = new Date(dateString)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDays}d ago`
}

export default function ChatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [queuedTopics, setQueuedTopics] = useState<QueuedTopic[]>([])
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch queued topics (status = 'searching')
      const { data: queues } = await supabase
        .from('queues')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'searching')
        .order('created_at', { ascending: false })

      if (queues) setQueuedTopics(queues)

      // Fetch active matches (accepted or pending)
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .in('status', ['accepted', 'pending'])
        .order('created_at', { ascending: false })

      if (matches && matches.length > 0) {
        const conversations: ActiveConversation[] = []

        for (const match of matches) {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_svg')
            .eq('id', otherId)
            .single()

          // Fetch last message
          const { data: lastMsgs } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const lastMsg = lastMsgs && lastMsgs.length > 0 ? lastMsgs[0] : null

          conversations.push({
            matchId: match.id,
            otherUser: profile || { display_name: 'Unknown', avatar_svg: '' },
            topic: match.topic,
            lastMessage: lastMsg?.content || null,
            lastMessageAt: lastMsg?.created_at || match.created_at,
            unread: false, // Could be computed if we had read receipts
          })
        }

        setActiveConversations(conversations)
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  const handleCancelQueue = async (queueId: string) => {
    setCancellingId(queueId)
    const supabase = createClient()
    await supabase.from('queues').delete().eq('id', queueId)
    setQueuedTopics(prev => prev.filter(q => q.id !== queueId))
    setCancellingId(null)
  }

  const totalCount = queuedTopics.length + activeConversations.length
  const hasContent = totalCount > 0
  const isEmpty = !loading && !hasContent

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─── */}
      <header
        className="flex justify-between items-center px-6 sm:px-10 py-4"
        style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
      >
        <Link
          href="/"
          className="font-serif font-semibold text-2xl tracking-tight transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          Confluence
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/chats"
            className="flex items-center gap-2 px-3 py-1.5 rounded font-sans text-[13px] font-medium tracking-wide text-primary transition-colors"
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
              {totalCount}
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

      {/* ─── Page Content ─── */}
      <main className="flex-1 fade-in-up p-6 max-w-[720px] mx-auto w-full">
        {/* Title Section */}
        <div className="mb-0">
          <h1
            className="font-serif font-semibold mb-3"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--color-primary)',
            }}
          >
            Chats &amp; Queue
          </h1>
          <p
            className="font-serif text-on-surface-variant"
            style={{ fontSize: '16px', lineHeight: '24px' }}
          >
            Topics you&apos;re waiting on, and conversations you&apos;ve started.
          </p>
        </div>

        {/* Divider */}
        <div
          className="my-6"
          style={{
            height: '1px',
            background: 'linear-gradient(to right, var(--color-outline-variant), transparent)',
          }}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div
            className="mt-12 mx-auto"
            style={{
              maxWidth: '520px',
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '0.5rem',
              padding: '3rem 2rem',
              boxShadow: '0 2px 24px rgba(3, 33, 33, 0.03)',
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-5 flex items-center justify-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-container)',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-primary-container)' }}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h2
                className="font-serif font-medium mb-3"
                style={{
                  fontSize: '20px',
                  lineHeight: '28px',
                  color: 'var(--color-on-surface)',
                }}
              >
                A quiet archive
              </h2>
              <p
                className="font-serif mb-6"
                style={{
                  fontSize: '15px',
                  lineHeight: '22px',
                  color: 'var(--color-on-surface-variant)',
                  maxWidth: '360px',
                }}
              >
                When no topics are queued or conversations active: enter a topic on the home screen to begin your next discourse.
              </p>
              <Link
                href="/"
                className="font-sans font-semibold text-[14px] tracking-wide hover:opacity-70 transition-opacity inline-flex items-center gap-1.5"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Return to inquiry
                <span style={{ fontSize: '16px' }}>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* ─── Populated State ─── */}
        {!loading && hasContent && (
          <>
            {/* ── Queued Topics Section ── */}
            {queuedTopics.length > 0 && (
              <section className="mt-6 mb-12">
                <div className="flex items-baseline justify-between mb-1">
                  <h2
                    className="font-serif font-medium"
                    style={{
                      fontSize: '20px',
                      lineHeight: '28px',
                      color: 'var(--color-on-surface)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--color-outline-variant)',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    Queued Topics{' '}
                    <span
                      className="font-sans font-normal"
                      style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}
                    >
                      ({queuedTopics.length})
                    </span>
                  </h2>
                </div>
                <p
                  className="font-sans mb-6"
                  style={{
                    fontSize: '13px',
                    lineHeight: '18px',
                    color: 'var(--color-on-surface-variant)',
                  }}
                >
                  Waiting for an intellectual match
                </p>

                <div className="flex flex-col gap-4">
                  {queuedTopics.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        backgroundColor: 'var(--color-surface-container-lowest)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '0.375rem',
                        padding: '1.25rem 1.5rem',
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status + Time */}
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-sans"
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                backgroundColor: 'var(--color-primary-container)',
                                color: 'var(--color-on-primary)',
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#6fcf97',
                                  display: 'inline-block',
                                }}
                              />
                              Waiting for a match
                            </span>
                            <span
                              className="font-sans"
                              style={{
                                fontSize: '12px',
                                color: 'var(--color-on-surface-variant)',
                              }}
                            >
                              queued {timeAgo(q.created_at)}
                            </span>
                          </div>
                          {/* Topic */}
                          <p
                            className="font-serif"
                            style={{
                              fontSize: '16px',
                              lineHeight: '24px',
                              color: 'var(--color-on-surface)',
                            }}
                          >
                            &ldquo;{q.topic}&rdquo;
                          </p>
                        </div>
                        {/* Cancel Button */}
                        <button
                          onClick={() => handleCancelQueue(q.id)}
                          disabled={cancellingId === q.id}
                          className="font-sans shrink-0 hover:opacity-70 transition-opacity"
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--color-on-surface-variant)',
                            background: 'none',
                            border: 'none',
                            marginTop: '2px',
                          }}
                        >
                          {cancellingId === q.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Limit notice */}
                <p
                  className="mt-4 text-right font-serif italic"
                  style={{
                    fontSize: '13px',
                    lineHeight: '18px',
                    color: 'var(--color-on-tertiary-container)',
                  }}
                >
                  Limit 3 queued topics at a time.
                </p>
              </section>
            )}

            {/* ── Active Discourse Section ── */}
            {activeConversations.length > 0 && (
              <section className="mb-12">
                <div className="flex items-baseline justify-between mb-1">
                  <h2
                    className="font-serif font-medium"
                    style={{
                      fontSize: '20px',
                      lineHeight: '28px',
                      color: 'var(--color-on-surface)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--color-outline-variant)',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    Active Discourse{' '}
                    <span
                      className="font-sans font-normal"
                      style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}
                    >
                      ({activeConversations.length})
                    </span>
                  </h2>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-primary-container)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--color-primary-container)',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    1:1 Ongoing Exchanges
                  </span>
                </div>

                <div
                  className="mt-6"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                  }}
                >
                  {activeConversations.map((conv, idx) => (
                    <Link
                      key={conv.matchId}
                      href={`/chat/${conv.matchId}`}
                      className="block transition-colors hover:bg-surface-container-low"
                      style={{
                        padding: '1.25rem 1rem',
                        borderBottom:
                          idx < activeConversations.length - 1
                            ? '1px solid var(--color-outline-variant)'
                            : 'none',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                          style={{
                            backgroundColor: 'var(--color-surface-container)',
                          }}
                        >
                          {conv.otherUser.avatar_svg ? (
                            <div
                              className="w-full h-full flex items-center justify-center opacity-80"
                              dangerouslySetInnerHTML={{ __html: conv.otherUser.avatar_svg }}
                            />
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              style={{ color: 'var(--color-on-surface-variant)' }}
                            >
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="4" />
                              <line x1="12" y1="2" x2="12" y2="6" />
                              <line x1="12" y1="18" x2="12" y2="22" />
                              <line x1="2" y1="12" x2="6" y2="12" />
                              <line x1="18" y1="12" x2="22" y2="12" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row: user + topic + time */}
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <p
                              className="font-sans truncate"
                              style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: 'var(--color-on-surface)',
                              }}
                            >
                              <span className="font-semibold">
                                @{conv.otherUser.display_name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                              </span>
                              <span
                                className="mx-1.5"
                                style={{ color: 'var(--color-outline)' }}
                              >
                                ·
                              </span>
                              <span
                                style={{
                                  color: 'var(--color-primary-container)',
                                  fontWeight: 500,
                                }}
                              >
                                {conv.topic}
                              </span>
                            </p>
                            <span
                              className="font-sans shrink-0 flex items-center gap-1.5"
                              style={{
                                fontSize: '12px',
                                color: 'var(--color-on-surface-variant)',
                              }}
                            >
                              {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}
                              {conv.unread && (
                                <span
                                  style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    display: 'inline-block',
                                  }}
                                />
                              )}
                            </span>
                          </div>
                          {/* Last message preview */}
                          {conv.lastMessage && (
                            <p
                              className="font-serif truncate"
                              style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: 'var(--color-primary-container)',
                              }}
                            >
                              &ldquo;{conv.lastMessage}&rdquo;
                            </p>
                          )}
                          {!conv.lastMessage && (
                            <p
                              className="font-serif italic"
                              style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: 'var(--color-on-surface-variant)',
                                opacity: 0.6,
                              }}
                            >
                              No messages yet — begin the discourse.
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
