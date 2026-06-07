"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, User, Smartphone, CreditCard, Mail, ArrowRight } from "lucide-react"
import api from "@/lib/api"

export default function BecomeDriver() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    carModel: "",
    plateNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // בניית האובייקט המדויק שמעיין מצפה לקבל ב-Driver Entity בשרת
    const driverData = {
      carModel: formData.carModel,
      licensePlate: formData.plateNumber, // התאמה לשם המדויק ב-DB
      approvalStatus: "PENDING",          // סטטוס חובה התחלתי
      available: true,
      currentLat: 32.0853,                // קו רוחב חובה דיפולטיבי (בני ברק)
      currentLng: 34.7818,                // קו אורך חובה דיפולטיבי
      maxSeats: 4                         // כמות מושבים דיפולטיבית
    }

    try {
      // שליחת הבקשה לקונטרולר של מעיין עבור משתמש מספר 1
      await api.post("/driver/register/1", driverData)      
      setMessage("🎉 בקשתך נשלחה בהצלחה! המתן לאישור המנהל.")
      setFormData({ carModel: "", plateNumber: "" })
    } catch (error) {
      console.error("Registration error:", error)
      setMessage("❌ ההרשמה נכשלה. ודאי שמשתמש מספר 1 קיים ב-DB או שהסרבר דולק.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">הצטרפות כנהג ב-CabUnity</h1>
          <p className="text-sm text-gray-500 mt-1">מלא את פרטי הרכב להגשת בקשת הצטרפות</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-4 text-center text-sm border ${
            message.includes("🎉") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">דגם רכב ושנה</label>
            <div className="relative">
              <Car className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                placeholder="טויוטה קורולה 2022"
                value={formData.carModel}
                onChange={e => setFormData({...formData, carModel: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">מספר רישוי (לוחית זיהוי)</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                placeholder="12-345-67"
                value={formData.plateNumber}
                onChange={e => setFormData({...formData, plateNumber: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm font-mono text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm shadow-md transition-all mt-2"
          >
            {loading ? "שולח בקשה..." : "הגש בקשת הצטרפות"}
          </button>
        </form>

        <button 
          onClick={() => router.push("/admin")}
          className="w-full mt-4 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowRight className="w-3 h-3" />
          חזרה לפאנל מנהל לשם בדיקה
        </button>

      </div>
    </div>
  )
}