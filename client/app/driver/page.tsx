"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Power, PowerOff, MapPin, Navigation, Clock, DollarSign, Star, Phone, MessageCircle, Check, X, ChevronLeft, TrendingUp, Car, Users } from "lucide-react"

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

interface RideRequest {
  id: string
  passengerName: string
  passengerPhoto: string
  passengerRating: number
  passengerTrips: number
  pickupAddress: string
  pickupLocation: Location
  destinationAddress: string
  destinationLocation: Location
  estimatedPrice: number
  estimatedDistance: number
  estimatedTime: number
  passengers: number
  rideType: "shared" | "standard" | "premium"
}

type DriverStatus = "offline" | "online" | "on_ride"
type RidePhase = "none" | "incoming" | "accepted" | "arrived" | "in_progress" | "completed"

const MOCK_REQUESTS: RideRequest[] = [
  {
    id: "1",
    passengerName: "יעל לוי",
    passengerPhoto: "https://api.dicebear.com/7.x/personas/svg?seed=yael",
    passengerRating: 4.8,
    passengerTrips: 45,
    pickupAddress: "דיזנגוף 50, תל אביב",
    pickupLocation: { lat: 32.0756, lng: 34.7738, address: "דיזנגוף 50, תל אביב" },
    destinationAddress: "הרצל 22, רמת גן",
    destinationLocation: { lat: 32.0823, lng: 34.8112, address: "הרצל 22, רמת גן" },
    estimatedPrice: 35,
    estimatedDistance: 4.2,
    estimatedTime: 12,
    passengers: 2,
    rideType: "standard",
  },
  {
    id: "2",
    passengerName: "משה כהן",
    passengerPhoto: "https://api.dicebear.com/7.x/personas/svg?seed=moshe",
    passengerRating: 4.5,
    passengerTrips: 23,
    pickupAddress: "רוטשילד 1, תל אביב",
    pickupLocation: { lat: 32.0636, lng: 34.7706, address: "רוטשילד 1, תל אביב" },
    destinationAddress: "ויצמן 100, כפר סבא",
    destinationLocation: { lat: 32.1753, lng: 34.9066, address: "ויצמן 100, כפר סבא" },
    estimatedPrice: 85,
    estimatedDistance: 18.5,
    estimatedTime: 28,
    passengers: 1,
    rideType: "premium",
  },
]

export default function DriverDashboard() {
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("offline")
  const [ridePhase, setRidePhase] = useState<RidePhase>("none")
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null)
  const [driverLocation, setDriverLocation] = useState<Location>({ lat: 32.0853, lng: 34.7818 })
  const [todayStats, setTodayStats] = useState({ rides: 0, earnings: 0, hours: 0, rating: 4.9 })
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null)
  const [requestTimeout, setRequestTimeout] = useState(30)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {}
      )
    }
  }, [])

  // Simulate incoming ride requests when online
  useEffect(() => {
    if (driverStatus === "online" && ridePhase === "none") {
      const timeout = setTimeout(() => {
        const randomRequest = MOCK_REQUESTS[Math.floor(Math.random() * MOCK_REQUESTS.length)]
        setCurrentRequest(randomRequest)
        setRidePhase("incoming")
        setRequestTimeout(30)
      }, Math.random() * 5000 + 3000)
      
      return () => clearTimeout(timeout)
    }
  }, [driverStatus, ridePhase])

  // Request timeout countdown
  useEffect(() => {
    if (ridePhase === "incoming" && requestTimeout > 0) {
      const interval = setInterval(() => {
        setRequestTimeout(prev => {
          if (prev <= 1) {
            declineRequest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [ridePhase, requestTimeout])

  // Update shift hours
  useEffect(() => {
    if (shiftStartTime && driverStatus !== "offline") {
      const interval = setInterval(() => {
        const hours = (Date.now() - shiftStartTime.getTime()) / (1000 * 60 * 60)
        setTodayStats(prev => ({ ...prev, hours: Math.round(hours * 10) / 10 }))
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [shiftStartTime, driverStatus])

  const startShift = () => {
    setDriverStatus("online")
    setShiftStartTime(new Date())
  }

  const endShift = () => {
    setDriverStatus("offline")
    setShiftStartTime(null)
    setRidePhase("none")
    setCurrentRequest(null)
  }

  const acceptRequest = () => {
    if (!currentRequest) return
    setRidePhase("accepted")
    setDriverStatus("on_ride")
  }

  const declineRequest = () => {
    setCurrentRequest(null)
    setRidePhase("none")
  }

  const arrivedAtPickup = () => {
    setRidePhase("arrived")
  }

  const startRide = () => {
    setRidePhase("in_progress")
  }

  const completeRide = () => {
    if (currentRequest) {
      setTodayStats(prev => ({
        ...prev,
        rides: prev.rides + 1,
        earnings: prev.earnings + currentRequest.estimatedPrice,
      }))
    }
    setRidePhase("completed")
  }

  const finishAndGoOnline = () => {
    setCurrentRequest(null)
    setRidePhase("none")
    setDriverStatus("online")
  }

  const getRideTypeLabel = (type: string) => {
    switch (type) {
      case "shared": return "משותפת"
      case "standard": return "רגילה"
      case "premium": return "פרימיום"
      default: return type
    }
  }

  const mapLocations = currentRequest 
    ? [currentRequest.pickupLocation, currentRequest.destinationLocation]
    : [driverLocation]

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className={`p-4 shadow-lg relative z-20 transition-colors ${
        driverStatus === "offline" 
          ? "bg-muted" 
          : driverStatus === "on_ride" 
            ? "bg-gradient-to-r from-emerald-600 to-emerald-500" 
            : "bg-gradient-to-r from-primary to-accent"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className={`flex items-center gap-2 transition-colors ${
              driverStatus === "offline" ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
            }`}>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">חזרה</span>
            </a>
            <div className={`h-6 w-px ${driverStatus === "offline" ? "bg-border" : "bg-white/20"}`} />
            <div>
              <h1 className={`text-xl font-bold ${driverStatus === "offline" ? "text-foreground" : "text-white"}`}>
                ממשק נהג
              </h1>
              <p className={`text-xs ${driverStatus === "offline" ? "text-muted-foreground" : "text-white/70"}`}>
                CabUnity Driver
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            driverStatus === "offline" 
              ? "bg-muted-foreground/20" 
              : driverStatus === "on_ride"
                ? "bg-white/20"
                : "bg-white/20"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              driverStatus === "offline" ? "bg-muted-foreground" : "bg-white animate-pulse"
            }`} />
            <span className={`text-sm font-medium ${driverStatus === "offline" ? "text-muted-foreground" : "text-white"}`}>
              {driverStatus === "offline" ? "לא במשמרת" : driverStatus === "on_ride" ? "בנסיעה" : "מקוון"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative min-h-[250px] lg:min-h-0">
          <LeafletMap
            locations={mapLocations.filter(l => l.lat && l.lng)}
            driverLocation={driverStatus !== "offline" ? driverLocation : null}
            showRoute={ridePhase !== "none" && ridePhase !== "completed"}
          />

          {/* Shift Controls Overlay - Only when offline or no active ride */}
          {driverStatus === "offline" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <button
                onClick={startShift}
                className="flex flex-col items-center gap-4 bg-card p-8 rounded-3xl shadow-2xl hover:scale-105 transition-transform"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Power className="w-12 h-12 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">התחל משמרת</span>
                <span className="text-sm text-muted-foreground">לחץ להתחלת קבלת נסיעות</span>
              </button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="lg:w-[420px] bg-card shadow-2xl border-t lg:border-t-0 lg:border-r border-border overflow-y-auto max-h-[55vh] lg:max-h-full">
          {/* Stats Bar - Always visible when online */}
          {driverStatus !== "offline" && (
            <div className="p-4 bg-gradient-to-r from-muted to-muted/50 border-b border-border">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.rides}</p>
                  <p className="text-xs text-muted-foreground">נסיעות</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.earnings} ש״ח</p>
                  <p className="text-xs text-muted-foreground">הכנסות</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.hours}</p>
                  <p className="text-xs text-muted-foreground">שעות</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-lg font-bold text-foreground">{todayStats.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">דירוג</p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Rides */}
          {driverStatus === "online" && ridePhase === "none" && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center relative">
                  <Car className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">מחכה לנסיעות...</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                אתה מקוון ומוכן לקבל הזמנות
              </p>
              
              <button
                onClick={endShift}
                className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-xl font-medium hover:bg-destructive/20 transition-colors"
              >
                <PowerOff className="w-5 h-5" />
                סיים משמרת
              </button>
            </div>
          )}

          {/* Incoming Request */}
          {ridePhase === "incoming" && currentRequest && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">הזמנה חדשה!</h3>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">{requestTimeout}s</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                  style={{ width: `${(requestTimeout / 30) * 100}%` }}
                />
              </div>

              {/* Passenger Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={currentRequest.passengerPhoto}
                  alt={currentRequest.passengerName}
                  className="w-14 h-14 rounded-full border-2 border-primary"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{currentRequest.passengerName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentRequest.passengerRating}</span>
                    <span className="text-border">|</span>
                    <span>{currentRequest.passengerTrips} נסיעות</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{currentRequest.passengers}</span>
                </div>
              </div>

              {/* Ride Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm mt-0.5">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">איסוף</p>
                    <p className="font-medium text-foreground">{currentRequest.pickupAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm mt-0.5">
                    B
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">יעד</p>
                    <p className="font-medium text-foreground">{currentRequest.destinationAddress}</p>
                  </div>
                </div>
              </div>

              {/* Ride Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedPrice} ש״ח</p>
                  <p className="text-xs text-muted-foreground">מחיר</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedDistance} ק״מ</p>
                  <p className="text-xs text-muted-foreground">מרחק</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedTime} דק&apos;</p>
                  <p className="text-xs text-muted-foreground">זמן</p>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-3 text-center">
                <span className="text-sm text-muted-foreground">סוג נסיעה: </span>
                <span className="font-medium text-foreground">{getRideTypeLabel(currentRequest.rideType)}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={declineRequest}
                  className="flex items-center justify-center gap-2 py-4 bg-destructive/10 text-destructive rounded-xl font-bold hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                  דחה
                </button>
                <button
                  onClick={acceptRequest}
                  className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  <Check className="w-5 h-5" />
                  קבל
                </button>
              </div>
            </div>
          )}

          {/* Accepted - Going to Pickup */}
          {ridePhase === "accepted" && currentRequest && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 rounded-full">
                <Navigation className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">בדרך לאיסוף הנוסע</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={currentRequest.passengerPhoto}
                  alt={currentRequest.passengerName}
                  className="w-14 h-14 rounded-full border-2 border-primary"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{currentRequest.passengerName}</h4>
                  <p className="text-sm text-muted-foreground">{currentRequest.pickupAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                  <span className="font-medium text-foreground">התקשר</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <span className="font-medium text-foreground">הודעה</span>
                </button>
              </div>

              <button
                onClick={arrivedAtPickup}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                הגעתי לנקודת האיסוף
              </button>

              <button
                onClick={() => {
                  setRidePhase("none")
                  setCurrentRequest(null)
                  setDriverStatus("online")
                }}
                className="w-full py-3 border border-destructive/30 text-destructive rounded-xl font-medium hover:bg-destructive/10 transition-colors"
              >
                בטל נסיעה
              </button>
            </div>
          )}

          {/* Arrived at Pickup */}
          {ridePhase === "arrived" && currentRequest && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 rounded-full">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-600">ממתין לנוסע</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={currentRequest.passengerPhoto}
                  alt={currentRequest.passengerName}
                  className="w-14 h-14 rounded-full border-2 border-amber-500"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{currentRequest.passengerName}</h4>
                  <p className="text-sm text-muted-foreground">{currentRequest.passengers} נוסעים</p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                <p className="text-sm text-amber-600">הודע לנוסע שהגעת!</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                  <span className="font-medium text-foreground">התקשר</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                  <span className="font-medium text-foreground">הודעה</span>
                </button>
              </div>

              <button
                onClick={startRide}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                הנוסע עלה - התחל נסיעה
              </button>
            </div>
          )}

          {/* In Progress */}
          {ridePhase === "in_progress" && currentRequest && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 rounded-full">
                <Car className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-emerald-600">בנסיעה</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img
                  src={currentRequest.passengerPhoto}
                  alt={currentRequest.passengerName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{currentRequest.passengerName}</h4>
                  <p className="text-sm text-muted-foreground">{currentRequest.passengers} נוסעים</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedPrice} ש״ח</p>
                  <p className="text-xs text-muted-foreground">מחיר</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                <Navigation className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">יעד</p>
                  <p className="font-medium text-foreground">{currentRequest.destinationAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedDistance} ק״מ</p>
                  <p className="text-xs text-muted-foreground">נותרו</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentRequest.estimatedTime} דק&apos;</p>
                  <p className="text-xs text-muted-foreground">זמן משוער</p>
                </div>
              </div>

              <button
                onClick={completeRide}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                הגעתי ליעד - סיים נסיעה
              </button>
            </div>
          )}

          {/* Completed */}
          {ridePhase === "completed" && currentRequest && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">נסיעה הושלמה!</h3>
              
              <div className="text-4xl font-bold text-foreground mb-6">{currentRequest.estimatedPrice} ש״ח</div>
              
              <div className="w-full grid grid-cols-3 gap-3 mb-6">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.rides}</p>
                  <p className="text-xs text-muted-foreground">נסיעות היום</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.earnings} ש״ח</p>
                  <p className="text-xs text-muted-foreground">הכנסות היום</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{todayStats.hours}</p>
                  <p className="text-xs text-muted-foreground">שעות</p>
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <button
                  onClick={finishAndGoOnline}
                  className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  המשך לקבל נסיעות
                </button>
                <button
                  onClick={endShift}
                  className="w-full py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  סיים משמרת
                </button>
              </div>
            </div>
          )}

          {/* Offline Stats */}
          {driverStatus === "offline" && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                סיכום יומי
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{todayStats.rides}</p>
                  <p className="text-sm text-muted-foreground">נסיעות</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{todayStats.earnings} ש״ח</p>
                  <p className="text-sm text-muted-foreground">הכנסות</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{todayStats.hours}</p>
                  <p className="text-sm text-muted-foreground">שעות</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-bold text-foreground">{todayStats.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">דירוג</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
