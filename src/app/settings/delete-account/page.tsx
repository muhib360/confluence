'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setErrorMsg('')
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }
      
      // Successfully deleted, now sign out and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred during deletion.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-serif">
      <header className="w-full top-0 bg-surface border-b border-primary/10 transition-all z-50">
        <div className="flex justify-between items-center max-w-[720px] mx-auto px-6 py-6 md:px-0">
          <button 
            className="flex items-center gap-2 text-on-surface-variant hover:opacity-80 transition-opacity font-sans text-sm uppercase tracking-wider" 
            onClick={() => router.back()}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <Link href="/" className="font-serif font-semibold text-3xl md:text-5xl text-primary tracking-tight hover:opacity-80 transition-opacity">
            Confluence
          </Link>
          <div className="w-20 hidden md:block"></div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24">
        <article className="max-w-[720px] w-full mx-auto relative">
          <div className="bg-surface-container-low border border-primary/10 rounded-lg p-8 md:p-12 relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(186, 26, 26, 0.05)' }}>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-col gap-12 relative z-10">
              <section className="flex flex-col gap-4 text-center">
                <span className="material-symbols-outlined text-[48px] text-error/80 mx-auto" style={{ fontVariationSettings: "'FILL' 0" }}>delete_forever</span>
                <h1 className="font-serif text-3xl text-primary mt-4">Close Account</h1>
                <p className="font-serif text-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed">
                  Deleting your account is irreversible. Your digital twin, discourse history, and library archives will be permanently erased.
                </p>
                {errorMsg && (
                  <p className="text-error font-sans text-sm mt-2">{errorMsg}</p>
                )}
              </section>

              <section className="flex flex-col gap-6 max-w-sm mx-auto w-full mt-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm font-medium text-on-surface-variant uppercase tracking-wider text-center" htmlFor="confirmDelete">
                    Type 'delete' to confirm
                  </label>
                  <input 
                    id="confirmDelete" 
                    type="text" 
                    placeholder="..." 
                    autoComplete="off"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="bg-transparent border-0 border-b border-outline-variant rounded-none px-0 py-2 text-center font-sans font-medium text-sm text-primary placeholder-on-surface-variant/40 focus:ring-0 focus:border-error transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-4 mt-4">
                  <button 
                    disabled={confirmText.trim().toLowerCase() !== 'delete' || isDeleting}
                    onClick={handleDelete}
                    className="w-full bg-error/10 text-error/50 font-sans font-semibold text-sm py-3 px-6 rounded transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-70 enabled:bg-error enabled:text-on-error enabled:hover:bg-on-error-container enabled:shadow-sm"
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </button>
                  <button 
                    onClick={() => router.back()}
                    className="w-full bg-transparent text-secondary font-sans font-semibold text-sm py-3 px-6 rounded border border-primary/10 hover:bg-surface-container transition-colors duration-200"
                  >
                    Keep my account
                  </button>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>

      <footer className="w-full mt-12 bg-surface-container-low border-t border-primary/5">
        <div className="flex flex-col items-center gap-6 py-12 max-w-[720px] mx-auto text-center px-6">
          <span className="font-serif text-3xl font-semibold text-primary">Confluence</span>
          <p className="font-serif text-secondary mt-4 text-lg opacity-80">
            © 2024 Confluence. Designed for intentionality.
          </p>
        </div>
      </footer>
    </div>
  )
}
