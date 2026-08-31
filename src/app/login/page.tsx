'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

type Mode = 'options' | 'email'

export default function Login() {
  const [mode, setMode] = useState<Mode>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // on success, middleware will redirect
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--color-background)' }}>
      <div
        className="w-full max-w-sm rounded-lg p-10"
        style={{
          background: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
        }}
      >

        {/* Wordmark */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl font-semibold tracking-tight mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}
          >
            Confluence
          </h1>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.15em' }}
          >
            Quiet, intentional conversations
          </p>
        </div>

        {/* Auth options */}
        {mode === 'options' && (
          <div className="space-y-4 fade-in-up">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 text-sm font-semibold rounded"
              style={{
                fontFamily: 'var(--font-sans)',
                background: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)',
                letterSpacing: '0.02em',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
              <span className="text-xs" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.05em' }}>
                OR
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)' }} />
            </div>

            <button
              onClick={() => setMode('email')}
              className="w-full py-3 px-5 text-sm font-semibold rounded border"
              style={{
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-on-surface)',
                borderColor: 'var(--color-outline-variant)',
                background: 'transparent',
                letterSpacing: '0.02em',
              }}
            >
              Continue with Email
            </button>
          </div>
        )}

        {/* Email form */}
        {mode === 'email' && (
          <form onSubmit={handleEmail} className="fade-in-up">
            <div className="mb-8">
              <label
                className="block text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-transparent pb-2 text-lg focus:outline-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-on-surface)',
                  borderBottom: '1px solid var(--color-outline)',
                }}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-10">
              <label
                className="block text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent pb-2 text-lg focus:outline-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-on-surface)',
                  borderBottom: '1px solid var(--color-outline)',
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm mb-6" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-sans)' }}>
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm mb-6" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-sans)' }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 text-sm font-semibold rounded mb-4"
              style={{
                fontFamily: 'var(--font-sans)',
                background: 'var(--color-primary-container)',
                color: 'var(--color-on-primary)',
                letterSpacing: '0.02em',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)' }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
              <button
                type="button"
                onClick={() => { setMode('options'); setError(''); setMessage('') }}
                className="text-sm"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)' }}
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p
          className="text-center text-xs mt-16"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', letterSpacing: '0.03em' }}
        >
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
