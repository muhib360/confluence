'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo } from 'react'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md text-center">
        <h1 className="font-serif text-3xl font-semibold mb-2">Confluence</h1>
        <p className="text-on-surface-variant mb-8 font-sans">Quiet, intentional conversations.</p>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  )
}
