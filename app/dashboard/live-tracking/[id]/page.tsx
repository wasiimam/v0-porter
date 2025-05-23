"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, MapPin, CheckCircle, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Booking } from "@/types/supabase"
import DashboardLayout from "@/components/dashboard-layout"
import LiveTrackingMap from "@/components/live-tracking-map"

export default function LiveTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoadingBooking, setIsLoadingBooking] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    const fetchBooking = async () => {
      if (!user || !params.id) return

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching booking:", error)
          router.push("/dashboard")
          return
        }

        setBooking(data)
      } catch (error) {
        console.error("Error fetching booking:", error)
        router.push("/dashboard")
      } finally {
        setIsLoadingBooking(false)
      }
    }

    if (user) {
      fetchBooking()
    }
  }, [user, isLoading, params.id, router, supabase])

  if (isLoading || isLoadingBooking) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="min-h-full flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-4">
              The booking you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatServiceType = (serviceType: string) => {
    return serviceType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Live Tracking</h1>
          <p className="text-gray-600">Track your delivery in real-time</p>
        </div>

        {/* Live Tracking Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Live Location Tracking - {booking.tracking_id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveTrackingMap
              pickupAddress={booking.pickup_address}
              deliveryAddress={booking.delivery_address}
              status={booking.status}
              trackingId={booking.tracking_id || ""}
            />
          </CardContent>
        </Card>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium">{formatServiceType(booking.service_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{booking.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {booking.status}
                </span>
              </div>
              {booking.tracking_id && (
                <div>
                  <p className="text-sm text-gray-500">Tracking ID</p>
                  <p className="font-medium">{booking.tracking_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Pickup Address</p>
                <p className="font-medium">{booking.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium">{booking.delivery_address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div className="rounded-full p-1 bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-500">{booking.pickup_address}</p>
                  <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div className="rounded-full p-1 bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium">Picked Up</p>
                  <p className="text-sm text-gray-500">{booking.pickup_address}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(new Date(booking.created_at).getTime() + 3600000).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div
                    className={`rounded-full p-1 ${booking.status === "In Transit" || booking.status === "Out for Delivery" || booking.status === "Delivered" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {booking.status === "In Transit" ||
                    booking.status === "Out for Delivery" ||
                    booking.status === "Delivered" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Truck className="h-5 w-5" />
                    )}
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium">In Transit</p>
                  <p className="text-sm text-gray-500">On the way to destination</p>
                  <p className="text-xs text-gray-400">
                    {booking.status === "In Transit" ||
                    booking.status === "Out for Delivery" ||
                    booking.status === "Delivered"
                      ? new Date(new Date(booking.created_at).getTime() + 7200000).toLocaleString()
                      : "Estimated " + new Date(new Date().getTime() + 3600000).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div
                    className={`rounded-full p-1 ${booking.status === "Out for Delivery" || booking.status === "Delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {booking.status === "Out for Delivery" || booking.status === "Delivered" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium">Out for Delivery</p>
                  <p className="text-sm text-gray-500">{booking.delivery_address}</p>
                  <p className="text-xs text-gray-400">
                    {booking.status === "Out for Delivery" || booking.status === "Delivered"
                      ? new Date(new Date(booking.created_at).getTime() + 10800000).toLocaleString()
                      : "Estimated " + new Date(new Date().getTime() + 7200000).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div
                    className={`rounded-full p-1 ${booking.status === "Delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {booking.status === "Delivered" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">Delivered</p>
                  <p className="text-sm text-gray-500">{booking.delivery_address}</p>
                  <p className="text-xs text-gray-400">
                    {booking.status === "Delivered"
                      ? new Date(new Date(booking.created_at).getTime() + 14400000).toLocaleString()
                      : "Estimated " + new Date(new Date().getTime() + 10800000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
