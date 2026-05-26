# ScoreBattle - World Cup 2026 Prediction League
## Detailed Implementation Plan

---

## Technology Stack Decisions

### Core Infrastructure
- **Frontend:** TanStack Start (React), TypeScript, Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** Cloudflare Workers
- **Authentication:** Supabase Auth (Email/Password + Google OAuth)
- **Email Service:** Resend
- **AI Predictions:** OpenRouter API (flexible model switching)
- **State Management:** TanStack Query (React Query)
- **Real-time:** Supabase Realtime Subscriptions

### Match Data Strategy: Hybrid Approach

**Schedule: Manual Entry (One-time)**
- All 104 World Cup 2026 matches entered manually
- Public information from FIFA (dates, times, venues, teams)
- One-time setup, never changes
- 100% accurate and reliable

**Live Scores: RSS Feeds**
- RSS feeds for live score updates and final results
- Sources to evaluate:
  - BBC Sport RSS (`http://feeds.bbci.co.uk/sport/football/rss.xml`)
  - ESPN RSS feeds
  - FIFA RSS (if available)
- Automated fetching via cron jobs
- Admin dashboard for manual override if RSS fails

**Benefits:**
- Zero API costs
- Reliable data sources
- Schedule is static and accurate
- Live updates automated via RSS
- Fallback to manual entry if needed

---

## Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  country_code TEXT, -- Flag emoji
  auth_provider TEXT DEFAULT 'email', -- 'email' or 'google'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_code TEXT NOT NULL, -- 3-letter code (MEX, USA, etc.)
  home_team_name TEXT NOT NULL,
  away_team_code TEXT NOT NULL,
  away_team_name TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  stage TEXT NOT NULL, -- 'Group A MD1', 'Quarter Final', etc.
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished', 'postponed'
  home_score INTEGER,
  away_score INTEGER,
  minute INTEGER, -- Current minute if live
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_stage ON matches(stage);
```

#### `predictions`
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  beat_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_points ON predictions(points_earned);
```

#### `groups`
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- 6-character join code
  created_by UUID NOT NULL REFERENCES users(id),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_code ON groups(code);
CREATE INDEX idx_groups_creator ON groups(created_by);
```

#### `group_members`
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

#### `ai_predictions`
```sql
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  confidence INTEGER NOT NULL, -- 0-100
  explanation TEXT,
  model_used TEXT NOT NULL, -- OpenRouter model name
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id)
);

CREATE INDEX idx_ai_predictions_match ON ai_predictions(match_id);
```

#### `notifications` (for email queue)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- 'group_invite', 'match_reminder', 'leaderboard_weekly', 'beat_ai'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Enable Email Auth provider
- [ ] Enable Google OAuth provider
- [ ] Configure email templates
- [ ] Set up Row Level Security (RLS) policies
- [ ] Generate TypeScript types with Supabase CLI

### 1.2 Database Schema Implementation
- [ ] Create all tables with SQL
- [ ] Set up indexes for performance
- [ ] Configure RLS policies:
  - Users can read their own data
  - Users can insert/update their own predictions
  - Groups are readable by members
  - Matches are publicly readable
- [ ] Create database functions:
  - `calculate_prediction_points(match_id, user_id)`
  - `update_leaderboard()`
  - `generate_group_code()`

### 1.3 Authentication System
- [ ] Create login page (`/login`)
- [ ] Create signup page (`/signup`)
- [ ] Implement email/password authentication
- [ ] Implement Google OAuth
- [ ] Create user profile page (`/profile`)
- [ ] Add password reset flow
- [ ] Implement protected route wrapper
- [ ] Add session persistence

### 1.4 User Profile Management
- [ ] Profile editing (username, avatar, country)
- [ ] Avatar upload to Supabase Storage
- [ ] Display user stats on profile
- [ ] User settings page

---

## Phase 2: Core Features (Week 3-4)

### 2.1 Match Data Structure
- [ ] Define match data format
- [ ] Create admin interface for manual schedule entry
- [ ] Import World Cup 2026 schedule (104 matches)
- [ ] Set up team data (codes, names, flags)
- [ ] Create venue data
- [ ] Test schedule entry workflow

### 2.2 Prediction System
- [ ] Create prediction submission API
- [ ] Implement prediction locking mechanism (5 min before kick-off)
- [ ] Add prediction validation (scores >= 0)
- [ ] Create prediction edit functionality (before lock)
- [ ] Display user's predictions on dashboard
- [ ] Add prediction history page

### 2.3 Point Calculation Logic
- [ ] Implement exact score calculation (+3 points)
- [ ] Implement correct outcome calculation (+1 point)
- [ ] Implement "beat the AI" bonus (+1 point)
- [ ] Create database trigger for automatic calculation
- [ ] Update user total points
- [ ] Test point calculation edge cases

### 2.4 Leaderboard System
- [ ] Create global leaderboard query
- [ ] Implement leaderboard pagination
- [ ] Add leaderboard filters (country, region)
- [ ] Create leaderboard caching strategy
- [ ] Display user's rank prominently
- [ ] Add leaderboard trend indicators (up/down/flat)

### 2.5 Dashboard Enhancements
- [ ] Connect dashboard to real data
- [ ] Display live matches with real-time updates
- [ ] Show upcoming matches needing predictions
- [ ] Display recent results with points earned
- [ ] Add user stats summary
- [ ] Implement real-time score updates via Supabase subscriptions

---

## Phase 3: Advanced Features (Week 5-6)

### 3.1 Groups System
- [ ] Create group creation flow
- [ ] Generate unique 6-character group codes
- [ ] Implement group joining via code
- [ ] Create group detail pages
- [ ] Add group standings (separate from global)
- [ ] Implement group member management
- [ ] Add group chat/comments (optional)
- [ ] Create group leaderboard

### 3.2 AI Prediction Integration
- [ ] Set up OpenRouter API client
- [ ] Create AI prediction service
- [ ] Implement pre-tournament analysis
- [ ] Generate per-match predictions
- [ ] Store AI predictions in database
- [ ] Display AI predictions alongside user predictions
- [ ] Add confidence scores and explanations
- [ ] Implement "beat the AI" tracking
- [ ] Create AI comparison dashboard

### 3.3 Real-time Match Updates
- [ ] Research and select RSS feed sources (BBC, ESPN, FIFA)
- [ ] Create RSS feed parser
- [ ] Implement cron job for RSS fetching (every 5 minutes during matches)
- [ ] Parse RSS data and update database
- [ ] Set up Supabase realtime subscriptions for live updates
- [ ] Update UI in real-time for live matches
- [ ] Create admin manual override for score updates
- [ ] Handle RSS feed failures gracefully

### 3.4 Email Notifications
- [ ] Set up Resend API
- [ ] Create email templates:
  - Group invitation email
  - Match reminder (1 hour before)
  - Weekly leaderboard summary
  - "Beat the AI" achievement
- [ ] Implement email queue system
- [ ] Create email preferences in user settings
- [ ] Add unsubscribe functionality
- [ ] Test email deliverability

---

## Phase 4: Polish & Admin (Week 7-8)

### 4.1 Admin Dashboard
- [ ] Create admin authentication
- [ ] Build match management interface
- [ ] Add ability to manually update scores
- [ ] Create user management (ban, promote)
- [ ] Build system analytics dashboard
- [ ] Add dispute resolution tools
- [ ] Create data export functionality

### 4.2 Performance Optimization
- [ ] Implement query optimization
- [ ] Add database query caching
- [ ] Optimize image loading (avatars, flags)
- [ ] Implement lazy loading for leaderboards
- [ ] Add service worker for caching
- [ ] Optimize bundle size

### 4.3 Testing
- [ ] Write unit tests for core functions
- [ ] Add integration tests for API endpoints
- [ ] Test authentication flows
- [ ] Test point calculation logic
- [ ] Perform load testing for leaderboards
- [ ] Test real-time updates
- [ ] Cross-browser testing

### 4.4 Deployment
- [ ] Set up staging environment
- [ ] Configure production Supabase project
- [ ] Set up environment variables
- [ ] Deploy to Cloudflare Workers
- [ ] Configure custom domain
- [ ] Set up monitoring and error tracking
- [ ] Create backup strategy
- [ ] Document deployment process

### 4.5 Launch Preparation
- [ ] Create landing page content
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Configure error tracking (Sentry)
- [ ] Create user onboarding flow
- [ ] Write help documentation
- [ ] Set up social media accounts
- [ ] Create announcement plan

---

## API Endpoints Design

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/reset-password` - Request password reset
- `GET /api/auth/session` - Get current session

### Matches
- `GET /api/matches` - List all matches (with filters)
- `GET /api/matches/:id` - Get single match details
- `GET /api/matches/live` - Get currently live matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/finished` - Get finished matches

### Predictions
- `POST /api/predictions` - Submit prediction
- `PUT /api/predictions/:id` - Update prediction (before lock)
- `GET /api/predictions/user/:userId` - Get user's predictions
- `GET /api/predictions/match/:matchId` - Get predictions for a match
- `DELETE /api/predictions/:id` - Delete prediction (before lock)

### Leaderboard
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/country/:code` - Country leaderboard
- `GET /api/leaderboard/group/:groupId` - Group leaderboard
- `GET /api/leaderboard/user/:userId` - User's rank and stats

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/join` - Join group via code
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/user/:userId` - Get user's groups
- `DELETE /api/groups/:id` - Delete group (creator only)

### AI Predictions
- `GET /api/ai-predictions/match/:matchId` - Get AI prediction for match
- `GET /api/ai-predictions/tournament` - Get tournament-wide AI analysis
- `POST /api/ai-predictions/generate` - Trigger AI prediction generation (admin)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/stats` - Get user statistics
- `POST /api/users/:id/avatar` - Upload avatar

---

## File Structure

```
src/
├── components/
│   ├── AppShell.tsx
│   ├── ui/ (shadcn components)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── PredictionForm.tsx
│   │   └── LiveMatch.tsx
│   ├── groups/
│   │   ├── GroupCard.tsx
│   │   ├── CreateGroupModal.tsx
│   │   └── GroupStandings.tsx
│   └── leaderboard/
│       ├── LeaderboardTable.tsx
│       └── Podium.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── api/
│   │   ├── matches.ts
│   │   ├── predictions.ts
│   │   ├── groups.ts
│   │   └── leaderboard.ts
│   ├── ai/
│   │   └── openrouter.ts
│   ├── email/
│   │   └── resend.ts
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-matches.ts
│   ├── use-predictions.ts
│   └── use-realtime.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── dashboard.tsx
│   ├── groups.tsx
│   ├── leaderboard.tsx
│   ├── profile.tsx
│   └── admin/
│       └── dashboard.tsx
└── styles.css
```

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter AI
VITE_OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Resend Email
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@scorebattle.com

# RSS Feed Configuration
RSS_FEED_URL_BBC=http://feeds.bbci.co.uk/sport/football/rss.xml
RSS_FEED_URL_ESPN=https://www.espn.com/espn/rss/news
RSS_FETCH_INTERVAL_MINUTES=5

# App
VITE_APP_URL=https://scorebattle.com
```

---

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- API response time < 500ms
- 99.9% uptime
- Zero data loss incidents

### User Metrics
- User registration rate
- Prediction completion rate
- Daily active users
- Group creation rate
- Email open rates

### Engagement Metrics
- Average predictions per user
- Time spent on platform
- Return user rate
- Social sharing rate

---

## Risk Mitigation

### Technical Risks
- **RSS feed downtime:** Implement manual override and fallback to admin updates
- **RSS feed format changes:** Build flexible parser with multiple source support
- **AI API rate limits:** Implement queuing and batch processing
- **Database performance:** Implement proper indexing and caching
- **Real-time updates failing:** Implement polling fallback

### Business Risks
- **Low user adoption:** Focus on viral features (groups, social sharing)
- **Match data accuracy:** Implement manual override capabilities
- **Cost overruns:** Monitor API usage, implement rate limiting
- **User disputes:** Create clear rules and dispute resolution process

---

## Next Steps

1. **Immediate Actions:**
   - Set up Supabase project
   - Research RSS feed sources (BBC, ESPN, FIFA)
   - Set up OpenRouter account
   - Set up Resend account

2. **Week 1 Priorities:**
   - Complete database schema
   - Implement authentication
   - Create user profile system

3. **Week 2 Priorities:**
   - Build admin schedule entry interface
   - Enter all 104 World Cup matches manually
   - Build prediction system
   - Implement point calculation

4. **Ongoing:**
   - Regular progress reviews
   - Adjust timeline based on findings
   - Continuous testing and refinement

---

*Last Updated: May 12, 2026*
