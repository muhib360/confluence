'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      setEmail(user.email || '')
      setProvider(user.app_metadata.provider || 'email')

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData)
        setDisplayName(profileData.display_name || '')
      }

      const { data: blocks } = await supabase.from('blocks').select('*')
      if (blocks && blocks.length > 0) {
        const blockedIds = blocks.map(b => b.blocked_id)
        const { data: blockedProfiles } = await supabase.from('profiles').select('id, display_name').in('id', blockedIds)
        if (blockedProfiles) {
          const combined = blocks.map(b => ({
            ...b,
            profile: blockedProfiles.find(p => p.id === b.blocked_id)
          }))
          setBlockedUsers(combined)
        }
      }

      setLoading(false)
    }
    loadData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage('')
    
    if (profile && displayName !== profile.display_name) {
      await supabase.from('profiles').update({ display_name: displayName }).eq('id', profile.id)
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (provider === 'email' && email !== user?.email) {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your new email inbox to confirm the change.')
      }
    } else {
      setMessage('Profile updated successfully.')
    }
    
    setSaving(false)
  }

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }
    
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated successfully.')
      setPassword('')
      setConfirmPassword('')
    }
  }

  const handleUnblock = async (blockId: string) => {
    await supabase.from('blocks').delete().eq('id', blockId)
    setBlockedUsers(prev => prev.filter(b => b.id !== blockId))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen p-6 font-serif flex items-center justify-center text-xl">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full top-0 bg-surface border-b border-primary/10 sticky z-50">
        <div className="flex justify-between items-center max-w-[720px] mx-auto px-6 py-6 md:px-0 md:py-6">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:opacity-80 transition-opacity flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="font-sans font-medium text-sm">Back</span>
          </button>
          <div className="font-serif font-semibold text-3xl md:text-5xl text-primary tracking-tight">Confluence</div>
          <div className="flex gap-4">
            <Link href="/profile" className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity cursor-pointer">account_circle</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[720px] mx-auto px-6 md:px-0 py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-12">Settings</h1>

        {message && (
          <div className="bg-surface-container-low border border-primary/20 text-primary p-4 rounded mb-8 font-serif">
            {message}
          </div>
        )}

        <section className="mb-12 pb-12 border-b border-primary/10">
          <h2 className="font-serif text-2xl text-primary mb-6">Account</h2>
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-1">
              <label className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="display-name">Display Name</label>
              <input 
                id="display-name" 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full max-w-md bg-transparent border-0 border-b border-primary/20 rounded-none px-0 py-2 focus:ring-0 focus:border-primary font-serif text-lg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={provider !== 'email'}
                className={`w-full max-w-md bg-transparent border-0 border-b rounded-none px-0 py-2 focus:ring-0 font-serif text-lg ${provider === 'email' ? 'border-primary/20 focus:border-primary' : 'border-outline-variant/30 text-on-surface-variant/70'}`}
              />
            </div>

            <div className="mt-2">
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-auto inline-flex px-8">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="mt-6 bg-surface-container-low p-6 rounded">
              {provider === 'email' ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-widest mb-2">Change Password</h3>
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full max-w-sm bg-transparent border-0 border-b border-primary/20 rounded-none px-0 py-2 focus:ring-0 focus:border-primary font-serif text-lg"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full max-w-sm bg-transparent border-0 border-b border-primary/20 rounded-none px-0 py-2 focus:ring-0 focus:border-primary font-serif text-lg mb-4"
                  />
                  <button onClick={handleUpdatePassword} disabled={saving || !password} className="btn-secondary w-max px-6">
                    Update Password
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-widest mb-3">Authentication</h3>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary/60">shield</span>
                    <p className="font-serif text-lg text-on-surface-variant italic">
                      You are signed in via {provider}. Your password can be managed through your {provider} account.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-6">General</h2>
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
              <h3 className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-widest">Blocked Users</h3>
              {blockedUsers.length === 0 ? (
                <p className="font-serif text-on-surface-variant italic">No blocked users.</p>
              ) : (
                <ul className="flex flex-col gap-4 mt-2">
                  {blockedUsers.map(block => (
                    <li key={block.id} className="flex justify-between items-center bg-surface-container-low p-4 rounded border border-primary/5">
                      <span className="font-serif text-lg">{block.profile?.display_name || 'Unknown User'}</span>
                      <button 
                        onClick={() => handleUnblock(block.id)}
                        className="font-sans font-medium text-sm text-secondary hover:text-primary transition-colors border border-secondary/20 px-4 py-2 rounded hover:bg-secondary/5"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-12 pt-6 border-t border-error/10 flex flex-col items-start gap-4">
              <button 
                onClick={handleSignOut}
                className="font-sans font-medium text-sm text-on-primary bg-primary-container px-6 py-3 rounded hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
              <Link 
                href="/settings/delete-account"
                className="font-sans font-medium text-sm text-error hover:text-on-error-container hover:underline transition-all mt-4"
              >
                Delete Account
              </Link>
            </div>

          </div>
        </section>
      </main>

      <footer className="w-full mt-12 bg-surface-container-low border-t border-primary/5 py-12">
        <div className="flex flex-col items-center gap-6 max-w-[720px] mx-auto text-center px-6">
          <div className="font-serif text-3xl font-semibold text-primary">Confluence</div>
          <p className="font-serif text-secondary mt-4">© 2024 Confluence. Designed for intentionality.</p>
        </div>
      </footer>
    </div>
  )
}
