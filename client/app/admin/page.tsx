"use client"

import { useState, useEffect } from "react"
import { Users, Car, TrendingUp, DollarSign, Search, Trash2, Eye, ChevronLeft, UserCheck, UserX, MapPin, Star, Phone, Mail, Calendar, Clock, ShieldCheck } from "lucide-react"
import api from "@/lib/api" // המרה לייבוא default - פותר את השגיאה!

interface User {
  id: string
  name: string
  email: string
  phone: string
  rides: number
  spent: number
  rating: number
  joinedAt: string
  status: "active" | "inactive" | "blocked"
  lastRide: string
}

interface Driver {
  id: number // ה-ID שונה ל-number בהתאם לשרת (Long)
  name: string
  email: string
  phone: string
  carModel: string
  plateNumber: string
  rides: number
  earnings: number
  rating: number
  joinedAt: string
  status: "online" | "offline" | "busy" | "blocked" | "PENDING"
  currentLocation?: string
}

const MOCK_USERS: User[] = [
  { id: "1", name: "יעל לוי", email: "yael@email.com", phone: "050-1234567", rides: 45, spent: 1250, rating: 4.8, joinedAt: "2024-01-15", status: "active", lastRide: "לפני שעה" },
  { id: "2", name: "משה כהן", email: "moshe@email.com", phone: "052-9876543", rides: 23, spent: 780, rating: 4.5, joinedAt: "2024-02-20", status: "active", lastRide: "לפני 3 שעות" },
  { id: "3", name: "רונית אברהם", email: "ronit@email.com", phone: "054-5551234", rides: 67, spent: 2100, rating: 4.9, joinedAt: "2023-11-01", status: "active", lastRide: "אתמול" },
  { id: "4", name: "דני שלום", email: "dani@email.com", phone: "053-1112222", rides: 12, spent: 340, rating: 4.2, joinedAt: "2024-03-10", status: "inactive", lastRide: "לפני שבוע" },
  { id: "5", name: "מירב גולן", email: "merav@email.com", phone: "050-9998888", rides: 89, spent: 3200, rating: 5.0, joinedAt: "2023-08-15", status: "active", lastRide: "לפני 20 דקות" },
  { id: "6", name: "אבי ישראלי", email: "avi@email.com", phone: "052-7776666", rides: 5, spent: 120, rating: 3.8, joinedAt: "2024-04-01", status: "blocked", lastRide: "לפני חודש" },
]

const MOCK_DRIVERS: Driver[] = [
  { id: 1, name: "דוד כהן", email: "david@driver.com", phone: "050-1111111", carModel: "Toyota Camry", plateNumber: "12-345-67", rides: 1247, earnings: 45000, rating: 4.9, joinedAt: "2023-06-01", status: "online", currentLocation: "תל אביב - רוטשילד" },
  { id: 2, name: "יוסי לוי", email: "yossi@driver.com", phone: "052-2222222", carModel: "Hyundai Sonata", plateNumber: "23-456-78", rides: 856, earnings: 32000, rating: 4.7, joinedAt: "2023-09-15", status: "busy", currentLocation: "רמת גן - בורסה" },
  { id: 3, name: "אחמד חסן", email: "ahmad@driver.com", phone: "054-3333333", carModel: "Mazda 6", plateNumber: "34-567-89", rides: 2103, earnings: 78000, rating: 4.95, joinedAt: "2022-12-01", status: "online", currentLocation: "חיפה - כרמל" },
  { id: 4, name: "שרה מזרחי", email: "sara@driver.com", phone: "053-4444444", carModel: "Kia K5", plateNumber: "45-678-90", rides: 534, earnings: 21000, rating: 4.6, joinedAt: "2024-01-20", status: "offline" },
  { id: 5, name: "מוחמד עלי", email: "mohamed@driver.com", phone: "050-5555555", carModel: "Toyota Corolla", plateNumber: "56-789-01", rides: 1567, earnings: 58000, rating: 4.8, joinedAt: "2023-03-10", status: "online", currentLocation: "ירושלים - מרכז" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "drivers" | "pending_drivers">("overview")
  const [users, setUsers] = useState(MOCK_USERS)
  const [drivers, setDrivers] = useState(MOCK_DRIVERS)
  const [pendingDrivers, setPendingDrivers] = useState<Driver[]>([]) // סטייט ייעודי לנהגים מהשרת
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [loadingPending, setLoadingPending] = useState(false)

  // 📡 פונקציה המושכת את הנהגים הממתינים מהקונטרולר של מעיין (AdminClr)
  const loadPendingDrivers = async () => {
    try {
      setLoadingPending(true)
      // שימי לב: ה-api.ts שלך מוסיף אוטומטית '/api', לכן כאן אנו קוראים להמשך הכתובת
      const response = await api.get('/admin/drivers/pending')
      setPendingDrivers(response.data)
    } catch (error) {
      console.error("שגיאה בטעינת נהגים ממתינים:", error)
    } finally {
      setLoadingPending(false)
    }
  }

  // הפעלת שליפת הממתינים ברגע שעוברים לטאב הרלוונטי
  useEffect(() => {
    if (activeTab === "pending_drivers") {
      loadPendingDrivers()
    }
  }, [activeTab])

  // פונקציית אישור / דחיית נהג דרך ה-API האמיתי בשרת
  const handleDriverApproval = async (driverId: number, isApproved: boolean) => {
    try {
      await api.put(`/admin/drivers/${driverId}/approve?isApproved=${isApproved}`)
      // הסרת הנהג שטופל מהרשימה המוצגת במסך
      setPendingDrivers(pendingDrivers.filter(d => d.id !== driverId))
      alert(isApproved ? "הנהג אושר בהצלחה והפך לפעיל!" : "בקשת הנהג נדחתה.")
    } catch (error) {
      console.error("שגיאה בעדכון סטטוס הנהג:", error)
      alert("נכשלה פעולת העדכון. ודאי ששרת ה-Spring Boot דולק.")
    }
  }

  const stats = {
    totalUsers: users.length,
    totalDrivers: drivers.length,
    activeRides: drivers.filter(d => d.status === "busy").length,
    todayRevenue: 12450,
    onlineDrivers: drivers.filter(d => d.status === "online" || d.status === "busy").length,
  }

  const filteredUsers = users.filter(u => 
    u.name.includes(searchQuery) || u.email.includes(searchQuery) || u.phone.includes(searchQuery)
  )

  const filteredDrivers = drivers.filter(d => 
    d.name.includes(searchQuery) || d.email.includes(searchQuery) || d.plateNumber.includes(searchQuery)
  )

  const filteredPendingDrivers = pendingDrivers.filter(d =>
    d.name.includes(searchQuery) || d.carModel.includes(searchQuery) || d.plateNumber.includes(searchQuery)
  )

  const deleteUser = (id: string) => {
    if (confirm("האם למחוק את המשתמש?")) {
      setUsers(users.filter(u => u.id !== id))
      setSelectedUser(null)
    }
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u
    ))
  }

  const toggleDriverStatus = (id: number) => {
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, status: d.status === "blocked" ? "offline" : "blocked" } : d
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "online": return "bg-emerald-500"
      case "busy": return "bg-amber-500"
      case "inactive": case "offline": return "bg-muted-foreground"
      case "blocked": return "bg-destructive"
      default: return "bg-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "פעיל"
      case "online": return "מקוון"
      case "busy": return "בנסיעה"
      case "inactive": return "לא פעיל"
      case "offline": return "לא מקוון"
      case "blocked": return "חסום"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5 rotate-180" />
              <span className="text-sm">חזרה לבית</span>
            </a>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <h1 className="text-xl font-bold">לוח בקרה - מנהל</h1>
              <p className="text-xs text-white/70">CabUnity Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm">{stats.onlineDrivers} נהגים מקוונים</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "סקירה כללית", icon: TrendingUp },
            { id: "users", label: "משתמשים", icon: Users },
            { id: "drivers", label: "נהגים פעילים", icon: Car },
            { id: "pending_drivers", label: "ממתינים לאישור", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.id === "pending_drivers" && pendingDrivers.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full mr-1">
                    {pendingDrivers.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "סה״כ משתמשים", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-blue-600" },
                { label: "סה״כ נהגים", value: stats.totalDrivers, icon: Car, color: "from-emerald-500 to-emerald-600" },
                { label: "נסיעות פעילות", value: stats.activeRides, icon: MapPin, color: "from-amber-500 to-amber-600" },
                { label: "הכנסות היום", value: `${stats.todayRevenue.toLocaleString()} ש"ח`, icon: DollarSign, color: "from-blue-600 to-indigo-600" },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" /> נהגים מקוונים
                </h3>
                <div className="space-y-3">
                  {drivers.filter(d => d.status === "online" || d.status === "busy").slice(0, 4).map((driver) => (
                    <div key={driver.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                        <p className="text-xs text-gray-500 truncate">{driver.currentLocation}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(driver.status)}`}>
                        {getStatusText(driver.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> משתמשים מובילים
                </h3>
                <div className="space-y-3">
                  {users.sort((a, b) => b.rides - a.rides).slice(0, 4).map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.rides} נסיעות</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{user.spent} ש״ח</p>
                        <p className="text-xs text-gray-500">הוצאות</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפש משתמש לפי שם, אימייל או טלפון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-800"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-500 text-sm font-medium">
                      <th className="p-4">משתמש</th>
                      <th className="p-4">טלפון</th>
                      <th className="p-4">נסיעות</th>
                      <th className="p-4">הוצאות</th>
                      <th className="p-4">דירוג</th>
                      <th className="p-4">סטטוס</th>
                      <th className="p-4">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{user.phone}</td>
                        <td className="p-4 text-sm">{user.rides}</td>
                        <td className="p-4 text-sm font-medium">{user.spent} ש״ח</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm">{user.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedUser(user)} className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => toggleUserStatus(user.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                              {user.status === "blocked" ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <UserX className="w-4 h-4 text-amber-500" />}
                            </button>
                            <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפש נהג לפי שם, אימייל או מספר רכב..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-800"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-500">{driver.carModel}</p>
                        <p className="text-xs font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded inline-block mt-0.5">{driver.plateNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{driver.rides}</p>
                      <p className="text-xs text-gray-500">נסיעות</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{driver.earnings.toLocaleString()} ש״ח</p>
                      <p className="text-xs text-gray-500">הכנסות</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedDriver(driver)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200/80 rounded-xl text-sm font-medium transition-colors">פרטים</button>
                    <button onClick={() => toggleDriverStatus(driver.id)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${driver.status === "blocked" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                      {driver.status === "blocked" ? "בטל חסימה" : "חסום"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🛡️ Pending Drivers Tab - הלשונית החכמה שמחוברת אש לשרת האמיתי */}
        {activeTab === "pending_drivers" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפש בממתינים לפי שם, רכב..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-800"
              />
            </div>

            {loadingPending ? (
              <p className="text-center py-8 text-gray-500 animate-pulse">מושך בקשות נהגים חמות מהסרבר שלכן...</p>
            ) : filteredPendingDrivers.length === 0 ? (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl text-center border border-emerald-200 font-medium">
                🎉 אין בקשות הצטרפות שממתינות לאישור כרגע!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPendingDrivers.map((driver) => (
                  <div key={driver.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                            {driver.name ? driver.name.charAt(0) : "N"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{driver.name || "נהג חדש"}</h3>
                            <p className="text-xs text-gray-500 font-mono">מזהה מערכת: #{driver.id}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-amber-800 bg-amber-100 animate-pulse">
                          ממתין לבדיקה
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl mb-4">
                        <p><strong>🚘 דגם רכב:</strong> {driver.carModel || 'לא מולא'}</p>
                        <p><strong>🔢 מספר לוחית:</strong> <span className="font-mono text-xs bg-white border px-1 rounded">{driver.plateNumber || 'חסר'}</span></p>
                        <p><strong>📞 טלפון נייד:</strong> {driver.phone || 'לא צוין'}</p>
                        <p><strong>✉️ אימייל:</strong> {driver.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t pt-3 mt-2">
                      <button 
                        onClick={() => handleDriverApproval(driver.id, true)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
                      >
                        אישור נהג
                      </button>
                      <button 
                        onClick={() => handleDriverApproval(driver.id, false)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium transition-all"
                      >
                        דחייה
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedUser.status)}`}>
                  {getStatusText(selectedUser.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Mail className="w-5 h-5 text-gray-400" /><span className="text-sm">{selectedUser.email}</span></div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Phone className="w-5 h-5 text-gray-400" /><span className="text-sm">{selectedUser.phone}</span></div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Calendar className="w-5 h-5 text-gray-400" /><span className="text-sm">הצטרף ב-{selectedUser.joinedAt}</span></div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Clock className="w-5 h-5 text-gray-400" /><span className="text-sm">נסיעה אחרונה: {selectedUser.lastRide}</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-gray-900">{selectedUser.rides}</p><p className="text-xs text-gray-500">נסיעות</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-gray-900">{selectedUser.spent} ש״ח</p><p className="text-xs text-gray-500">הוצאות</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="text-xl font-bold text-gray-900">{selectedUser.rating}</span></div><p className="text-xs text-gray-500">דירוג</p></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">סגור</button>
              <button onClick={() => deleteUser(selectedUser.id)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition-colors">מחק משתמש</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDriver(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedDriver.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedDriver.name}</h2>
                <p className="text-sm text-gray-500">{selectedDriver.carModel}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedDriver.status)}`}>
                  {getStatusText(selectedDriver.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Mail className="w-5 h-5 text-gray-400" /><span>{selectedDriver.email}</span></div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Phone className="w-5 h-5 text-gray-400" /><span>{selectedDriver.phone}</span></div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Car className="w-5 h-5 text-gray-400" /><span className="font-mono">{selectedDriver.plateNumber}</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-gray-900">{selectedDriver.rides}</p><p className="text-xs text-gray-500">נסיעות</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xl font-bold text-gray-900">{selectedDriver.earnings.toLocaleString()}</p><p className="text-xs text-gray-500">הכנסות ש״ח</p></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="text-xl font-bold text-gray-900">{selectedDriver.rating}</span></div><p className="text-xs text-gray-500">דירוג</p></div>
            </div>

            <button onClick={() => setSelectedDriver(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">סגור</button>
          </div>
        </div>
      )}
    </div>
  )
}