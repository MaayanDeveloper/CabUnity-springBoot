"use client"

import { useState, useEffect } from "react"
import { Car, Check, X, AlertCircle, RefreshCw } from "lucide-react"
import api from "@/lib/api"

export default function AdminDashboard() {
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // פונקציה לשליפת הנהגים הממתינים מהשרת
  const fetchPendingDrivers = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await api.get("/admin/drivers/pending")
      // וידוא שהתשובה היא אכן מערך כדי למנוע קריסות
      setPendingDrivers(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      console.error("Error fetching pending drivers:", err)
      setError("נכשלה טעינת נהגים ממתינים. ודאי שהסרבר ב-IntelliJ דולק.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDrivers()
  }, [])

  // פונקציה לאישור או דחיית נהג
  const handleApprove = async (driverId: number, isApproved: boolean) => {
    try {
      await api.put(`/admin/drivers/${driverId}/approve?isApproved=${isApproved}`)
      // עדכון ה-UI והסרת הנהג שטופל מהרשימה
      setPendingDrivers(prev => prev.filter(d => d.id !== driverId))
      alert(isApproved ? "🎉 הנהג אושר בהצלחה!" : "❌ הבקשה נדחתה.")
    } catch (err) {
      console.error("Error updating driver status:", err)
      alert("הפעולה נכשלה. חלה שגיאה בעדכון הסטטוס בשרת.")
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* כותרת הדשבורד */}
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">לוח בקרה מנהל - בקשות הצטרפות</h1>
          <p className="text-sm text-gray-500">ניהול ואישור נהגים חדשים במערכת CabUnity</p>
        </div>
        <button 
          onClick={fetchPendingDrivers}
          className="p-2 border rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1 text-sm text-gray-600"
        >
          <RefreshCw className="w-4 h-4" />
          רענן נתונים
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 animate-pulse">טוען בקשות ממתינות...</div>
      ) : pendingDrivers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-emerald-50/30">
          <p className="text-gray-600 font-medium">אין בקשות הצטרפות שממתינות לאישור כרגע! 🎉</p>
        </div>
      ) : (
        /* טבלת נהגים עם הגנות קריסה מלאות */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b">
                <th className="p-4">שם הנהג</th>
                <th className="p-4">פרטי קשר</th>
                <th className="p-4">דגם רכב</th>
                <th className="p-4">מספר רישוי</th>
                <th className="p-4">מקומות</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {pendingDrivers.map((driver) => {
                // מנגנון חילוץ נתונים חכם למניעת שגיאות undefined
                const driverName = driver.user?.name || driver.name || "נהג חדש"
                const driverEmail = driver.user?.email || driver.email || "אין אימייל"
                const driverIdNum = driver.user?.idNumber || driver.idNumber || "---"
                const carModelName = driver.carModel || "לא צוין דגם"
                const licensePlateNum = driver.licensePlate || driver.plateNumber || "---"
                const seatsCount = driver.maxSeats || 4

                return (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{driverName}</td>
                    <td className="p-4 text-xs">
                      <div>{driverEmail}</div>
                      <div className="text-gray-400 mt-0.5">ת.ז: {driverIdNum}</div>
                    </td>
                    <td className="p-4 flex items-center gap-2 mt-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      {carModelName}
                    </td>
                    <td className="p-4 font-mono text-xs">{licensePlateNum}</td>
                    <td className="p-4">{seatsCount} מושבים</td>
                    
                    {/* כפתורי פעולה לאישור/דחייה */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(driver.id, true)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          <Check className="w-4 h-4" />
                          אשר
                        </button>
                        <button
                          onClick={() => handleApprove(driver.id, false)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          <X className="w-4 h-4" />
                          דחה
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}