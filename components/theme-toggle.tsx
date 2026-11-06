'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

const key = 'gymbro_theme'
const eventName = 'gymbro-theme-change'

function savedTheme() {
  try { return localStorage.getItem(key) } catch { return null }
}

function applyTheme(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.dataset.theme = dark ? 'dark' : 'light'
  root.style.colorScheme = root.dataset.theme
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const syncPreference = () => {
    const saved = savedTheme()
    applyTheme(saved === 'dark' || (saved !== 'light' && media.matches))
    onChange()
  }
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) syncPreference() }
  window.addEventListener(eventName, onChange)
  window.addEventListener('storage', onStorage)
  media.addEventListener('change', syncPreference)
  return () => {
    window.removeEventListener(eventName, onChange)
    window.removeEventListener('storage', onStorage)
    media.removeEventListener('change', syncPreference)
  }
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === 'dark', () => false)
  const label = dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
  return <button type="button" className="theme-toggle" aria-label={label} title={label} aria-pressed={dark} onClick={() => {
    applyTheme(!dark)
    try { localStorage.setItem(key, dark ? 'light' : 'dark') } catch {}
    window.dispatchEvent(new Event(eventName))
  }}>{dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button>
}
