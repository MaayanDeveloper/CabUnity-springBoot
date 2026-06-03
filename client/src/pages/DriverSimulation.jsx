import React, { useState, useEffect } from 'react';
import { driverApi } from '../api/cabUnityApi';

export default function DriverSimulation({ user }) {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [logStatus, setLogStatus] = useState('לא במשמרת');

  // שימוש ב-HTML5 Geolocation API לאיסוף מיקום אמיתי מהחומרה של המכשיר
  useEffect(() => {
    let watchId = null;

    if (isShiftActive) {
      if ("geolocation" in navigator) {
        setLogStatus('מתחבר ל-GPS ומעדכן שרת...');
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });
            
            try {
              // שליחה לשרת לקונטרולר לפי ה-API שחיה הגדירה המקבל Query Parameters
              await driverApi.updateLocation(user.id, latitude, longitude);
              setLogStatus(`מיקום עודכן בהצלחה בשרת: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } catch (err) {
              setLogStatus('שגיאה בשידור המיקום ל-Spring Boot');
            }
          },
          (error) => setLogStatus(`שגיאת חומרת GPS: ${error.message}`),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setLogStatus('הדפדפן אינו תומך בשירותי מיקום');
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isShiftActive, user.id]);

  const toggleShift = async () => {
    try {
      if (!isShiftActive) {
        await driverApi.startShift(user.id);
        await driverApi.changeAvailability(user.id, true);
        setIsShiftActive(true);
      } else {
        await driverApi.changeAvailability(user.id, false);
        setIsShiftActive(false);
        setLogStatus('המשמרת הופסקה');
      }
    } catch (error) {
      alert('וודא כי הנהג מאושר ע״י מנהל המערכת בבסיס הנתונים!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 text-center dir-rtl" dir="rtl">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
        🛠️
      </div>
      <h2 className="text-2xl font-bold text-gray-800">מסך סימולציית נהג CabUnity</h2>
      <p className="text-xs text-gray-400 mt-1">עדכוני חומרה וגאולוקיישן לשרת</p>

      <div className="my-6 p-4 bg-gray-50 rounded-xl space-y-2 text-sm text-right">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">מזהה נהג:</span>
          <span className="font-mono font-bold">{user.id}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">קו רוחב (Lat):</span>
          <span className="font-mono font-bold text-indigo-600">{coords.lat || 'ממתין...'}</span>
        </div>
        <div className="flex justify-between pb-1">
          <span className="text-gray-500">קו אורך (Lng):</span>
          <span className="font-mono font-bold text-indigo-600">{coords.lng || 'ממתין...'}</span>
        </div>
      </div>

      <button
        onClick={toggleShift}
        className={`w-full py-3.5 font-bold rounded-xl shadow transition ${
          isShiftActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isShiftActive ? 'סיום משמרת וכבוי סימולציה' : 'תחילת משמרת והפעלת שידור GPS'}
      </button>

      <div className="mt-4 text-xs font-semibold text-gray-500">
        סטטוס תקשורת: <span className="text-amber-600 font-medium">{logStatus}</span>
      </div>
    </div>
  );
}