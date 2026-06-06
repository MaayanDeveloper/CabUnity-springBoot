"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { MapPin, Navigation, Clock, Users, CreditCard, Star, Phone, MessageCircle, X, Plus, Minus, Trash2, Search, Car, Sparkles, AlertCircle } from "lucide-react"
import apiClient from "@/lib/api" // משתמשים בשםApiClient כדי למנוע התנגשויות מילים

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse flex items-center justify-center">
      <div className="text-muted-foreground flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span>טוען מפה...</span>
      </div>
    </div>
  ),
})

interface Location {
  lat: number
  lng: number
  address?: string
}

type RideStatus = "idle" | "searching" | "found" | "arriving" | "in_ride" | "completed"

interface Driver {
  id: string
  name: string
  rating: number
  trips: number
  carModel: string
  carColor: string
  plateNumber: string
  photo: string
  seats: number
  distanceKm: number
  eta: number
}

const RIDE_TYPES = [
  { id: "shared", name: "משותפת", icon: Users, multiplier: 0.6, description: "חסכו עד 40%", color: "text-emerald-500" },
  { id: "standard", name: "רגילה", icon: Car, multiplier: 1, description: "נסיעה פרטית", color: "text-primary" },
  { id: "premium", name: "פרימיום", icon: Sparkles, multiplier: 1.5, description: "רכב יוקרתי", color: "text-amber-500" },
]

export default function RideBooking() {
  const [locations, setLocations] = useState<Location[]>([
    { lat: 0, lng: 0, address: "" },
    { lat: 0, lng: 0, address: "" },
  ])
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null)
  const [selectedRideType, setSelectedRideType] = useState("standard")
  const [passengers, setPassengers] = useState(1)
  const [status, setStatus] = useState<RideStatus>("idle")
  const [driver, setDriver] = useState<Driver | null>(null)
  const [driverLocation, setDriverLocation] = useState<Location | null>(null)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [searchInputs, setSearchInputs] = useState<string[]>(["", ""])
  const [bookingError, setBookingError] = useState<string | null>(null)

  const validLocations = locations.filter(l => l.lat && l.lng)

  useEffect(() => {
    if (validLocations.length >= 2) {
      let totalDistance = 0
      for (let i = 0; i < validLocations.length - 1; i++) {
        const start = validLocations[i]
        const end = validLocations[i + 1]
        totalDistance += Math.sqrt(
          Math.pow((end.lat - start.lat) * 111, 2) +
          Math.pow((end.lng - start.lng) * 111 * Math.cos(start.lat * Math.PI / 180), 2)
        )
      }
      
      const basePrice = 12
      const pricePerKm = 4.5
      const rideType = RIDE_TYPES.find(r => r.id === selectedRideType)
      const multiplier = rideType?.multiplier || 1
      
      setEstimatedPrice(Math.round((basePrice + totalDistance * pricePerKm) * multiplier))
      setEstimatedTime(Math.round(totalDistance * 3 + 5))
    } else {
      setEstimatedPrice(null)
      setEstimatedTime(null)
    }
  }, [locations, selectedRideType, validLocations.length])

  useEffect(() => {
    if (status === "arriving" && validLocations.length > 0 && driver) {
      const pickup = validLocations[0]
      const interval = setInterval(() => {
        setDriverLocation(prev => {
          if (!prev) return prev
          const newLat = prev.lat + (pickup.lat - prev.lat) * 0.15
          const newLng = prev.lng + (pickup.lng - prev.lng) * 0.15
          
          const distance = Math.sqrt(Math.pow(newLat - pickup.lat, 2) + Math.pow(newLng - pickup.lng, 2))
          if (distance < 0.0002) {
            clearInterval(interval)
            setTimeout(() => setStatus("in_ride"), 1000)
          }
          
          return { lat: newLat, lng: newLng }
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [status, validLocations, driver])

  useEffect(() => {
    if (status === "in_ride" && validLocations.length >= 2) {
      let progress = 0
      const interval = setInterval(() => {
        progress += 0.05
        if (progress >= 1) {
          setStatus("completed")
          clearInterval(interval)
        } else {
          const lastIdx = validLocations.length - 1
          setDriverLocation({
            lat: validLocations[0].lat + (validLocations[lastIdx].lat - validLocations[0].lat) * progress,
            lng: validLocations[0].lng + (validLocations[lastIdx].lng - validLocations[0].lng) * progress,
          })
        }
      }, 500)
      
      return () => clearInterval(interval)
    }
  }, [status, validLocations])

  const handleLocationSelect = (location: Location, index: number) => {
    const newLocations = [...locations]
    newLocations[index] = location
    setLocations(newLocations)
    
    const newSearchInputs = [...searchInputs]
    newSearchInputs[index] = location.address || ""
    setSearchInputs(newSearchInputs)
    
    setSelectingIndex(null)
  }

  const addStop = () => {
    setLocations([...locations.slice(0, -1), { lat: 0, lng: 0, address: "" }, locations[locations.length - 1]])
    setSearchInputs([...searchInputs.slice(0, -1), "", searchInputs[searchInputs.length - 1]])
  }

  const removeStop = (index: number) => {
    if (locations.length <= 2) return
    setLocations(locations.filter((_, i) => i !== index))
    setSearchInputs(searchInputs.filter((_, i) => i !== index))
  }

  const handleBookRide = async () => {
    if (validLocations.length < 2) return

    setBookingError(null)
    setStatus("searching")

    const savedUserStr = localStorage.getItem("user")
    if (!savedUserStr) {
      setBookingError("משתמש לא מחובר, נא לבצע התחברות מחדש.")
      setStatus("idle")
      return
    }
    const currentUser = JSON.parse(savedUserStr)
    const pickup = validLocations[0]
    const destination = validLocations[validLocations.length - 1]

    try {
      const ridePayload = {
        originAddress: pickup.address || "נקודת מוצא",
        destinationAddress: destination.address || "נקודת יעד",
        originLat: pickup.lat,
        originLng: pickup.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        requestedSeats: passengers,
        isShared: selectedRideType === "shared"
      }

      // קריאות מול ה-Spring Boot המאובטח באמצעות apiClient החדש
      const createResponse = await apiClient.post(`/passenger/${currentUser.id}/rides`, ridePayload)
      const generatedRide = createResponse.data

      await apiClient.post(`/passenger/rides/${generatedRide.id}/match`)

      const detailsResponse = await apiClient.get(`/passenger/rides/${generatedRide.id}`)
      const updatedRide = detailsResponse.data

      if (updatedRide && updatedRide.rideGroup && updatedRide.rideGroup.driver) {
        const dbDriver = updatedRide.rideGroup.driver
        
        setDriver({
          id: dbDriver.id.toString(),
          name: dbDriver.user?.name || "נהג קאב-יוניטי",
          rating: dbDriver.user?.rating || 5.0,
          trips: 42,
          carModel: dbDriver.carModel,
          carColor: "לבן",
          plateNumber: dbDriver.licensePlate,
          photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
          seats: dbDriver.maxSeats,
          distanceKm: parseFloat(dbDriver.distanceToPassenger?.toFixed(1)) || 1.2,
          eta: Math.ceil(dbDriver.distanceToPassenger * 2) || 4
        })

        setDriverLocation({
          lat: dbDriver.currentLat,
          lng: dbDriver.currentLng
        })

        setStatus("found")
        setTimeout(() => setStatus("arriving"), 2500)
      } else {
        setBookingError("הנסיעה נוצרה, אך לא נמצא נהג פנוי התואם למסלול שלך כרגע.")
        setStatus("idle")
      }

    } catch (error: any) {
      console.error("Error booking ride:", error)
      setBookingError(error.response?.data?.message || "לא נמצאה קבוצת נסיעה שיתופית זמינה כרגע עם מספיק מקום פנוי.")
      setStatus("idle")
    }
  }

  const handleCancelRide = () => {
    setStatus("idle")
    setDriver(null)
    setDriverLocation(null)
  }

  const searchAddress = async (query: string, index: number) => {
    if (query.length < 3) return
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=il&accept-language=he&limit=1`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const location: Location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name?.split(",").slice(0, 3).join(", "),
        }
        handleLocationSelect(location, index)
      }
    } catch (error) {
      console.log("[v0] Error searching address:", error)
    }
  }

  const resetRide = () => {
    setStatus("idle")
    setDriver(null)
    setDriverLocation(null)
    setBookingError(null)
    setLocations([
      { lat: 0, lng: 0, address: "" },
      { lat: 0, lng: 0, address: "" },
    ])
    setSearchInputs(["", ""])
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent p-4 shadow-lg relative z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">CabUnity</h1>
            <p className="text-xs text-primary-foreground/80">נסיעות משותפות חכמות</p>
          </div>
          <div className="flex gap-2">
            <a href="/driver" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm text-white transition-colors">
              נהגים
            </a>
            <a href="/admin" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm text-white transition-colors">
              ניהול
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0">
          <LeafletMap
            locations={validLocations}
            driverLocation={driverLocation}
            onLocationSelect={handleLocationSelect}
            selectingIndex={selectingIndex}
          />
        </div>

        {/* Booking Panel */}
        <div className="lg:w-[420px] bg-card shadow-2xl border-t lg:border-t-0 lg:border-r border-border overflow-y-auto max-h-[60vh] lg:max-h-full">
          {status === "idle" && (
            <div className="p-5 space-y-4">
              {/* Location Inputs */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground">לאן נוסעים?</h2>
                
                {locations.map((loc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? "bg-primary" : index === locations.length - 1 ? "bg-red-500" : "bg-amber-500"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    
                    <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-xl">
                      <input
                        type="text"
                        placeholder={index === 0 ? "נקודת איסוף" : index === locations.length - 1 ? "יעד סופי" : `עצירה ${index}`}
                        value={searchInputs[index]}
                        onChange={(e) => {
                          const newInputs = [...searchInputs]
                          newInputs[index] = e.target.value
                          setSearchInputs(newInputs)
                        }}
                        onBlur={() => searchInputs[index] && searchAddress(searchInputs[index], index)}
                        onKeyDown={(e) => e.key === "Enter" && searchAddress(searchInputs[index], index)}
                        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                        dir="rtl"
                      />
                      <button
                        onClick={() => setSelectingIndex(index)}
                        className="p-1.5 hover:bg-background rounded-lg transition-colors"
                        aria-label="בחר על המפה"
                      >
                        <MapPin className={`w-5 h-5 ${index === 0 ? "text-primary" : index === locations.length - 1 ? "text-red-500" : "text-amber-500"}`} />
                      </button>
                    </div>
                    
                    {index > 0 && index < locations.length - 1 && (
                      <button
                        onClick={() => removeStop(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        aria-label="הסר עצירה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addStop}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">הוסף עצירה</span>
                </button>
              </div>

              {/* Ride Type Selection */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">סוג נסיעה</h3>
                <div className="grid grid-cols-3 gap-2">
                  {RIDE_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedRideType(type.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          selectedRideType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-muted-foreground"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-1 ${selectedRideType === type.id ? type.color : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${selectedRideType === type.id ? "text-foreground" : "text-muted-foreground"}`}>
                          {type.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{type.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">מספר נוסעים</h3>
                <div className="flex items-center justify-between p-2 bg-muted rounded-xl">
                  <button
                    onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                    disabled={passengers <= 1}
                    className="w-11 h-11 rounded-xl bg-card text-foreground text-xl font-bold flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="פחות נוסעים"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-foreground tabular-nums">{passengers}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {passengers === 1 ? "נוסע" : "נוסעים"}
                    </span>
                  </div>
                  <button
                    onClick={() => setPassengers((p) => p + 1)}
                    className="w-11 h-11 rounded-xl bg-card text-foreground text-xl font-bold flex items-center justify-center shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="עוד נוסעים"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price Estimate */}
              {estimatedPrice && estimatedTime && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">כ-{estimatedTime} דק&apos;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="text-xl font-bold text-foreground">{estimatedPrice} ש&quot;ח</span>
                  </div>
                </div>
              )}

              {/* Booking Error */}
              {bookingError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm text-destructive">{bookingError}</span>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookRide}
                disabled={validLocations.length < 2}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                {validLocations.length < 2 ? "בחרו נקודת איסוף ויעד" : "הזמן נסיעה"}
              </button>
            </div>
          )}

          {/* Searching State */}
          {status === "searching" && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center relative">
                  <Search className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">מחפש נהג בסביבה...</h3>
              <p className="text-sm text-muted-foreground mb-6">זה יקח רק כמה שניות</p>
              <button
                onClick={handleCancelRide}
                className="text-destructive text-sm font-medium hover:underline"
              >
                ביטול
              </button>
            </div>
          )}

          {/* Driver Found / Arriving State */}
          {(status === "found" || status === "arriving") && driver && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {status === "found" ? "נמצא הנהג הקרוב ביותר!" : "הנהג בדרך אליך"}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="w-16 h-16 rounded-full border-3 border-primary"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">{driver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{driver.rating}</span>
                    <span className="text-border">|</span>
                    <span>{driver.trips} נסיעות</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {driver.carModel} {driver.carColor}
                  </p>
                  <p className="text-xs text-primary font-mono">{driver.plateNumber}</p>
                </div>
                <div className="text-center bg-primary/10 px-4 py-2 rounded-xl">
                  <div className="text-3xl font-bold text-primary">{driver.eta}</div>
                  <div className="text-xs text-muted-foreground">דקות</div>
                </div>
              </div>

              {/* Driver extra info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted/60 rounded-xl">
                  <Navigation className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">{driver.distanceKm} ק&quot;מ</div>
                    <div className="text-[11px] text-muted-foreground">מרחק ממך</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/60 rounded-xl">
                  <Users className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">{driver.seats} מקומות</div>
                    <div className="text-[11px] text-muted-foreground">{passengers} נוסעים בנסיעה</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">התקשר</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">הודעה</span>
                </button>
              </div>

              <button
                onClick={handleCancelRide}
                className="w-full flex items-center justify-center gap-2 py-3 text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">בטל נסיעה</span>
              </button>
            </div>
          )}

          {/* In Ride State */}
          {status === "in_ride" && driver && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">בנסיעה</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{driver.name}</h3>
                  <p className="text-sm text-muted-foreground">{driver.carModel}</p>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-foreground">{estimatedPrice} ש&quot;ח</div>
                  <div className="text-xs text-muted-foreground">מחיר משוער</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 text-xs text-muted-foreground text-center bg-gray-50 rounded-lg">
                  🚕 מסלול נסיעה פעיל מול שרת ה-Spring Boot
                </div>
                {validLocations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      i === 0 ? "bg-primary" : i === validLocations.length - 1 ? "bg-red-500" : "bg-amber-500"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm text-foreground truncate">{loc.address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed State */}
          {status === "completed" && driver && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">הגעת ליעד!</h3>
              <p className="text-muted-foreground mb-4">תודה שנסעת איתנו</p>
              
              <div className="text-3xl font-bold text-foreground mb-6">{estimatedPrice} ש&quot;ח</div>
              
              <div className="flex items-center gap-4 mb-6">
                <img src={driver.photo} alt={driver.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-medium text-foreground">{driver.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-amber-500 fill-amber-500 cursor-pointer hover:scale-110 transition-transform" />
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={resetRide}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
              >
                הזמן נסיעה נוספת
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}