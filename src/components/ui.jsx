import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react'
import { Loader2, X, CheckCircle2, AlertCircle, Search, Inbox } from 'lucide-react'
import { cn } from '../lib/utils'

/* ── Button ─────────────────────────────────────────────── */
const btn = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
  dark: 'bg-ink text-white hover:bg-ink/90',
  outline: 'border border-line bg-white text-ink hover:bg-bg',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dangerGhost: 'text-red-600 hover:bg-red-50',
}
export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, className, children, ...p }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : size === 'icon' ? 'p-2' : 'px-4 py-2 text-sm',
        btn[variant], className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" />}
      {children}
    </button>
  )
}

/* ── Form controls ──────────────────────────────────────── */
const control = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-bg'

export function Field({ label, hint, required, className, children }) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
          {label}{required && <span className="text-brand"> *</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const Input = ({ className, suggestions, ...p }) => {
  const id = useId()
  return (
    <>
      <input {...p} list={suggestions?.length ? id : undefined} className={cn(control, className)} />
      {suggestions?.length > 0 && <datalist id={id}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>}
    </>
  )
}
export const Textarea = ({ className, rows = 4, ...p }) => <textarea rows={rows} {...p} className={cn(control, 'resize-y', className)} />
export const Select = ({ className, options = [], placeholder, ...p }) => (
  <select {...p} className={cn(control, className)}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => {
      const v = typeof o === 'object' ? o.value : o
      const l = typeof o === 'object' ? o.label : o
      return <option key={v} value={v}>{l}</option>
    })}
  </select>
)

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5">
      <button
        type="button" role="switch" aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-brand' : 'bg-ink/20')}
      >
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(control, 'pl-9')} />
    </div>
  )
}

/* ── Badge ──────────────────────────────────────────────── */
const tones = {
  gray: 'bg-ink/5 text-ink/70', green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700', teal: 'bg-teal-light text-teal', brand: 'bg-brand-light text-brand',
}
export const Badge = ({ tone = 'gray', className, children }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', tones[tone], className)}>{children}</span>
)

/* ── Tabs (URL-friendly: controlled by parent) ──────────── */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('overflow-x-auto border-b border-line', className)} role="tablist">
      <div className="flex min-w-max gap-1">
        {tabs.map((t) => {
          const on = t.key === value
          return (
            <button
              key={t.key} role="tab" aria-selected={on} onClick={() => onChange(t.key)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition',
                on ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.icon && <t.icon className="size-4" />}
              {t.label}
              {t.count != null && <span className={cn('rounded-full px-1.5 text-[11px]', on ? 'bg-brand-light' : 'bg-ink/5')}>{t.count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Modal / Drawer ─────────────────────────────────────── */
export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-4xl' : 'sm:max-w-2xl')}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-ink/5" aria-label="Close"><X className="size-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-bg/60 px-6 py-3 sm:rounded-b-2xl">{footer}</footer>}
      </div>
    </div>
  )
}

/* ── Feedback ───────────────────────────────────────────── */
export const Spinner = ({ className }) => <Loader2 className={cn('size-5 animate-spin text-brand', className)} />

export function Empty({ title = 'Nothing here yet', text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-teal-light text-teal"><Inbox className="size-7" /></div>
      <p className="font-extrabold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export const Alert = ({ tone = 'amber', children }) => (
  <div className={cn('rounded-lg px-4 py-3 text-sm font-medium', tones[tone])}>{children}</div>
)

export const Card = ({ className, ...p }) => <div {...p} className={cn('rounded-2xl border border-line bg-white shadow-sm', className)} />

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
)

/* ── Toasts + confirm ───────────────────────────────────── */
const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirm] = useState(null)

  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const confirm = useCallback((opts) => new Promise((resolve) => setConfirm({ ...opts, resolve })), [])
  const close = (v) => { confirmState?.resolve(v); setConfirm(null) }

  return (
    <ToastCtx.Provider value={{ success: (m) => push(m), error: (m) => push(m, 'error'), confirm }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={cn('flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg', t.type === 'error' ? 'bg-red-600' : 'bg-ink')}>
            {t.type === 'error' ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4 text-emerald-400" />}
            {t.message}
          </div>
        ))}
      </div>
      <Modal
        open={!!confirmState} onClose={() => close(false)} title={confirmState?.title || 'Are you sure?'}
        footer={<>
          <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => close(true)}>{confirmState?.confirmLabel || 'Delete'}</Button>
        </>}
      >
        <p className="text-sm text-muted">{confirmState?.message}</p>
      </Modal>
    </ToastCtx.Provider>
  )
}
