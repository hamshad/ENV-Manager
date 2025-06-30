import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          github_username: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          github_username?: string | null
          created_at?: string
        }
      }
      repositories: {
        Row: {
          id: string
          user_id: string
          name: string
          github_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          github_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          github_url?: string
          description?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          action: string
          description: string | null
          repository_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          description?: string | null
          repository_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          description?: string | null
          repository_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
