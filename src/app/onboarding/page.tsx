'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [initialPrompt, setInitialPrompt] = useState('')
  const [followUpQ, setFollowUpQ] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

  const handleStep1 = async () => {
    if (!initialPrompt) return
    setLoading(true)
    const res = await fetch('/api/onboarding/followup', {
      method: 'POST',
      body: JSON.stringify({ initialPrompt })
    })
    const data = await res.json()
    setFollowUpQ(data.question)
    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async () => {
    if (!followUpAnswer) return
    setLoading(true)
    const res = await fetch('/api/onboarding/compile', {
      method: 'POST',
      body: JSON.stringify({ initialPrompt, followUpAnswer })
    })
    const data = await res.json()
    setBio(data.bio)
    setLoading(false)
    setStep(3)
  }

  const handleFinish = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold mb-6">Build Your Profile</h2>
        
        {step === 1 && (
          <div className="fade-in-up">
            <label className="input-label">What brings you here? What topics do you want to explore?</label>
            <textarea 
              className="w-full bg-transparent border border-outline-variant rounded p-4 text-on-surface font-serif text-lg focus:outline-none focus:border-primary min-h-[120px] mb-6"
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="I am fascinated by..."
            />
            <button onClick={handleStep1} disabled={loading} className="btn-primary">
              {loading ? 'Thinking...' : 'Next'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in-up">
            <label className="input-label">{followUpQ}</label>
            <textarea 
              className="w-full bg-transparent border border-outline-variant rounded p-4 text-on-surface font-serif text-lg focus:outline-none focus:border-primary min-h-[120px] mb-6"
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
              placeholder="Well, I think..."
            />
            <button onClick={handleStep2} disabled={loading} className="btn-primary">
              {loading ? 'Compiling...' : 'Next'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in-up">
            <label className="input-label">Your Compiled Bio</label>
            <div className="p-6 bg-surface-container rounded mb-6 font-serif text-lg leading-relaxed border border-outline-variant opacity-80">
              {bio}
            </div>
            <p className="text-on-surface-variant text-sm mb-6 font-sans">
              Does this look right? You can always edit this later in your profile.
            </p>
            <button onClick={handleFinish} className="btn-primary">
              Enter Confluence
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
