export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_history: {
        Row: {
          id: string
          user_id: string
          tracking_id: string
          status: string
          origin: string
          destination: string
          estimated_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tracking_id: string
          status: string
          origin: string
          destination: string
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tracking_id?: string
          status?: string
          origin?: string
          destination?: string
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          bucket_name: string
          file_path: string
          file_name: string
          content_type: string
          size: number
          created_at: string
        }
        Insert: {
          id?: string
          bucket_name: string
          file_path: string
          file_name: string
          content_type: string
          size: number
          created_at?: string
        }
        Update: {
          id?: string
          bucket_name?: string
          file_path?: string
          file_name?: string
          content_type?: string
          size?: number
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type DeliveryHistory = Database["public"]["Tables"]["delivery_history"]["Row"]
export type ImageMetadata = Database["public"]["Tables"]["images"]["Row"]
