export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          country_code: string | null
          auth_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string | null
          country_code?: string | null
          auth_provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          country_code?: string | null
          auth_provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          home_team_code: string
          home_team_name: string
          away_team_code: string
          away_team_name: string
          match_date: string
          venue: string
          stage: string
          status: string
          home_score: number | null
          away_score: number | null
          minute: number | null
          external_provider: string | null
          external_id: string | null
          external_league_id: string | null
          external_season: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          home_team_code: string
          home_team_name: string
          away_team_code: string
          away_team_name: string
          match_date: string
          venue: string
          stage: string
          status?: string
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          external_provider?: string | null
          external_id?: string | null
          external_league_id?: string | null
          external_season?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          home_team_code?: string
          home_team_name?: string
          away_team_code?: string
          away_team_name?: string
          match_date?: string
          venue?: string
          stage?: string
          status?: string
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          external_provider?: string | null
          external_id?: string | null
          external_league_id?: string | null
          external_season?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          home_score: number
          away_score: number
          locked_at: string
          points_earned: number
          beat_ai: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          home_score: number
          away_score: number
          locked_at?: string
          points_earned?: number
          beat_ai?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          home_score?: number
          away_score?: number
          locked_at?: string
          points_earned?: number
          beat_ai?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          code: string
          created_by: string
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_by: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_by?: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      ai_predictions: {
        Row: {
          id: string
          match_id: string
          home_score: number
          away_score: number
          confidence: number
          explanation: string | null
          model_used: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          home_score: number
          away_score: number
          confidence: number
          explanation?: string | null
          model_used: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          home_score?: number
          away_score?: number
          confidence?: number
          explanation?: string | null
          model_used?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          subject: string
          body: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          subject: string
          body: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          subject?: string
          body?: string
          sent_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
