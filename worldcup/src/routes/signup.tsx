import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PageShell, Eyebrow } from '@/components/AppShell'
import { ArrowRight, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/signup')({
  head: () => ({
    meta: [
      { title: 'Sign Up — ScoreBattle' },
      { name: 'description', content: 'Create your ScoreBattle account' },
    ],
  }),
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate({ to: '/profile' })
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)

    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Eyebrow tone="tomato">Join the league</Eyebrow>
            <h1 className="mt-4 font-display font-black text-5xl leading-[0.95]">
              Create your<br />
              <span className="italic">account.</span>
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 h-12 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition flex items-center justify-center gap-2 stamp disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-paper text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="mt-4 w-full px-6 h-12 rounded-full border-2 border-ink bg-paper font-medium hover:bg-sunshine/40 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground font-medium underline hover:text-tomato">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  )
}
