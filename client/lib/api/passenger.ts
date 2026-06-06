const API_BASE = "http://localhost:8080"

export interface ApiUser {
  id: number
  idNumber: number
  name: string
  email: string
  role: "USER" | "ADMIN" | "DRIVER"
  rating: number
  profileImage?: string
}

export interface ApiDriver {
  id: number
  user: ApiUser
  carModel: string
  licensePlate: string
  maxSeats: number
  currentLat: number
  currentLng: number
  available: boolean
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
}

export interface ApiRideGroup {
  id: number
  driver: ApiDriver
  availableSeats: number
  status: "PENDING" | "ACTIVE" | "COMPLETED"
}

export interface ApiRide {
  id: number
  originAddress: string
  destinationAddress: string
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  requestedSeats: number
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  shared?: boolean
  isShared?: boolean
  price: number
  rideGroup?: ApiRideGroup | null
}

export interface CreateRidePayload {
  originAddress: string
  destinationAddress: string
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  requestedSeats: number
  isShared: boolean
}

export interface UiDriver {
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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    })
  } catch {
    throw new Error(
      "לא ניתן להתחבר לשרת. ודאי ש-Spring Boot רץ (CabUnityApplication ב-IntelliJ)."
    )
  }

  if (!res.ok) {
    const text = await res.text()
    let message = `שגיאת שרת (${res.status})`
    try {
      const json = JSON.parse(text)
      message = json.message ?? json.error ?? message
    } catch {
      if (text && !text.includes("<!DOCTYPE")) message = text
    }

    if (res.status === 500 && message === "Internal Server Error") {
      message =
        "השרת (Spring Boot) לא זמין. הפעילי את CabUnityApplication ב-IntelliJ ונסי שוב."
    }

    if (
      message.includes("No available drivers") ||
      message.includes("enough seats")
    ) {
      message =
        "לא נמצא נהג זמין. נהג צריך להיות במשמרת פעילה (דף נהגים → התחל משמרת)."
    }

    throw new Error(message)
  }

  const contentType = res.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return res.json()
  }
  return (await res.text()) as T
}

export function registerPassenger(user: {
  idNumber: number
  name: string
  email: string
  password: string
  role?: "USER"
}) {
  return apiFetch<ApiUser>("/api/passenger/register", {
    method: "POST",
    body: JSON.stringify({ ...user, role: "USER" }),
  })
}

export function createRide(passengerId: number, ride: CreateRidePayload) {
  return apiFetch<ApiRide>(`/api/passenger/${passengerId}/rides`, {
    method: "POST",
    body: JSON.stringify(ride),
  })
}

export function matchRide(rideId: number) {
  return apiFetch<{ message: string }>(`/api/passenger/rides/${rideId}/match`, {
    method: "POST",
  })
}

export function getRideDetails(rideId: number) {
  return apiFetch<ApiRide>(`/api/passenger/rides/${rideId}`)
}

export function cancelRide(rideId: number) {
  return apiFetch<ApiRide>(`/api/passenger/rides/${rideId}/cancel`, {
    method: "PUT",
  })
}

export function getPassengerHistory(passengerId: number) {
  return apiFetch<ApiRide[]>(`/api/passenger/${passengerId}/history`)
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function mapApiDriverToUi(
  apiDriver: ApiDriver,
  pickupLat: number,
  pickupLng: number
): UiDriver {
  const distanceKm = haversineKm(
    apiDriver.currentLat,
    apiDriver.currentLng,
    pickupLat,
    pickupLng
  )
  const eta = Math.max(1, Math.round((distanceKm / 30) * 60))

  return {
    id: String(apiDriver.id),
    name: apiDriver.user?.name ?? "נהג",
    rating: apiDriver.user?.rating ?? 5,
    trips: 0,
    carModel: apiDriver.carModel ?? "",
    carColor: "",
    plateNumber: apiDriver.licensePlate ?? "",
    photo:
      apiDriver.user?.profileImage ??
      `https://api.dicebear.com/7.x/personas/svg?seed=${apiDriver.id}`,
    seats: apiDriver.maxSeats,
    distanceKm: Math.round(distanceKm * 10) / 10,
    eta,
  }
}
