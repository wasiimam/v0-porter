"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

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

interface GoogleMapComponentProps {
  pickupAddress?: string
  deliveryAddress?: string
  onRouteCalculated?: (distance: string, duration: string) => void
}

export default function GoogleMapComponent({
  pickupAddress,
  deliveryAddress,
  onRouteCalculated,
}: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [pickupMarker, setPickupMarker] = useState<google.maps.LatLng | null>(null)
  const [deliveryMarker, setDeliveryMarker] = useState<google.maps.LatLng | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
    geocoder.current = new google.maps.Geocoder()
    directionsService.current = new google.maps.DirectionsService()
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

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
            setPickupMarker(location)
          } else {
            setDeliveryMarker(location)
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
    if (!isLoaded || !directionsService.current || !pickupMarker || !deliveryMarker) return

    const calculateRoute = async () => {
      setIsCalculating(true)
      try {
        const results = await directionsService.current!.route({
          origin: pickupMarker.toJSON(),
          destination: deliveryMarker.toJSON(),
          travelMode: google.maps.TravelMode.DRIVING,
        })

        setDirectionsResponse(results)

        // Extract distance and duration
        const route = results.routes[0]
        const leg = route.legs[0]
        if (leg && onRouteCalculated) {
          onRouteCalculated(leg.distance?.text || "Unknown", leg.duration?.text || "Unknown")
        }
      } catch (error) {
        console.error("Direction service error:", error)
      } finally {
        setIsCalculating(false)
      }
    }

    calculateRoute()
  }, [pickupMarker, deliveryMarker, isLoaded, onRouteCalculated])

  // Fit bounds to show both markers
  useEffect(() => {
    if (!map || (!pickupMarker && !deliveryMarker)) return

    const bounds = new google.maps.LatLngBounds()
    if (pickupMarker) bounds.extend(pickupMarker)
    if (deliveryMarker) bounds.extend(deliveryMarker)

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds)
      // Add some padding
      const listener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        map.setZoom(Math.min(map.getZoom() || 14, 15))
      })
      return () => {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, pickupMarker, deliveryMarker])

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
        {pickupMarker && !directionsResponse && (
          <Marker
            position={pickupMarker.toJSON()}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            label={{ text: "A", color: "white" }}
          />
        )}

        {deliveryMarker && !directionsResponse && (
          <Marker
            position={deliveryMarker.toJSON()}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            label={{ text: "B", color: "white" }}
          />
        )}

        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
      </GoogleMap>

      {isCalculating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Calculating route...</span>
        </div>
      )}
    </div>
  )
}
