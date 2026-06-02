import { useEffect, useState } from 'react'
import { X, Megaphone, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

type Announcement = {
  id: string
  title: string
  body: string
  created_at: string
}

export function AnnouncementModal() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (loading || !user) return

      const { data: latest, error: latestError } = await supabase
        .from('announcements')
        .select('id, title, body, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestError || !latest) return

      const { data: read } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('announcement_id', latest.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!read) setAnnouncement(latest)
    }

    fetchAnnouncement()
  }, [loading, user?.id])

  const handleClose = async () => {
    if (!announcement || !user) return
    setClosing(true)

    await supabase.from('announcement_reads').upsert({
      announcement_id: announcement.id,
      user_id: user.id,
      read_at: new Date().toISOString(),
    }, { onConflict: 'announcement_id,user_id' })

    setAnnouncement(null)
    setClosing(false)
  }

  if (!announcement) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-paper border-2 border-ink rounded-md shadow-paper p-6 md:p-8">
        <button
          onClick={handleClose}
          disabled={closing}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-sunshine/40 transition disabled:opacity-50"
          aria-label="Close announcement"
        >
          {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>

        <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-sunshine border-2 border-ink text-xs font-mono-num uppercase tracking-[0.2em]">
          <Megaphone className="w-4 h-4" /> News
        </div>

        <h2 className="mt-5 font-display font-black text-3xl md:text-4xl leading-tight">
          {announcement.title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm md:text-base text-muted-foreground leading-relaxed">
          {announcement.body}
        </p>

        <button
          onClick={handleClose}
          disabled={closing}
          className="mt-6 w-full px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp disabled:opacity-50"
        >
          {closing ? 'Closing...' : 'Got it'}
        </button>
      </div>
    </div>
  )
}
