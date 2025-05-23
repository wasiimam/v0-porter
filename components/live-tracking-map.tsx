"use client"

import { useState, useEffect, useRef } from "react"
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api"
import { Loader2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define center of India as default
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places", "geometry"]

interface LiveTrackingMapProps {
  pickupAddress: string
  deliveryAddress: string
  status: string
  trackingId: string
}

export default function LiveTrackingMap({ pickupAddress, deliveryAddress, status, trackingId }: LiveTrackingMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [pickupLocation, setPickupLocation] = useState<google.maps.LatLng | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<google.maps.LatLng | null>(null)
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLng | null>(null)
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const [progress, setProgress] = useState(0)
  const [estimatedArrival, setEstimatedArrival] = useState("")
  const [isLiveTracking, setIsLiveTracking] = useState(false)

  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const animationRef = useRef<number | null>(null)

  const onLoad = (map: google.maps.Map) => {
    setMap(map)
    geocoder.current = new google.maps.Geocoder()
    directionsService.current = new google.maps.DirectionsService()
  }

  const onUnmount = () => {
    setMap(null)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Geocode addresses and update markers
  useEffect(() => {
    if (!isLoaded || !geocoder.current) return

    const geocodeAddress = async (address: string, isPickup: boolean) => {
      if (!address) return

      try {
        const result = await geocoder.current!.geocode({ address })
        if (result.results[0]) {
          const location = result.results[0].geometry.location
          if (isPickup) {
            setPickupLocation(location)
          } else {
            setDeliveryLocation(location)
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error)
      }
    }

    if (pickupAddress) {
      geocodeAddress(pickupAddress, true)
    }

    if (deliveryAddress) {
      geocodeAddress(deliveryAddress, false)
    }
  }, [pickupAddress, deliveryAddress, isLoaded])

  // Calculate route when both markers are set
  useEffect(() => {
    if (!isLoaded || !directionsService.current || !pickupLocation || !deliveryLocation) return

    const calculateRoute = async () => {
      try {
        const results = await directionsService.current!.route({
          origin: pickupLocation.toJSON(),
          destination: deliveryLocation.toJSON(),
          travelMode: google.maps.TravelMode.DRIVING,
        })

        setDirectionsResponse(results)

        // Extract estimated arrival time
        const route = results.routes[0]
        const leg = route.legs[0]
        if (leg && leg.duration) {
          // Calculate estimated arrival time
          const now = new Date()
          const arrivalTime = new Date(now.getTime() + leg.duration.value * 1000)
          setEstimatedArrival(arrivalTime.toLocaleTimeString())
        }

        // Set initial current location to pickup
        setCurrentLocation(pickupLocation)

        // Set initial progress based on status
        if (status === "Pending") {
          setProgress(0)
        } else if (status === "In Transit") {
          setProgress(Math.random() * 50 + 10) // 10-60%
        } else if (status === "Out for Delivery") {
          setProgress(Math.random() * 30 + 70) // 70-100%
        } else if (status === "Delivered") {
          setProgress(100)
          setCurrentLocation(deliveryLocation)
        }
      } catch (error) {
        console.error("Direction service error:", error)
      }
    }

    calculateRoute()
  }, [pickupLocation, deliveryLocation, isLoaded, status])

  // Fit bounds to show all markers
  useEffect(() => {
    if (!map || (!pickupLocation && !deliveryLocation && !currentLocation)) return

    const bounds = new google.maps.LatLngBounds()
    if (pickupLocation) bounds.extend(pickupLocation)
    if (deliveryLocation) bounds.extend(deliveryLocation)
    if (currentLocation) bounds.extend(currentLocation)

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds)
      // Add some padding
      const listener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        map.setZoom(Math.min(map.getZoom() || 14, 13))
      })
      return () => {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, pickupLocation, deliveryLocation, currentLocation])

  // Animate delivery vehicle along the route
  const startLiveTracking = () => {
    if (!directionsResponse || !pickupLocation || !deliveryLocation) return

    setIsLiveTracking(true)

    // Get the route path
    const route = directionsResponse.routes[0]
    const path = route.overview_path

    // Calculate total distance
    let totalDistance = 0
    for (let i = 1; i < path.length; i++) {
      totalDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i - 1], path[i])
    }

    // Start animation
    let startTime: number | null = null
    const duration = 30000 // 30 seconds for demo

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setProgress(progress * 100)

      if (progress < 1) {
        // Calculate current position along the path
        const distanceAlongPath = progress * totalDistance
        let distanceSoFar = 0
        let currentPathIndex = 0

        // Find the current segment
        while (currentPathIndex < path.length - 1 && distanceSoFar < distanceAlongPath) {
          const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
            path[currentPathIndex],
            path[currentPathIndex + 1],
          )
          if (distanceSoFar + segmentDistance > distanceAlongPath) {
            break
          }
          distanceSoFar += segmentDistance
          currentPathIndex++
        }

        // Interpolate position within the current segment
        if (currentPathIndex < path.length - 1) {
          const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
            path[currentPathIndex],
            path[currentPathIndex + 1],
          )
          const segmentProgress = (distanceAlongPath - distanceSoFar) / segmentDistance

          const lat =
            path[currentPathIndex].lat() +
            (path[currentPathIndex + 1].lat() - path[currentPathIndex].lat()) * segmentProgress
          const lng =
            path[currentPathIndex].lng() +
            (path[currentPathIndex + 1].lng() - path[currentPathIndex].lng()) * segmentProgress

          setCurrentLocation(new google.maps.LatLng(lat, lng))
        }

        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        setCurrentLocation(deliveryLocation)
        setIsLiveTracking(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  const stopLiveTracking = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsLiveTracking(false)
  }

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading maps</div>
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading Maps...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {/* Pickup marker */}
          {pickupLocation && !directionsResponse && (
            <Marker
              position={pickupLocation.toJSON()}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new google.maps.Size(40, 40),
              }}
              label={{ text: "A", color: "white" }}
            />
          )}

          {/* Delivery marker */}
          {deliveryLocation && !directionsResponse && (
            <Marker
              position={deliveryLocation.toJSON()}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(40, 40),
              }}
              label={{ text: "B", color: "white" }}
            />
          )}

          {/* Route */}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} options={{ suppressMarkers: true }} />
          )}

          {/* Current location marker */}
          {currentLocation && (
            <Marker
              position={currentLocation.toJSON()}
              icon={{
                url: "/images/delivery-truck.png",
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
              onClick={() => setShowInfoWindow(!showInfoWindow)}
            >
              {showInfoWindow && (
                <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                  <div className="p-1">
                    <p className="font-medium">Tracking: {trackingId}</p>
                    <p className="text-sm text-gray-600">ETA: {estimatedArrival}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>

        {/* Progress overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-lg shadow-md">
          <div className="flex justify-between text-sm mb-1">
            <span>Pickup</span>
            <span>Delivery</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              <span className="font-medium">Status:</span> {status}
            </div>
            <div className="text-sm">
              <span className="font-medium">ETA:</span> {estimatedArrival || "Calculating..."}
            </div>
          </div>
        </div>
      </div>

      {/* Live tracking controls */}
      <div className="flex justify-center">
        {!isLiveTracking ? (
          <Button onClick={startLiveTracking} className="bg-blue-600 hover:bg-blue-700">
            <Truck className="mr-2 h-4 w-4" />
            Simulate Live Tracking
          </Button>
        ) : (
          <Button onClick={stopLiveTracking} variant="destructive">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Stop Simulation
          </Button>
        )}
      </div>
    </div>
  )
}
