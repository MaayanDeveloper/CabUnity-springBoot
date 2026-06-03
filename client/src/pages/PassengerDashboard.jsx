import React, { useState, useEffect } from 'react';
import { passengerApi } from '../api/cabUnityApi';
import MapView from '../components/MapView';
import { MapPin, Navigation, Users, Car, Loader2 } from 'lucide-react';

export default function PassengerDashboard({ user }) {
  const [isShared, setIsShared] = useState(true);
  const [seats, setSeats] = useState(1);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  
  const [originAddress, setOriginAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const [mapCenter, setMapCenter] = useState([32.085, 34.878]);
  const [loading, setLoading] = useState(false);
  const [rideStatus, setRideStatus] = useState(null);
  const [currentRide, setCurrentRide] = useState(null);

  // פונקציה חכמה שמנקה ומקצרת את הכתובת הציבורית לפורמט של גוגל מפס
  const formatGoogleStyleAddress = (item) => {
    const address = item.address;
    if (!address) return item.display_name;

    // חילוץ החלקים המעניינים באמת
    const road = address.road || address.pedestrian || address.suburb || '';
    const houseNumber = address.house_number || '';
    const city = address.city || address.town || address.village || address.city_district || '';

    if (road && city) {
      return `${road} ${houseNumber}`.trim() + `, ${city}`;
    }
    
    // במידה ומדובר במקום מוכר (כמו קניון או בית חולים) ולא רחוב
    const mainName = item.display_name.split(',')[0];
    if (city && mainName !== city) {
      return `${mainName}, ${city}`;
    }

    return mainName;
  };

  const fetchSuggestions = async (text, setSuggestions) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=il&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (originAddress && !originAddress.includes('(') && (!origin || originAddress !== origin.name)) {
        fetchSuggestions(originAddress, setOriginSuggestions);
      }
    }, 350);
    return () => clearTimeout(delayDebounceFn);
  }, [originAddress]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (destAddress && !destAddress.includes('(') && (!destination || destAddress !== destination.name)) {
        fetchSuggestions(destAddress, setDestSuggestions);
      }
    }, 350);
    return () => clearTimeout(delayDebounceFn);
  }, [destAddress]);

const handleSelectSuggestion = (type, item) => {
    let cleanAddress = formatGoogleStyleAddress(item);
    
    // טריק חכם: נבדוק אם הנוסע הקליד מספר בתיבת הטקסט
    const currentInput = type === 'origin' ? originAddress : destAddress;
    const numberMatch = currentInput.match(/\d+/); // מוצא אם יש מספרים בטקסט (כמו 80)
    
    // אם המשתמש הקליד מספר והמנוע הציבורי השמיט אותו - נדביק אותו חזרה לכתובת
    if (numberMatch && !cleanAddress.match(/\d+/)) {
      const houseNumber = numberMatch[0];
      // מחליף את שם הרחוב ב-"שם הרחוב + מספר"
      cleanAddress = cleanAddress.replace(/,/, ` ${houseNumber},`);
    }

    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon), name: cleanAddress };
    setMapCenter([coords.lat, coords.lng]);

    if (type === 'origin') {
      setOrigin(coords);
      setOriginAddress(cleanAddress);
      setOriginSuggestions([]);
    } else {
      setDestination(coords);
      setDestAddress(cleanAddress);
      setDestSuggestions([]);
    }
  };

  const handlePointSelection = (type, coords) => {
    if (type === 'origin') {
      setOrigin(coords);
      setOriginAddress(`נקודה מהמפה (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`);
    }
    if (type === 'destination') {
      setDestination(coords);
      setDestAddress(`נקודה מהמפה (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`);
    }
  };

  const handleOrderRide = async () => {
    if (!origin || !destination) {
      alert('נא לבחור מיקומים מתוך ההשלמות האוטומטיות!');
      return;
    }

    setLoading(true);
    try {
      const ridePayload = {
        originAddress: originAddress,
        destinationAddress: destAddress,
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        requestedSeats: seats,
        isShared: isShared,
      };

      const createResponse = await passengerApi.createRide(user.id, ridePayload);
      const generatedRide = createResponse.data;
      setCurrentRide(generatedRide);
      setRideStatus('מפעיל אלגוריתם שידוך מול קבוצות נסיעה פנויות...');

      await passengerApi.matchToGroup(generatedRide.id);
      setRideStatus('השידוך בוצע בהצלחה! הנהג בדרך.');
      
      const updatedDetails = await passengerApi.getRideDetails(generatedRide.id);
      setCurrentRide(updatedDetails.data);
    } catch (error) {
      console.error(error);
      setRideStatus(error.response?.data?.message || 'לא נמצאה מונית שיתופית פנויה כרגע.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 dir-rtl text-right" dir="rtl">
      {/* פרופיל עליון */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">שלום, {user.name} 👋</h1>
          <p className="text-gray-500 text-xs mt-0.5">לאן נוסעים היום?</p>
        </div>
        <span className="bg-slate-50 text-gray-700 border px-3 py-1.5 rounded-xl text-xs font-bold">
          ⭐ דירוג נוסע: {user.rating}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* פאנל הזמנה בעיצוב נקי סגנון גוגל */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-5 h-fit z-30">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">פרטי נסיעה</h2>
          
          {/* שדה מוצא */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> מיקום איסוף
            </label>
            <input
              type="text"
              placeholder="הקלידי כתובת מקור..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
            />
            {/* רשימת הצעות - סגנון גוגל מפס */}
            {originSuggestions.length > 0 && (
              <ul className="absolute right-0 left-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-gray-50">
                {originSuggestions.map((item, index) => (
                  <li 
                    key={index}
                    onClick={() => handleSelectSuggestion('origin', item)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{formatGoogleStyleAddress(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* שדה יעד */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> יעד סופי
            </label>
            <input
              type="text"
              placeholder="הקלידי כתובת יעד..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
            />
            {/* רשימת הצעות - סגנון גוגל מפס */}
            {destSuggestions.length > 0 && (
              <ul className="absolute right-0 left-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-gray-50">
                {destSuggestions.map((item, index) => (
                  <li 
                    key={index}
                    onClick={() => handleSelectSuggestion('dest', item)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{formatGoogleStyleAddress(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* סוג שירות */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">סוג השירות</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsShared(true)}
                className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition ${
                  isShared ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" /> שיתופית
              </button>
              <button
                onClick={() => setIsShared(false)}
                className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition ${
                  !isShared ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Car className="w-4 h-4" /> פרטית
              </button>
            </div>
          </div>

          {/* מושבים */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">נוסעים</label>
            <input
              type="number"
              min="1"
              max="4"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center font-bold text-base"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* כפתור שליחה */}
          <button
            onClick={handleOrderRide}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:bg-gray-300 text-sm"
          >
            {loading ? 'מבצע התאמה חכמה...' : 'הזמן מונית כעת'}
          </button>

          {rideStatus && (
            <div className="p-3 bg-slate-50 border text-slate-700 rounded-xl text-xs font-medium text-center">
              {rideStatus}
            </div>
          )}
        </div>

        {/* מפה */}
        <div className="lg:col-span-2 space-y-4 z-10">
          <MapView 
            origin={origin} 
            destination={destination} 
            onSelectPoint={handlePointSelection}
            mapCenter={mapCenter}
          />
          
          {currentRide?.rideGroup?.driver && (
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl text-xl">🚕</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">המונית בדרך אלייך!</h3>
                <p className="text-xs text-gray-400 mt-0.5">רכב: {currentRide.rideGroup.driver.carModel} | מספר: {currentRide.rideGroup.driver.licensePlate}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400">מחיר</p>
                <p className="font-black text-emerald-600 text-lg">₪{currentRide.price}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}