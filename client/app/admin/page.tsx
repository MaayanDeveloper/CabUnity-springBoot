"use client"

import { useState } from "react"
import { Users, Car, TrendingUp, DollarSign, Search, Trash2, Eye, MoreVertical, ChevronLeft, UserCheck, UserX, MapPin, Star, Phone, Mail, Calendar, Clock } from "lucide-react"

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
  id: string
  name: string
  email: string
  phone: string
  carModel: string
  plateNumber: string
  rides: number
  earnings: number
  rating: number
  joinedAt: string
  status: "online" | "offline" | "busy" | "blocked"
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
  { id: "1", name: "דוד כהן", email: "david@driver.com", phone: "050-1111111", carModel: "Toyota Camry", plateNumber: "12-345-67", rides: 1247, earnings: 45000, rating: 4.9, joinedAt: "2023-06-01", status: "online", currentLocation: "תל אביב - רוטשילד" },
  { id: "2", name: "יוסי לוי", email: "yossi@driver.com", phone: "052-2222222", carModel: "Hyundai Sonata", plateNumber: "23-456-78", rides: 856, earnings: 32000, rating: 4.7, joinedAt: "2023-09-15", status: "busy", currentLocation: "רמת גן - בורסה" },
  { id: "3", name: "אחמד חסן", email: "ahmad@driver.com", phone: "054-3333333", carModel: "Mazda 6", plateNumber: "34-567-89", rides: 2103, earnings: 78000, rating: 4.95, joinedAt: "2022-12-01", status: "online", currentLocation: "חיפה - כרמל" },
  { id: "4", name: "שרה מזרחי", email: "sara@driver.com", phone: "053-4444444", carModel: "Kia K5", plateNumber: "45-678-90", rides: 534, earnings: 21000, rating: 4.6, joinedAt: "2024-01-20", status: "offline" },
  { id: "5", name: "מוחמד עלי", email: "mohamed@driver.com", phone: "050-5555555", carModel: "Toyota Corolla", plateNumber: "56-789-01", rides: 1567, earnings: 58000, rating: 4.8, joinedAt: "2023-03-10", status: "online", currentLocation: "ירושלים - מרכז" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "drivers">("overview")
  const [users, setUsers] = useState(MOCK_USERS)
  const [drivers, setDrivers] = useState(MOCK_DRIVERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

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

  const deleteUser = (id: string) => {
    if (confirm("האם למחוק את המשתמש?")) {
      setUsers(users.filter(u => u.id !== id))
      setSelectedUser(null)
    }
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } 
        : u
    ))
  }

  const toggleDriverStatus = (id: string) => {
    setDrivers(drivers.map(d => 
      d.id === id 
        ? { ...d, status: d.status === "blocked" ? "offline" : "blocked" } 
        : d
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-sidebar to-sidebar/90 text-sidebar-foreground p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">חזרה</span>
            </a>
            <div className="h-6 w-px bg-sidebar-border" />
            <div>
              <h1 className="text-xl font-bold">לוח בקרה - מנהל</h1>
              <p className="text-xs text-sidebar-foreground/70">CabUnity Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-sidebar-accent px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm">{stats.onlineDrivers} נהגים מקוונים</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "overview", label: "סקירה כללית", icon: TrendingUp },
            { id: "users", label: "משתמשים", icon: Users },
            { id: "drivers", label: "נהגים", icon: Car },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "סה״כ משתמשים", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-blue-600" },
                { label: "סה״כ נהגים", value: stats.totalDrivers, icon: Car, color: "from-emerald-500 to-emerald-600" },
                { label: "נסיעות פעילות", value: stats.activeRides, icon: MapPin, color: "from-amber-500 to-amber-600" },
                { label: "הכנסות היום", value: `${stats.todayRevenue.toLocaleString()} ש"ח`, icon: DollarSign, color: "from-primary to-accent" },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Online Drivers */}
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  נהגים מקוונים
                </h3>
                <div className="space-y-3">
                  {drivers.filter(d => d.status === "online" || d.status === "busy").slice(0, 4).map((driver) => (
                    <div key={driver.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{driver.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{driver.currentLocation}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(driver.status)}`}>
                        {getStatusText(driver.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  משתמשים מובילים
                </h3>
                <div className="space-y-3">
                  {users.sort((a, b) => b.rides - a.rides).slice(0, 4).map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.rides} נסיעות</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{user.spent} ש״ח</p>
                        <p className="text-xs text-muted-foreground">הוצאות</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="חפש משתמש לפי שם, אימייל או טלפון..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                dir="rtl"
              />
            </div>

            {/* Users List */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">משתמש</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">טלפון</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">נסיעות</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">הוצאות</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">דירוג</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">סטטוס</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-foreground">{user.phone}</td>
                        <td className="p-4 text-sm text-foreground">{user.rides}</td>
                        <td className="p-4 text-sm text-foreground">{user.spent} ש״ח</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm text-foreground">{user.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              aria-label="צפה בפרטים"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button 
                              onClick={() => toggleUserStatus(user.id)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              aria-label={user.status === "blocked" ? "בטל חסימה" : "חסום"}
                            >
                              {user.status === "blocked" ? (
                                <UserCheck className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <UserX className="w-4 h-4 text-amber-500" />
                              )}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                              aria-label="מחק"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
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

        {/* Drivers Tab */}
        {activeTab === "drivers" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="חפש נהג לפי שם, אימייל או מספר רכב..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                dir="rtl"
              />
            </div>

            {/* Drivers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{driver.name}</h3>
                        <p className="text-sm text-muted-foreground">{driver.carModel}</p>
                        <p className="text-xs font-mono text-primary">{driver.plateNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{driver.rides}</p>
                      <p className="text-xs text-muted-foreground">נסיעות</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{driver.earnings.toLocaleString()} ש״ח</p>
                      <p className="text-xs text-muted-foreground">הכנסות</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{driver.rating}</span>
                    </div>
                    {driver.currentLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[120px]">{driver.currentLocation}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedDriver(driver)}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium text-foreground transition-colors"
                    >
                      פרטים
                    </button>
                    <button 
                      onClick={() => toggleDriverStatus(driver.id)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        driver.status === "blocked" 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
                    >
                      {driver.status === "blocked" ? "בטל חסימה" : "חסום"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedUser.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedUser.status)}`}>
                  {getStatusText(selectedUser.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{selectedUser.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">הצטרף ב-{selectedUser.joinedAt}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">נסיעה אחרונה: {selectedUser.lastRide}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedUser.rides}</p>
                <p className="text-xs text-muted-foreground">נסיעות</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedUser.spent} ש״ח</p>
                <p className="text-xs text-muted-foreground">הוצאות</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xl font-bold text-foreground">{selectedUser.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">דירוג</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium text-foreground transition-colors"
              >
                סגור
              </button>
              <button
                onClick={() => deleteUser(selectedUser.id)}
                className="flex-1 py-3 bg-destructive hover:bg-destructive/90 rounded-xl font-medium text-white transition-colors"
              >
                מחק משתמש
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDriver(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {selectedDriver.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedDriver.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedDriver.carModel}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedDriver.status)}`}>
                  {getStatusText(selectedDriver.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{selectedDriver.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{selectedDriver.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <Car className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-mono">{selectedDriver.plateNumber}</span>
              </div>
              {selectedDriver.currentLocation && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{selectedDriver.currentLocation}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedDriver.rides}</p>
                <p className="text-xs text-muted-foreground">נסיעות</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{selectedDriver.earnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">הכנסות ש״ח</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xl font-bold text-foreground">{selectedDriver.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">דירוג</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDriver(null)}
              className="w-full py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium text-foreground transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
