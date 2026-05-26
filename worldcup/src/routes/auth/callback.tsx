import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/login' })
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}
