"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin } from "lucide-react"
import { useJsApiLoader } from "@react-google-maps/api"

interface AddressAutocompleteProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"]

export default function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: AddressAutocompleteProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [inputValue, setInputValue] = useState(value)
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize autocomplete service
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      // We need a DOM element for PlacesService, even if we don't show it
      const placesDiv = document.createElement("div")
      placesService.current = new google.maps.places.PlacesService(placesDiv)
    }
  }, [isLoaded])

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Get place details
  const getPlaceDetails = (placeId: string) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId,
        fields: ["formatted_address"],
      },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.formatted_address) {
          setInputValue(result.formatted_address)
          onChange(result.formatted_address)
          setIsOpen(false)
          setPredictions([])
        }
      },
    )
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onChange(value)

    if (!value) {
      setPredictions([])
      setIsOpen(false)
      return
    }

    if (autocompleteService.current && value.length > 2) {
      setIsLoadingPredictions(true)
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" }, // Restrict to India
        },
        (predictions, status) => {
          setIsLoadingPredictions(false)
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions)
            setIsOpen(true)
          } else {
            setPredictions([])
          }
        },
      )
    } else {
      setPredictions([])
    }
  }

  return (
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setPredictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder || "Enter address"}
          className={`pl-10 ${error ? "border-red-500" : ""}`}
          required={required}
          autoComplete="off"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Predictions dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          {isLoadingPredictions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading suggestions...</span>
            </div>
          ) : predictions.length > 0 ? (
            <ul>
              {predictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => getPlaceDetails(prediction.place_id)}
                >
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                      <div className="text-xs text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.length > 0 ? (
            <div className="p-4 text-sm text-gray-500">No suggestions found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
