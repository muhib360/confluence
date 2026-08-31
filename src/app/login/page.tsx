'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AuthMode = 'options' | 'signin' | 'signup' | 'forgot'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resetFeedback = () => {
    setError('')
    setMessage('')
  }

  const handleGoogle = async () => {
    setLoading(true)
    resetFeedback()
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.')
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetFeedback()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data?.user) {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    resetFeedback()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    resetFeedback()

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset instructions have been sent to your email.')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .editorial-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-outline-variant);
          padding: 0.65rem 0;
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--color-on-surface);
          outline: none;
          transition: border-color 0.2s ease;
        }
        .editorial-input:focus {
          border-bottom-color: var(--color-primary);
        }
        .editorial-input::placeholder {
          color: var(--color-outline);
          opacity: 0.5;
          font-family: var(--font-serif);
          font-style: italic;
        }

        .editorial-label {
          display: block;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-on-surface-variant);
        }

        .auth-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border-radius: 0.375rem;
          border: none;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: var(--color-primary-container);
          color: var(--color-on-primary);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-btn-primary:hover:not(:disabled) {
          background: var(--color-primary);
          box-shadow: 0 4px 16px rgba(3, 33, 33, 0.25);
          transform: translateY(-1px);
        }
        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .auth-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.25rem;
          border-radius: 0.375rem;
          border: 1px solid var(--color-outline-variant);
          background: transparent;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--color-primary);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-btn-secondary:hover {
          background: var(--color-surface-container);
          border-color: var(--color-outline);
          transform: translateY(-1px);
        }
        .auth-btn-secondary:active {
          transform: translateY(0) scale(0.98);
        }

        .auth-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-secondary);
          background: none;
          border: none;
          padding: 0.25rem 0;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(79, 98, 92, 0.35);
          transition: all 0.2s ease;
        }
        .auth-nav-link:hover {
          color: var(--color-primary);
          text-decoration-color: var(--color-primary);
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container"
        style={{ background: 'var(--color-background)', color: 'var(--color-on-background)' }}
      >
        {/* Top Header */}
        <header className="w-full sticky top-0 bg-background/80 backdrop-blur-sm border-b border-outline-variant/20 z-50">
          <div className="flex justify-between items-center px-6 max-w-[720px] mx-auto h-16">
            <button
              onClick={() => { setMode('options'); resetFeedback() }}
              className="text-left font-serif text-2xl font-semibold tracking-tight transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              Confluence
            </button>

            {mode !== 'options' && (
              <button
                onClick={() => { setMode('options'); resetFeedback() }}
                aria-label="Back to options"
                className="text-xs uppercase tracking-widest font-sans font-medium px-3 py-1.5 rounded border border-outline-variant/60 hover:bg-surface-container transition-all flex items-center gap-1.5"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md mx-auto">
            {/* ─────────────────────────────────────────────────────────────
                MODE 1: OPTIONS (Initial Landing)
               ───────────────────────────────────────────────────────────── */}
            {mode === 'options' && (
              <div className="fade-in-up">
                <div className="text-center mb-8">
                  <h1
                    className="text-4xl md:text-5xl font-semibold tracking-tight mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}
                  >
                    Confluence
                  </h1>
                  <p
                    className="text-base md:text-lg max-w-[320px] mx-auto"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface-variant)' }}
                  >
                    Talk to someone who’s thinking about the same thing you are.
                  </p>
                </div>

                <div
                  className="rounded-xl p-8 md:p-10 shadow-[0_4px_30px_rgba(3,33,33,0.03)]"
                  style={{
                    background: 'var(--color-surface-container-low)',
                    border: '1px solid rgba(3, 33, 33, 0.1)',
                  }}
                >
                  <div className="space-y-4">
                    <button
                      onClick={handleGoogle}
                      disabled={loading}
                      className="auth-btn-primary"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-4 my-3">
                      <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)', opacity: 0.6 }} />
                      <span className="text-xs font-semibold tracking-widest font-sans" style={{ color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em' }}>
                        OR
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--color-outline-variant)', opacity: 0.6 }} />
                    </div>

                    <button
                      onClick={() => { setMode('signin'); resetFeedback() }}
                      className="auth-btn-secondary"
                    >
                      Continue with Email
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => { setMode('signup'); resetFeedback() }}
                    className="auth-nav-link"
                  >
                    New to Confluence? Create account
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODE 2: EMAIL SIGN IN
               ───────────────────────────────────────────────────────────── */}
            {mode === 'signin' && (
              <div className="fade-in-up">
                <div className="text-center mb-8">
                  <h1
                    className="text-3xl md:text-5xl font-semibold tracking-tight mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}
                  >
                    Sign In
                  </h1>
                  <p
                    className="text-base md:text-lg italic opacity-85"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface-variant)' }}
                  >
                    Return to the discourse.
                  </p>
                </div>

                <div
                  className="rounded-xl p-8 md:p-10 shadow-[0_4px_30px_rgba(3,33,33,0.03)]"
                  style={{
                    background: 'var(--color-surface-container-low)',
                    border: '1px solid rgba(3, 33, 33, 0.1)',
                  }}
                >
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                      <label htmlFor="signin-email" className="editorial-label mb-2">
                        Email Address
                      </label>
                      <input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="name@example.com"
                        className="editorial-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="signin-password" className="editorial-label mb-2">
                        Password
                      </label>
                      <input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="editorial-input"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); resetFeedback() }}
                          className="text-xs font-serif italic text-secondary hover:text-primary transition-colors underline underline-offset-2"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-error)' }}>
                        {error}
                      </p>
                    )}
                    {message && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-secondary)' }}>
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary mt-2"
                    >
                      {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); resetFeedback() }}
                    className="auth-nav-link font-semibold uppercase tracking-wider text-xs"
                  >
                    New to Confluence? Create account
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODE 3: EMAIL SIGN UP (Stitch Screen Design)
               ───────────────────────────────────────────────────────────── */}
            {mode === 'signup' && (
              <div className="fade-in-up">
                <div className="text-center mb-8">
                  <h1
                    className="text-3xl md:text-5xl font-semibold tracking-tight mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}
                  >
                    Join Confluence.
                  </h1>
                  <p
                    className="text-base md:text-lg max-w-[85%] mx-auto leading-relaxed"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface-variant)' }}
                  >
                    Begin your journey into intentional discourse. A quiet space for deeper thought.
                  </p>
                </div>

                <div
                  className="rounded-xl p-8 md:p-10 shadow-[0_4px_30px_rgba(3,33,33,0.03)]"
                  style={{
                    background: 'var(--color-surface-container-low)',
                    border: '1px solid rgba(3, 33, 33, 0.1)',
                  }}
                >
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                      <label htmlFor="signup-email" className="editorial-label mb-2">
                        Email Address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="name@example.com"
                        className="editorial-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="editorial-label mb-2">
                        Choose Password
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="editorial-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-confirm-password" className="editorial-label mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="editorial-input"
                      />
                    </div>

                    {error && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-error)' }}>
                        {error}
                      </p>
                    )}
                    {message && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-secondary)' }}>
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary mt-2"
                    >
                      {loading ? 'Creating Account…' : (
                        <>
                          Create Account
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <p
                        className="text-xs leading-relaxed"
                        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)' }}
                      >
                        By creating an account, you agree to our{' '}
                        <span className="text-primary underline cursor-pointer hover:opacity-80">Philosophy</span> and{' '}
                        <span className="text-primary underline cursor-pointer hover:opacity-80">Privacy Policy</span>.
                      </p>
                    </div>
                  </form>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetFeedback() }}
                    className="auth-nav-link font-semibold uppercase tracking-wider text-xs"
                  >
                    Already have an account? Sign in
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODE 4: FORGOT PASSWORD
               ───────────────────────────────────────────────────────────── */}
            {mode === 'forgot' && (
              <div className="fade-in-up">
                <div className="text-center mb-8">
                  <h1
                    className="text-3xl md:text-5xl font-semibold tracking-tight mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}
                  >
                    Reset Password
                  </h1>
                  <p
                    className="text-base md:text-lg opacity-85"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface-variant)' }}
                  >
                    Enter your email to receive recovery instructions.
                  </p>
                </div>

                <div
                  className="rounded-xl p-8 md:p-10 shadow-[0_4px_30px_rgba(3,33,33,0.03)]"
                  style={{
                    background: 'var(--color-surface-container-low)',
                    border: '1px solid rgba(3, 33, 33, 0.1)',
                  }}
                >
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label htmlFor="forgot-email" className="editorial-label mb-2">
                        Email Address
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="name@example.com"
                        className="editorial-input"
                      />
                    </div>

                    {error && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-error)' }}>
                        {error}
                      </p>
                    )}
                    {message && (
                      <p className="text-sm font-sans" style={{ color: 'var(--color-secondary)' }}>
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary mt-2"
                    >
                      {loading ? 'Sending Instructions…' : 'Send Reset Link'}
                    </button>
                  </form>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); resetFeedback() }}
                    className="auth-nav-link font-semibold uppercase tracking-wider text-xs"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-8 border-t border-outline-variant/20 bg-background">
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 max-w-[720px] mx-auto gap-4 text-xs font-sans">
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              © 2026 Confluence. Intentional Discourse.
            </span>
            <div className="flex gap-6 text-on-surface-variant">
              <span className="cursor-pointer hover:text-primary transition-colors underline underline-offset-4 decoration-1">
                Philosophy
              </span>
              <span className="cursor-pointer hover:text-primary transition-colors underline underline-offset-4 decoration-1">
                Privacy
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
