import { type NextRequest, NextResponse } from "next/server"

// "מאגר" נהגים זמינים בצד השרת. באפליקציה אמיתית זה יגיע ממסד נתונים.
const AVAILABLE_DRIVERS = [
  {
    id: "d1",
    name: "דוד כהן",
    rating: 4.9,
    trips: 1247,
    carModel: "Toyota Camry",
    carColor: "לבן",
    plateNumber: "12-345-67",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=david",
    seats: 4,
    // מיקום נוכחי של הנהג (אזור תל אביב)
    location: { lat: 32.0853, lng: 34.7818 },
  },
  {
    id: "d2",
    name: "מיכל לוי",
    rating: 4.8,
    trips: 892,
    carModel: "Hyundai Ioniq",
    carColor: "כסוף",
    plateNumber: "88-221-43",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=michal",
    seats: 4,
    location: { lat: 32.0719, lng: 34.7915 },
  },
  {
    id: "d3",
    name: "יוסי מזרחי",
    rating: 4.95,
    trips: 2103,
    carModel: "Mercedes V-Class",
    carColor: "שחור",
    plateNumber: "55-678-90",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=yossi",
    seats: 7,
    location: { lat: 32.0944, lng: 34.7740 },
  },
  {
    id: "d4",
    name: "נועה ברק",
    rating: 4.7,
    trips: 534,
    carModel: "Kia Niro",
    carColor: "כחול",
    plateNumber: "33-112-78",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=noa",
    seats: 4,
    location: { lat: 32.0658, lng: 34.7647 },
  },
  {
    id: "d5",
    name: "אבי שלום",
    rating: 4.85,
    trips: 1678,
    carModel: "Volkswagen Caravelle",
    carColor: "אפור",
    plateNumber: "77-543-21",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=avi",
    seats: 8,
    location: { lat: 32.1002, lng: 34.8050 },
  },
]

// חישוב מרחק בקילומטרים בין שתי נקודות גאוגרפיות (נוסחת Haversine)
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // רדיוס כדור הארץ בק"מ
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickup, passengers } = body as {
      pickup: { lat: number; lng: number }
      passengers: number
    }

    if (!pickup || typeof pickup.lat !== "number" || typeof pickup.lng !== "number") {
      return NextResponse.json({ error: "נקודת איסוף לא תקינה" }, { status: 400 })
    }

    // מסננים נהגים שיש להם מספיק מקומות לנוסעים
    const eligibleDrivers = AVAILABLE_DRIVERS.filter(
      (d) => d.seats >= (passengers || 1),
    )

    if (eligibleDrivers.length === 0) {
      return NextResponse.json(
        { error: "לא נמצא רכב מתאים למספר הנוסעים. נסו לפצל לשתי נסיעות." },
        { status: 404 },
      )
    }

    // מחשבים מרחק לכל נהג ומוצאים את הקרוב ביותר
    const driversWithDistance = eligibleDrivers.map((d) => {
      const distanceKm = haversineDistance(
        pickup.lat,
        pickup.lng,
        d.location.lat,
        d.location.lng,
      )
      // הערכת זמן הגעה: מהירות ממוצעת בעיר ~30 קמ"ש => דקות
      const etaMinutes = Math.max(1, Math.round((distanceKm / 30) * 60))
      return { ...d, distanceKm: Math.round(distanceKm * 10) / 10, eta: etaMinutes }
    })

    driversWithDistance.sort((a, b) => a.distanceKm - b.distanceKm)

    const nearest = driversWithDistance[0]

    // מדמים זמן עיבוד בצד שרת
    await new Promise((resolve) => setTimeout(resolve, 600))

    return NextResponse.json({ driver: nearest })
  } catch (error) {
    console.log("[v0] Error finding driver:", error)
    return NextResponse.json({ error: "שגיאה במציאת נהג" }, { status: 500 })
  }
}
