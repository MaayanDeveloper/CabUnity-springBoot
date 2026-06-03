import React, { useState } from 'react';
import Login from './pages/Login';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverSimulation from './pages/DriverSimulation';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* תפריט עליון פשוט */}
      <nav className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center shadow-sm">
        <button 
          onClick={() => setCurrentUser(null)}
          className="text-xs font-bold text-red-500 hover:underline"
        >
          התנתק מהמערכת
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">{currentUser.name}</span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {currentUser.name[0]}
          </div>
        </div>
      </nav>

      {/* רנדור תצוגה מבוססת תפקיד שהתקבל מהשרת */}
      <main className="py-6">
        {currentUser.role === 'USER' && <PassengerDashboard user={currentUser} />}
        {currentUser.role === 'DRIVER' && <DriverSimulation user={currentUser} />}
        {currentUser.role === 'ADMIN' && (
          <div className="text-center mt-12 font-bold text-gray-600">דשבורד מנהל ייבנה בשלב הבא בהתאם לקוד השרת!</div>
        )}
      </main>
    </div>
  );
}