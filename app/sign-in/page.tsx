import { getSession } from '@/lib/simple-auth'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect('/')
  return <AuthForm mode="sign-in" />
}
