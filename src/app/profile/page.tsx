'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setBio(data.bio || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ bio }).eq('id', profile.id)
    setSaving(false)
    router.push('/')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen p-6 font-serif flex items-center justify-center text-xl">Loading...</div>

  return (
    <div className="min-h-screen p-6 max-w-[720px] mx-auto">
      <header className="flex justify-between items-center mb-12 mt-6">
        <button onClick={() => router.push('/')} className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">← Back to Confluence</button>
        <button onClick={handleLogout} className="font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors">Log out</button>
      </header>

      <main className="fade-in-up">
        <h2 className="font-serif text-[32px] font-semibold mb-12">Your Identity</h2>

        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container flex items-center justify-center opacity-80" dangerouslySetInnerHTML={{ __html: profile?.avatar_svg }} />
          <div>
            <h3 className="font-serif text-2xl font-medium">{profile?.display_name}</h3>
            <p className="font-sans text-sm text-on-surface-variant uppercase tracking-widest mt-1">Abstract Sigil</p>
          </div>
        </div>

        <div className="mb-12">
          <label className="input-label mb-4">Your Bio</label>
          <textarea 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-6 text-on-surface font-serif text-lg leading-relaxed focus:outline-none focus:border-primary min-h-[160px] transition-colors"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button onClick={handleSave} disabled={saving || bio === profile?.bio} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </main>
    </div>
  )
}
