'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SUGGESTIONS = [
  'A book I just finished...',
  'An idea I can\'t stop thinking about...',
  'Something I disagree with people about...',
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [initialPrompt, setInitialPrompt] = useState('')
  const [followUpQ, setFollowUpQ] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Auto-resize textareas
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
    }
  }, [step])

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 'forward' : 'back')
    setStep(nextStep)
  }

  const handleStep1 = async () => {
    if (!initialPrompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/followup', {
        method: 'POST',
        body: JSON.stringify({ initialPrompt }),
      })
      const data = await res.json()
      setFollowUpQ(data.question)
      goTo(2)
    } catch {
      setFollowUpQ("What specific aspect of that fascinates you the most?")
      goTo(2)
    }
    setLoading(false)
  }

  const handleStep2 = async () => {
    if (!followUpAnswer.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/compile', {
        method: 'POST',
        body: JSON.stringify({ initialPrompt, followUpAnswer }),
      })
      const data = await res.json()
      setBio(data.bio)
      goTo(3)
    } catch {
      setBio(initialPrompt)
      goTo(3)
    }
    setLoading(false)
  }

  const handleFinish = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, bio })
    }
    router.push('/')
  }

  const handleSuggestion = (text: string) => {
    setInitialPrompt(prev => prev ? prev + '\n\n' + text + ' ' : text + ' ')
    textareaRef.current?.focus()
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  // Progress bar width
  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%'

  return (
    <>
      <style>{`
        .onboarding-btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 0.25rem;
          border: none;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 20px;
          background: var(--color-primary-container);
          color: var(--color-on-primary);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .onboarding-btn-primary:hover:not(:disabled) {
          background: var(--color-primary);
          box-shadow: 0 4px 20px rgba(3, 33, 33, 0.25);
          transform: translateY(-1px);
        }
        .onboarding-btn-primary:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(3, 33, 33, 0.2);
        }
        .onboarding-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .onboarding-btn-finish {
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          border: none;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 20px;
          background: var(--color-primary-container);
          color: var(--color-surface-container-lowest);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .onboarding-btn-finish:hover:not(:disabled) {
          background: var(--color-primary);
          box-shadow: 0 4px 20px rgba(3, 33, 33, 0.25);
          transform: translateY(-1px);
        }
        .onboarding-btn-finish:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(3, 33, 33, 0.2);
        }
        .onboarding-btn-finish:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center antialiased"
        style={{ background: 'var(--color-background)', color: 'var(--color-on-background)' }}
      >
        <main className="flex-1 w-full max-w-[720px] px-5 md:px-0 py-12 mx-auto flex flex-col justify-center">

        {/* Progress Indicator */}
        <div className="w-full flex items-center justify-between mb-12 opacity-80">
          <span
            className="uppercase tracking-widest text-xs whitespace-nowrap"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em', fontWeight: 500, fontSize: '13px' }}
          >
            Step {step} of 3
          </span>
          <div
            className="flex-1 ml-4 h-[2px] rounded-full overflow-hidden"
            style={{ background: 'rgba(3,33,33,0.1)' }}
          >
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{ width: progressWidth, background: '#e4c199' }}
            />
          </div>
        </div>

        {/* ─── Step 1: Opening Prompt ─── */}
        {step === 1 && (
          <div
            key="step1"
            className="flex flex-col flex-1"
            style={{ animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.5s ease-out both` }}
          >
            <label
              htmlFor="onboarding-input"
              className="block mb-6 leading-tight max-w-[600px]"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--color-on-background)',
              }}
            >
              What's something you've been reading, thinking about, or stuck on lately?
            </label>

            <div className="relative mb-3">
              <textarea
                ref={textareaRef}
                id="onboarding-input"
                className="w-full bg-transparent border-0 border-b px-0 py-4 resize-none focus:outline-none transition-colors"
                style={{
                  borderBottomWidth: '1px',
                  borderColor: 'rgba(3,33,33,0.2)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'var(--color-on-background)',
                }}
                placeholder="Start typing your thoughts here..."
                rows={3}
                value={initialPrompt}
                onChange={(e) => { setInitialPrompt(e.target.value); autoResize(e) }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(3,33,33,0.6)' }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(3,33,33,0.2)' }}
              />
            </div>

            {/* Suggestion pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2 rounded-full border bg-transparent transition-colors whitespace-nowrap"
                  style={{
                    borderColor: 'rgba(3,33,33,0.15)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--color-surface-container-low)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Action */}
            <div className="mt-auto flex justify-end pt-6">
              <button
                onClick={handleStep1}
                disabled={loading || !initialPrompt.trim()}
                className="onboarding-btn-primary group"
              >
                {loading ? 'Thinking…' : 'Next'}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: AI Follow-up ─── */}
        {step === 2 && (
          <div
            key="step2"
            className="flex flex-col flex-1"
            style={{ animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.5s ease-out both` }}
          >
            {/* AI-generated question as large display text */}
            <h1
              className="mb-6 leading-tight max-w-[90%]"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--color-primary)',
              }}
            >
              {followUpQ}
            </h1>

            {/* Response input */}
            <div className="w-full relative group">
              <textarea
                ref={textareaRef}
                id="userResponse"
                className="w-full bg-transparent border-0 border-b-2 resize-none py-3 focus:outline-none transition-colors leading-relaxed"
                style={{
                  borderColor: 'rgba(193,200,199,0.3)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'var(--color-on-surface)',
                  minHeight: '150px',
                }}
                placeholder="Reflect on your recent findings..."
                value={followUpAnswer}
                onChange={(e) => { setFollowUpAnswer(e.target.value); autoResize(e) }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-primary)' }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(193,200,199,0.3)' }}
              />
              {/* Animated underline */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 ease-out group-focus-within:w-full"
                style={{ background: 'var(--color-primary)' }}
              />
            </div>

            {/* Action */}
            <div className="mt-12 flex justify-end w-full">
              <button
                onClick={handleStep2}
                disabled={loading || !followUpAnswer.trim()}
                className="onboarding-btn-primary group"
              >
                {loading ? 'Compiling…' : 'Continue'}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Bio Confirmation ─── */}
        {step === 3 && (
          <div
            key="step3"
            className="flex flex-col gap-12 flex-1"
            style={{ animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.5s ease-out both` }}
          >
            {/* Header */}
            <header className="flex flex-col gap-3">
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(32px, 4vw, 48px)',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-primary)',
                }}
              >
                Confirm your bio
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'var(--color-on-surface-variant)',
                  maxWidth: '65ch',
                }}
              >
                This is how you will be introduced to the community. You can refine it now or later.
              </p>
            </header>

            {/* Bio card */}
            <div
              className="relative w-full rounded-lg p-6 flex flex-col gap-6 transition-all duration-300 ease-in-out group"
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid rgba(3,33,33,0.1)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-high)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-low)' }}
            >
              <div className="flex justify-between items-start">
                <span
                  className="uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: 'var(--color-outline)',
                  }}
                >
                  AI Compiled Bio
                </span>
              </div>
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'var(--color-primary)',
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setBio(e.currentTarget.textContent || bio)}
              >
                {bio}
              </p>
              <div
                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--color-outline)',
                }}
              >
                Click text to edit
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end items-center gap-6 pt-6">
              <button
                onClick={handleFinish}
                disabled={loading}
                className="onboarding-btn-finish focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {loading ? 'Saving…' : 'Looks good'}
              </button>
            </div>
          </div>
        )}
        </main>

        {/* Slide transition animations */}
        <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(40px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  )
}
