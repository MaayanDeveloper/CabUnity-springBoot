import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  const handleSubmit = (e) => {
    e.preventDefault();
    // דמו של יוזר שנשמר בסטייט הגלובלי של האפליקציה
    const mockUser = {
      id: role === 'DRIVER' ? 2 : 1, // ID דמו של נהג או נוסע
      idNumber: 123456789,
      name: role === 'DRIVER' ? "משה הנהג" : "חיה שפרונג",
      email: email || "chaya@example.com",
      role: role,
      rating: 4.8
    };
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dir-rtl" dir="rtl">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-indigo-600 tracking-tight">CabUnity</h2>
          <p className="mt-2 text-sm text-gray-500">ניהול נסיעות שיתופיות חכם</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג משתמש</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">נוסע / משתמש רגיל</option>
                <option value="DRIVER">נהג מונית</option>
                <option value="ADMIN">מנהל מערכת</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            התחבר למערכת
          </button>
        </form>
      </div>
    </div>
  );
}