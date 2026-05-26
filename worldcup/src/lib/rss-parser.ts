import { createClient } from './supabase/client'

interface RSSItem {
  title: string
  description: string
  pubDate: string
  link: string
}

interface MatchUpdate {
  home_score?: number
  away_score?: number
  status: 'live' | 'finished' | 'scheduled'
  minute?: number
}

// Parse RSS feed content
export function parseRSSFeed(xmlContent: string): RSSItem[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'text/xml')
  const items = doc.querySelectorAll('item')
  
  const parsed: RSSItem[] = []
  
  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent || ''
    const description = item.querySelector('description')?.textContent || ''
    const pubDate = item.querySelector('pubDate')?.textContent || ''
    const link = item.querySelector('link')?.textContent || ''
    
    if (title) {
      parsed.push({ title, description, pubDate, link })
    }
  })
  
  return parsed
}

// Extract match score from RSS item title/description
export function extractMatchScore(item: RSSItem): MatchUpdate | null {
  const text = `${item.title} ${item.description}`.toLowerCase()
  
  // Look for score patterns like "2-1", "3 - 0", etc.
  const scorePattern = /(\d+)\s*[-–]\s*(\d+)/
  const match = text.match(scorePattern)
  
  if (!match) return null
  
  const homeScore = parseInt(match[1])
  const awayScore = parseInt(match[2])
  
  // Determine match status
  let status: 'live' | 'finished' | 'scheduled' = 'scheduled'
  if (text.includes('full time') || text.includes('ft') || text.includes('final')) {
    status = 'finished'
  } else if (text.includes('live') || text.includes('playing')) {
    status = 'live'
  }
  
  // Extract minute if live
  const minutePattern = /(\d+)(?:'|’|min)/
  const minuteMatch = text.match(minutePattern)
  const minute = minuteMatch ? parseInt(minuteMatch[1]) : undefined
  
  return {
    home_score: homeScore,
    away_score: awayScore,
    status,
    minute,
  }
}

// Extract team names from RSS item
export function extractTeamNames(item: RSSItem): { home: string; away: string } | null {
  const text = item.title
  
  // Try to extract team names from title like "Brazil 2-1 Argentina"
  const scorePattern = /(.+?)\s*\d+\s*[-–]\s*\d+\s*(.+)/
  const match = text.match(scorePattern)
  
  if (!match) return null
  
  const home = match[1].trim()
  const away = match[2].trim()
  
  return { home, away }
}

// Fetch RSS feed from URL
export async function fetchRSSFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ScoreBattle/1.0',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
  }
  
  return await response.text()
}

// Update match in database based on RSS data
export async function updateMatchFromRSS(
  homeTeam: string,
  awayTeam: string,
  update: MatchUpdate
): Promise<boolean> {
  const supabase = createClient()
  
  // Try to find matching match by team names
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`home_team_name.ilike.%${homeTeam}%,away_team_name.ilike.%${homeTeam}%`)
    .or(`home_team_name.ilike.%${awayTeam}%,away_team_name.ilike.%${awayTeam}%`)
    .limit(10)
  
  if (error || !matches || matches.length === 0) {
    console.log('No matching match found for', homeTeam, 'vs', awayTeam)
    return false
  }
  
  // Find the best match (both teams should match)
  const bestMatch = matches.find(
    (m) =>
      (m.home_team_name.toLowerCase().includes(homeTeam.toLowerCase()) &&
        m.away_team_name.toLowerCase().includes(awayTeam.toLowerCase())) ||
      (m.away_team_name.toLowerCase().includes(homeTeam.toLowerCase()) &&
        m.home_team_name.toLowerCase().includes(awayTeam.toLowerCase()))
  )
  
  if (!bestMatch) {
    console.log('No exact match found for', homeTeam, 'vs', awayTeam)
    return false
  }
  
  // Update the match
  const { error: updateError } = await supabase
    .from('matches')
    .update({
      home_score: update.home_score,
      away_score: update.away_score,
      status: update.status,
      minute: update.minute,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bestMatch.id)
  
  if (updateError) {
    console.error('Failed to update match:', updateError)
    return false
  }
  
  console.log('Updated match:', bestMatch.home_team_name, 'vs', bestMatch.away_team_name, '-', update)
  return true
}

// Main function to process RSS feed and update matches
export async function processRSSFeed(url: string): Promise<number> {
  try {
    const xmlContent = await fetchRSSFeed(url)
    const items = parseRSSFeed(xmlContent)
    
    let updatedCount = 0
    
    for (const item of items) {
      const teamNames = extractTeamNames(item)
      if (!teamNames) continue
      
      const scoreUpdate = extractMatchScore(item)
      if (!scoreUpdate) continue
      
      const success = await updateMatchFromRSS(teamNames.home, teamNames.away, scoreUpdate)
      if (success) {
        updatedCount++
      }
    }
    
    return updatedCount
  } catch (error) {
    console.error('Error processing RSS feed:', error)
    return 0
  }
}
