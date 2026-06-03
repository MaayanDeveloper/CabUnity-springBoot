import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// תיקון באג האייקונים המוכר של Leaflet בריאקט
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// אייקונים מותאמים אישית למוצא ויעד
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// רכיב פנימי שמקשיב ללחיצות על המפה
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// רכיב פנימי שמעדכן את מרכז המפה כשהנוסע מחפש כתובת
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function MapView({ origin, destination, onSelectPoint, mapCenter }) {
  // מרכז ברירת מחדל: מרכז בני ברק / גוש דן
  const defaultCenter = [32.085, 34.878];

  const handleMapClick = (latlng) => {
    // אם לא נבחר מוצא, לחיצה ראשונה תקבע מוצא. אחרת יעד.
    if (!origin) {
      onSelectPoint('origin', { lat: latlng.lat, lng: latlng.lng });
    } else if (!destination) {
      onSelectPoint('destination', { lat: latlng.lat, lng: latlng.lng });
    }
  };

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0">
      <MapContainer 
        center={mapCenter || defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        <ChangeMapView center={mapCenter} />

        {/* מרקר מוצא */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>📍 נקודת האיסוף שלך</Popup>
          </Marker>
        )}

        {/* מרקר יעד */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup>🏁 היעד שלך</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}