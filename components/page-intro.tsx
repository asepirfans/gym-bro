import type { ReactNode } from 'react'

export default function PageIntro({ eyebrow, title, description, children }: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return <section className="page-intro"><div>{eyebrow && <p className="section-caption">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="page-intro-actions">{children}</div>}</section>
}
