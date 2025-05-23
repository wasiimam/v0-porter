"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Truck, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { DeliveryHistory } from "@/types/supabase"
import SeedData from "@/components/seed-data"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([])
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Fetch delivery history
  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("delivery_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching deliveries:", error)
          return
        }

        setDeliveries(data || [])
      } catch (error) {
        console.error("Error fetching deliveries:", error)
      } finally {
        setIsLoadingDeliveries(false)
      }
    }

    if (user) {
      fetchDeliveries()
    } else {
      setIsLoadingDeliveries(false)
    }
  }, [user, supabase])

  if (isLoading || isLoadingDeliveries) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Filter deliveries by status
  const activeDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "In Transit" || delivery.status === "Out for Delivery" || delivery.status === "Pending",
  )

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "Delivered" || delivery.status === "Cancelled",
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Show seed data component if no deliveries */}
        {deliveries.length === 0 && <SeedData />}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Deliveries</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeDeliveries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    id={delivery.tracking_id}
                    status={delivery.status}
                    origin={delivery.origin}
                    destination={delivery.destination}
                    date={new Date(delivery.estimated_delivery || "").toLocaleDateString()}
                    icon={getStatusIcon(delivery.status)}
                    statusColor={getStatusColor(delivery.status)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="h-12 w-12 text-gray-300" />}
                title="No active deliveries"
                description="You don't have any active deliveries at the moment."
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            {completedDeliveries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    id={delivery.tracking_id}
                    status={delivery.status}
                    origin={delivery.origin}
                    destination={delivery.destination}
                    date={new Date(delivery.created_at).toLocaleDateString()}
                    icon={getStatusIcon(delivery.status)}
                    statusColor={getStatusColor(delivery.status)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Clock className="h-12 w-12 text-gray-300" />}
                title="No delivery history"
                description="Your completed deliveries will appear here."
              />
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{deliveries.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time deliveries</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">On-Time Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {deliveries.filter((d) => d.status === "Delivered").length > 0 ? "98%" : "N/A"}
                  </div>
                  <p className="text-xs text-green-500 mt-1">+2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeDeliveries.length}</div>
                  <p className="text-xs text-blue-500 mt-1">Currently in transit</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function DeliveryCard({
  id,
  status,
  origin,
  destination,
  date,
  icon,
  statusColor,
}: {
  id: string
  status: string
  origin: string
  destination: string
  date: string
  icon: React.ReactNode
  statusColor: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">Tracking ID</p>
            <p className="font-medium">{id}</p>
          </div>
          <div className={`${statusColor} text-white text-xs px-2 py-1 rounded-full flex items-center`}>
            {icon}
            <span className="ml-1">{status}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">{origin}</p>
            </div>
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">{destination}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estimated Delivery</p>
          <p className="font-medium">{date}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    </div>
  )
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Pending":
      return <Clock className="h-3 w-3" />
    case "In Transit":
      return <Truck className="h-3 w-3" />
    case "Out for Delivery":
      return <Package className="h-3 w-3" />
    case "Delivered":
      return <CheckCircle className="h-3 w-3" />
    case "Cancelled":
      return <AlertCircle className="h-3 w-3" />
    default:
      return <Package className="h-3 w-3" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Pending":
      return "bg-orange-500"
    case "In Transit":
      return "bg-blue-500"
    case "Out for Delivery":
      return "bg-yellow-500"
    case "Delivered":
      return "bg-green-500"
    case "Cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}
