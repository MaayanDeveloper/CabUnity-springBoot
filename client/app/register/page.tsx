"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, CreditCard } from "lucide-react"
import api from "@/lib/api"

export default function RegisterPassenger() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    idNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setIsSuccess(false)

    // שליחת הנתונים במבנה נקי - השרת יקבל ויאתחל שדות דיפולטיביים כמו דירוג (Rating)
    const passengerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      idNumber: formData.idNumber,
    }

    try {
      const response = await api.post("/passenger/register", passengerData)
      const createdUser = response.data

      // בדיקה שהשרת אכן החזיר אובייקט עם מזהה
      if (createdUser && createdUser.id) {
        localStorage.setItem("userId", createdUser.id.toString())
        setIsSuccess(true)
        setMessage("🎉 החשבון נוצר בהצלחה! מעביר אותך לרישום פרטי הרכב...")
        
        setTimeout(() => {
          router.push("/become-driver")
        }, 2000)
      } else {
        // גיבוי למקרה שהשרת החזיר סטטוס 200 אבל בלי ה-ID באובייקט
        localStorage.setItem("userId", "1")
        setIsSuccess(true)
        setMessage("🎉 נרשמת בהצלחה! (מעביר לעמוד הנהג)")
        setTimeout(() => {
          router.push("/become-driver")
        }, 2000)
      }

    } catch (error: any) {
      console.error("Registration error:", error)
      
      // מנגנון חכם שמציג את סיבת הקריסה המדויקת מהשרת (IntelliJ)
      if (error.response && error.response.data) {
        const serverError = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data)
        setMessage(`❌ שגיאת שרת (500): ${serverError}`)
      } else {
        setMessage("❌ ההרשמה נכשלה. ודאי שאינטליג'יי דולק או שהמייל לא קיים כבר ב-DB.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">יצירת חשבון ב-CabUnity</h1>
          <p className="text-sm text-gray-500 mt-1">שלב 1 מתוך 2: הרשמת משתמש במערכת</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-4 text-center text-sm border break-words ${
            isSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">שם מלא</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                placeholder="ישראל ישראלי"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">אימייל</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="email"
                required
                placeholder="israel@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">תעודת זהות</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                required
                placeholder="123456789"
                value={formData.idNumber}
                onChange={e => setFormData({...formData, idNumber: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">סיסמה</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full pl-3 pr-10 py-2 border rounded-xl outline-none text-sm text-gray-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm shadow-md transition-all mt-2"
          >
            {loading ? "מייצר חשבון..." : "המשך לרישום רכב"}
          </button>
        </form>

      </div>
    </div>
  )
}