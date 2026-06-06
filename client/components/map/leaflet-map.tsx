"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Location {
  lat: number
  lng: number
  address?: string
}

interface LeafletMapProps {
  locations: Location[]
  onLocationSelect?: (location: Location, index: number) => void
  driverLocation?: Location | null
  selectingIndex?: number | null
  showRoute?: boolean
}

const createLocationIcon = (index: number, total: number) => {
  const isFirst = index === 0
  const isLast = index === total - 1
  const color = isFirst ? "#3b82f6" : isLast ? "#ef4444" : "#f59e0b"
  const label = isFirst ? "A" : isLast ? String.fromCharCode(65 + index) : String.fromCharCode(65 + index)
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px;">
      ${label}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

const driverIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); width: 44px; height: 44px; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center; transform: rotate(-45deg);">
    <svg style="transform: rotate(45deg);" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L17 10l-2-4H9L7 10l-3.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

export default function LeafletMap({
  locations,
  onLocationSelect,
  driverLocation,
  selectingIndex,
  showRoute = true,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const defaultCenter: [number, number] = [32.0853, 34.7818]

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(defaultCenter, 14)

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current)

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(loc)
          mapRef.current?.setView([loc.lat, loc.lng], 15)
        },
        () => {}
      )
    }

    mapRef.current.on("click", async (e: L.LeafletMouseEvent) => {
      if (selectingIndex === null || selectingIndex === undefined) return
      
      const { lat, lng } = e.latlng
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=he`
        )
        const data = await response.json()
        const address = data.display_name?.split(",").slice(0, 3).join(", ") || "מיקום נבחר"
        
        onLocationSelect?.({ lat, lng, address }, selectingIndex)
      } catch {
        onLocationSelect?.({ lat, lng, address: "מיקום נבחר" }, selectingIndex)
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return
    mapContainerRef.current.style.cursor = selectingIndex !== null && selectingIndex !== undefined ? "crosshair" : ""
  }, [selectingIndex])

  // Update location markers
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const validLocations = locations.filter(l => l.lat && l.lng)
    
    validLocations.forEach((loc, i) => {
      const marker = L.marker([loc.lat, loc.lng], { 
        icon: createLocationIcon(i, validLocations.length) 
      })
        .addTo(mapRef.current!)
        .bindPopup(`<b>${i === 0 ? "נקודת איסוף" : `עצירה ${i}`}</b><br/>${loc.address || ""}`)
      markersRef.current.push(marker)
    })

    // Fit bounds if multiple locations
    if (validLocations.length >= 2) {
      const bounds = L.latLngBounds(validLocations.map(l => [l.lat, l.lng]))
      mapRef.current.fitBounds(bounds, { padding: [60, 60] })
    } else if (validLocations.length === 1) {
      mapRef.current.setView([validLocations[0].lat, validLocations[0].lng], 15)
    }
  }, [locations])

  // Update driver marker
  useEffect(() => {
    if (!mapRef.current) return

    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove()
    }

    if (driverLocation) {
      driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>הנהג שלך</b>")
    }
  }, [driverLocation])

  // Draw route line
  useEffect(() => {
    if (!mapRef.current) return

    if (routeLineRef.current) {
      routeLineRef.current.remove()
    }

    const validLocations = locations.filter(l => l.lat && l.lng)
    
    if (showRoute && validLocations.length >= 2) {
      const points: [number, number][] = []
      
      for (let i = 0; i < validLocations.length - 1; i++) {
        const start = validLocations[i]
        const end = validLocations[i + 1]
        const steps = 15
        
        for (let j = 0; j <= steps; j++) {
          const t = j / steps
          const lat = start.lat + (end.lat - start.lat) * t
          const lng = start.lng + (end.lng - start.lng) * t
          const curve = Math.sin(t * Math.PI) * 0.001
          points.push([lat + curve, lng])
        }
      }

      routeLineRef.current = L.polyline(points, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 12",
      }).addTo(mapRef.current)
    }
  }, [locations, showRoute])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {selectingIndex !== null && selectingIndex !== undefined && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary px-6 py-3 rounded-full shadow-xl z-[1000]">
          <span className="text-sm font-medium text-primary-foreground">
            לחץ על המפה לבחירת {selectingIndex === 0 ? "נקודת איסוף" : `עצירה ${selectingIndex + 1}`}
          </span>
        </div>
      )}

      {userLocation && (
        <button
          onClick={() => {
            mapRef.current?.setView([userLocation.lat, userLocation.lng], 15)
          }}
          className="absolute bottom-6 right-3 bg-card p-3 rounded-xl shadow-lg border border-border z-[1000] hover:bg-muted transition-colors"
          aria-label="המיקום שלי"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        </button>
      )}
    </div>
  )
}
