'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  confirm: (opts: { title: string; message: string; onConfirm: () => void; danger?: boolean }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ---- Individual Toast Item ----
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  useEffect(() => {
    const dur = toast.duration ?? 4000
    if (dur > 0) {
      timerRef.current = setTimeout(dismiss, dur)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.duration, dismiss])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />,
    error:   <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
    info:    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />,
  }

  const styles: Record<ToastType, string> = {
    success: 'border-green-700/40 bg-green-950/80',
    error:   'border-red-700/40 bg-red-950/80',
    warning: 'border-amber-700/40 bg-amber-950/80',
    info:    'border-blue-700/40 bg-blue-950/80',
  }

  const accents: Record<ToastType, string> = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    warning: 'bg-amber-500',
    info:    'bg-blue-500',
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border backdrop-blur-sm shadow-2xl shadow-black/50 flex gap-3 pr-10 pl-4 py-3.5 min-w-[280px] max-w-sm transition-all duration-300 ${styles[toast.type]} ${exiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accents[toast.type]}`} />
      
      <div className="mt-0.5">{icons[toast.type]}</div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>

      <button
        onClick={dismiss}
        className="absolute right-2.5 top-2.5 rounded-md p-0.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* progress bar */}
      {(toast.duration ?? 4000) > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${accents[toast.type]} opacity-40`}
          style={{
            animation: `gymbro-toast-progress ${toast.duration ?? 4000}ms linear forwards`
          }}
        />
      )}
    </div>
  )
}

// ---- Confirm Dialog ----
interface ConfirmState {
  title: string
  message: string
  onConfirm: () => void
  danger?: boolean
}

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* top accent */}
        <div className={`h-0.5 w-full ${state.danger ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-orange-600 to-amber-400'}`} />
        <div className="p-6">
          <h3 className="text-base font-bold text-white mb-2">{state.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{state.message}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => { state.onConfirm(); onClose() }}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors ${state.danger ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-500 hover:bg-orange-400'}`}
            >
              {state.danger ? 'Hapus' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Provider ----
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]) // max 5 at a time
  }, [])

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error:   (title, message) => addToast({ type: 'error',   title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info:    (title, message) => addToast({ type: 'info',    title, message }),
    confirm: (opts) => setConfirmState(opts),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-4 z-[150] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      )}

      {/* keyframe injection */}
      <style>{`
        @keyframes gymbro-toast-progress {
          from { transform: scaleX(1); transform-origin: left; }
          to   { transform: scaleX(0); transform-origin: left; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
