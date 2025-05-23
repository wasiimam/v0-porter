"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { seedDeliveryHistory } from "@/lib/actions"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export default function SeedData() {
  const { user } = useAuth()
  const [isSeeding, setIsSeeding] = useState(false)
  const [hasSeeded, setHasSeeded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null)
  const { toast } = useToast()

  // Initialize Supabase client
  useEffect(() => {
    try {
      supabaseRef.current = getSupabaseBrowserClient()
      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      toast({
        title: "Error",
        description: "Could not connect to the database. Please try again later.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Check if user has delivery history
  useEffect(() => {
    const checkDeliveryHistory = async () => {
      if (!user || !isInitialized || !supabaseRef.current) return

      try {
        const { data, error } = await supabaseRef.current
          .from("delivery_history")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)

        if (error) {
          console.error("Error checking delivery history:", error)
          return
        }

        if (data && data.length > 0) {
          setHasSeeded(true)
        }
      } catch (error) {
        console.error("Error checking delivery history:", error)
      }
    }

    if (user && isInitialized) {
      checkDeliveryHistory()
    }
  }, [user, isInitialized])

  const handleSeedData = async () => {
    if (!user) return

    setIsSeeding(true)
    try {
      const result = await seedDeliveryHistory(user.id)

      if (result.success) {
        setHasSeeded(true)
        toast({
          title: "Sample data created",
          description: "Sample delivery history has been added to your account.",
          variant: "success",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create sample data. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  if (hasSeeded) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-800 mb-2">No delivery history found</h3>
      <p className="text-blue-600 mb-4">
        Would you like to create sample delivery data to see how the dashboard works?
      </p>
      <Button onClick={handleSeedData} disabled={isSeeding} className="bg-blue-600 hover:bg-blue-700">
        {isSeeding ? "Creating sample data..." : "Create Sample Data"}
      </Button>
    </div>
  )
}
