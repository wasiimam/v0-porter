"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Package, MapPin, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { trackPackage } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

type TrackingResult = {
  id: string
  tracking_id: string
  status: string
  origin: string
  destination: string
  estimated_delivery: string
  created_at: string
  updated_at: string
  history: {
    status: string
    location: string
    timestamp: string
  }[]
}

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await trackPackage(trackingId)
      setTrackingResult(result)
    } catch (error: any) {
      console.error("Error tracking package:", error)
      toast({
        title: "Error",
        description: error.message || "Invalid tracking ID or package not found.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Order Placed":
        return <Package className="h-5 w-5 text-gray-500" />
      case "Picked Up":
        return <Package className="h-5 w-5 text-blue-500" />
      case "Pending":
        return <Clock className="h-5 w-5 text-orange-500" />
      case "In Transit":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "Out for Delivery":
        return <Package className="h-5 w-5 text-yellow-500" />
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Track Your Package</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter tracking ID (e.g., DEL-12345)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Tracking..." : "Track Package"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {trackingResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tracking Details: {trackingResult.tracking_id}</span>
                  <div className="flex items-center text-sm font-normal">
                    {getStatusIcon(trackingResult.status)}
                    <span
                      className={`ml-2 ${
                        trackingResult.status === "Delivered"
                          ? "text-green-600"
                          : trackingResult.status === "Cancelled"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {trackingResult.status}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">From</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="font-medium">{trackingResult.origin}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="font-medium">{trackingResult.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Estimated Delivery</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="font-medium">
                          {trackingResult.estimated_delivery
                            ? new Date(trackingResult.estimated_delivery).toLocaleDateString()
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="font-medium">{new Date(trackingResult.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingResult.history.map((item, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div
                          className={`rounded-full p-1 ${
                            index === trackingResult.history.length - 1
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {getStatusIcon(item.status)}
                        </div>
                        {index < trackingResult.history.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">{item.status}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                        <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!trackingResult && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking information</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter your tracking ID above to see the current status and delivery progress of your package.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
