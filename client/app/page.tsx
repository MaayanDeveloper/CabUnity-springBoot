"use client"

import { useState, useEffect } from "react"
import RideBooking from "@/components/ride/ride-booking"
import api from "@/lib/api"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // בדיקה בזמן טעינת האתר אם המשתמש כבר מחובר (יש לו טוקן)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // קריאה אמיתית לקונטרולר שעדכנו ב-Spring Boot!
      const response = await api.post("/passenger/login", { email, password })
      
      const { token, user } = response.data
      
      // שמירת ה-JWT ופרטי המשתמש בדפדפן
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.response?.data || "אימייל או סיסמה שגויים, נסו שוב.")
    } finally {
      setLoading(false)
    }
  }

  // אם הוא מחובר, נציג לו את דשבורד הנסיעות הרגיל
  if (isAuthenticated) {
    return <RideBooking />
  }

  // אם הוא לא מחובר, נציג לו מסך התחברות מאובטח
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 dir-rtl" dir="rtl">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center space-y-1">
          <h2 className="text-4xl font-black text-indigo-600 tracking-tight">CabUnity</h2>
          <p className="text-sm text-muted-foreground">התחברי למערכת הנסיעות השיתופיות</p>
        </div>

        <form className="space-y-4 mt-6" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">כתובת אימייל</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">סיסמה</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center font-medium bg-red-50/50 py-2 rounded-lg border border-red-100">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:bg-gray-300 text-sm"
          >
            {loading ? "מתחבר..." : "התחברות"}
          </button>
        </form>
      </div>
    </div>
  )
}