import type { SVGProps } from 'react'

export function GymBroLogo({ className = 'h-10 w-10', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" focusable="false" {...props}>
      <rect width="64" height="64" rx="18" fill="#342b25" />
      <path d="M40 18C33 13 23 15 18 22C12 30 15 41 23 46C29 50 37 48 42 43" stroke="#fff9ef" strokeWidth="6" strokeLinecap="round" />
      <path d="M31 32H54M44 23V41M52 27V37" stroke="#e4a17d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
