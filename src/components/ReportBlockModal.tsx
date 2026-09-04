'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  matchId?: string
}

type ModalState = 'initial' | 'report' | 'block' | 'success'

export default function ReportBlockModal({ isOpen, onClose, reportedUserId, matchId }: Props) {
  const [state, setState] = useState<ModalState>('initial')
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleClose = () => {
    setState('initial')
    setReportReason('')
    setReportDetails('')
    onClose()
  }

  const handleBlock = async () => {
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('blocks').insert({
        blocker_id: user.id,
        blocked_id: reportedUserId
      })
    }
    
    setIsSubmitting(false)
    handleClose()
    router.push('/')
  }

  const handleReport = async () => {
    if (!reportReason) return
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: reportedUserId,
        reason: reportReason,
        note: reportDetails,
        match_id: matchId || null
      })
    }
    
    setIsSubmitting(false)
    setState('success')
  }

  return (
    <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
      
      <div className="bg-surface w-full max-w-[420px] rounded border border-primary/10 shadow-[0_24px_48px_-12px_rgba(26,28,28,0.1)] relative overflow-hidden flex flex-col" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        
        <button 
          onClick={handleClose}
          aria-label="Close modal" 
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-2 z-10 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* State 1: Initial */}
        {state === 'initial' && (
          <div className="p-6 flex flex-col">
            <div className="mb-6 pb-3 border-b border-primary/5">
              <h2 className="font-serif text-[24px] font-medium text-primary">Discourse Safety</h2>
              <p className="font-sans text-[13px] tracking-[0.05em] font-medium text-on-surface-variant mt-1">Select an action to proceed.</p>
            </div>
            <ul className="flex flex-col gap-2">
              <li>
                <button 
                  onClick={() => setState('report')}
                  className="w-full flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors rounded border border-transparent hover:border-primary/5 focus:outline-none focus:ring-1 focus:ring-primary group text-left"
                >
                  <span className="font-serif text-[18px] text-on-surface">Report</span>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setState('block')}
                  className="w-full flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors rounded border border-transparent hover:border-primary/5 focus:outline-none focus:ring-1 focus:ring-primary group text-left"
                >
                  <span className="font-serif text-[18px] text-on-surface">Block</span>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* State 2: Report */}
        {state === 'report' && (
          <div className="p-6 flex flex-col h-full">
            <div className="mb-6 pb-3 border-b border-primary/5 flex items-center gap-3">
              <button 
                onClick={() => setState('initial')}
                aria-label="Back" 
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="font-serif text-[24px] font-medium text-primary m-0">Report</h2>
            </div>
            
            <div className="flex-grow flex flex-col gap-3 overflow-y-auto pb-4">
              <label className="font-sans text-[13px] uppercase tracking-wider text-secondary font-medium">Reason</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 border border-primary/10 rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input 
                    type="radio" 
                    name="report_reason" 
                    value="inappropriate"
                    checked={reportReason === 'inappropriate'}
                    onChange={e => setReportReason(e.target.value)}
                    className="text-primary-container focus:ring-primary border-outline-variant rounded-full"
                  />
                  <span className="font-serif text-[18px] text-on-surface">Inappropriate</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-primary/10 rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input 
                    type="radio" 
                    name="report_reason" 
                    value="unexpected"
                    checked={reportReason === 'unexpected'}
                    onChange={e => setReportReason(e.target.value)}
                    className="text-primary-container focus:ring-primary border-outline-variant rounded-full"
                  />
                  <span className="font-serif text-[18px] text-on-surface">Not what I expected</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-primary/10 rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                  <input 
                    type="radio" 
                    name="report_reason" 
                    value="other"
                    checked={reportReason === 'other'}
                    onChange={e => setReportReason(e.target.value)}
                    className="text-primary-container focus:ring-primary border-outline-variant rounded-full"
                  />
                  <span className="font-serif text-[18px] text-on-surface">Other</span>
                </label>
              </div>
              
              <div className="mt-3">
                <label htmlFor="report_details" className="block font-sans text-[13px] uppercase tracking-wider text-secondary font-medium mb-2">
                  Additional details (optional)
                </label>
                <textarea 
                  id="report_details" 
                  rows={3}
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Please provide context..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-serif text-[18px] text-on-surface resize-none placeholder-outline-variant/60"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-auto pt-3">
              <button 
                onClick={handleReport}
                disabled={!reportReason || isSubmitting}
                className="w-full bg-primary-container text-surface hover:bg-primary transition-colors py-3 px-4 font-sans font-semibold text-[14px] tracking-[0.02em] rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

        {/* State 3: Block */}
        {state === 'block' && (
          <div className="p-6 flex flex-col">
            <div className="mb-6 pb-3 border-b border-primary/5 flex items-center gap-3">
              <button 
                onClick={() => setState('initial')}
                aria-label="Back" 
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="font-serif text-[24px] font-medium text-primary m-0">Block User</h2>
            </div>
            
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-primary/10 flex items-center justify-center mb-3 text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>block</span>
              </div>
              <p className="font-serif text-[18px] text-on-surface-variant max-w-[280px]">
                Block this person?<br />
                <span className="opacity-80">You won't be matched again.</span>
              </p>
            </div>
            
            <div className="flex gap-3 mt-6 pt-3">
              <button 
                onClick={() => setState('initial')}
                className="flex-1 py-3 px-4 font-sans font-semibold text-[14px] text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleBlock}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 font-sans font-semibold text-[14px] text-surface bg-surface-tint hover:bg-secondary transition-colors rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Blocking...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* State 4: Success */}
        {state === 'success' && (
          <div className="p-6 flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface-container-low border border-primary/10 flex items-center justify-center mb-6 text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check_circle</span>
            </div>
            <h2 className="font-serif text-[24px] font-medium text-primary mb-2">Report Submitted</h2>
            <p className="font-serif text-[18px] text-on-surface-variant max-w-[280px] mb-8">
              Thank you for helping keep Confluence safe. We will review this shortly.
            </p>
            <button 
              onClick={handleClose}
              className="w-full bg-primary-container text-surface hover:bg-primary transition-colors py-3 px-4 font-sans font-semibold text-[14px] rounded"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
