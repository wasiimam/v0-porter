"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Session, User, SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import type { Profile } from "@/types/supabase"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (credentials: { email: string; password: string; full_name: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const router = useRouter()

  // Initialize Supabase client
  useEffect(() => {
    try {
      supabaseRef.current = getSupabaseBrowserClient()

      // Check auth status on initial load
      const checkAuth = async () => {
        try {
          const {
            data: { session },
          } = await supabaseRef.current!.auth.getSession()
          setSession(session)

          if (session?.user) {
            setUser(session.user)
            const profile = await fetchProfile(session.user.id)
            setProfile(profile)
          }
        } catch (error) {
          console.error("Authentication error:", error)
        } finally {
          setIsLoading(false)
        }
      }

      checkAuth()

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabaseRef.current.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      setIsLoading(false)
    }
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    if (!supabaseRef.current) return null

    try {
      const { data, error } = await supabaseRef.current.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user || !supabaseRef.current) return
    const profile = await fetchProfile(user.id)
    setProfile(profile)
  }

  // Sign in with email and password
  const signIn = async (credentials: { email: string; password: string }) => {
    if (!supabaseRef.current) throw new Error("Supabase client not initialized")

    setIsLoading(true)
    try {
      const { error } = await supabaseRef.current.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw error
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (credentials: { email: string; password: string; full_name: string }) => {
    if (!supabaseRef.current) throw new Error("Supabase client not initialized")

    setIsLoading(true)
    try {
      const { error } = await supabaseRef.current.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
          },
        },
      })

      if (error) {
        throw error
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    if (!supabaseRef.current) throw new Error("Supabase client not initialized")

    try {
      await supabaseRef.current.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
