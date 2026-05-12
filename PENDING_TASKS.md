# Pending Tasks

These tasks are pending and will be completed later.

## High Priority

### 1. Set up RSS cron job for live scores
- **Status**: Endpoint created, needs cron service setup
- **What's done**: API endpoint at `/api/cron/fetch-rss` is ready
- **What's needed**: 
  - Domain name
  - Set up cron service (cron-job.org, GitHub Actions, or Cloudflare Cron)
  - Schedule to call endpoint every 5 minutes
- **Environment variable**: `RSS_FEED_URL_BBC` already configured

### 2. Upload World Cup 2026 match list to database
- **Status**: Bulk upload feature exists in admin page
- **What's needed**: 
  - Prepare CSV/JSON file with all 104 World Cup 2026 matches
  - Upload via admin page
  - Verify matches are correctly imported
- **After this**: Can fix hardcoded ticker on landing page

## Medium Priority

### 3. Implement email notifications with Resend
- **Status**: Not started
- **What's needed**:
  - Resend API key
  - Email templates (group invites, match reminders, weekly leaderboard, beat AI)
  - Email queue system
  - Email preferences in user settings

## Low Priority

### 4. Replace hardcoded ticker with real matches
- **Status**: Blocked by match list upload
- **What's needed**: 
  - Complete match list upload first
  - Update landing page ticker to fetch from database
- **Depends on**: Task #2

---

## Notes

- All core features are implemented and working
- Authentication, predictions, leaderboard, groups, AI predictions all functional
- Platform is ready for use once match data is added
