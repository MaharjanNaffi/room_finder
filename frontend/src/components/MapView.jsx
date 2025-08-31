import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔵 Colored markers by room type
const getIconByRoomType = (room_type) => {
  let color;
  switch (room_type) {
    case '1BHK': color = '#3388ff'; break; // Blue
    case '2BHK': color = 'green'; break;
    case '3BHK': color = 'orange'; break;
    case '4BHK': color = 'violet'; break;
    default: color = 'red';
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color:${color};
      width:20px;
      height:20px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 3px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// 🗺 Legend component
const MapLegend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.background = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '6px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
      div.style.fontSize = '14px';
      div.style.lineHeight = '22px';
      div.innerHTML = `
        <i style="background:#3388ff;width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></i> 1BHK<br>
        <i style="background:green;width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></i> 2BHK<br>
        <i style="background:orange;width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></i> 3BHK<br>
        <i style="background:violet;width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></i> 4BHK<br>
        <i style="background:red;width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></i> Default
      `;
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
};

const MapView = ({ rooms }) => {
  const DEFAULT_LAT = 27.7172;
  const DEFAULT_LNG = 85.3240;

  return (
    <MapContainer
      center={[DEFAULT_LAT, DEFAULT_LNG]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapLegend />

      <MarkerClusterGroup>
        {Array.isArray(rooms) && rooms.map((room) => {
          const lat = room.latitude ?? DEFAULT_LAT;
          const lng = room.longitude ?? DEFAULT_LNG;
          const isDefault = lat === DEFAULT_LAT && lng === DEFAULT_LNG;

          // Slight jitter if coordinates are default
          const finalLat = isDefault ? lat + (Math.random() - 0.5) * 0.005 : lat;
          const finalLng = isDefault ? lng + (Math.random() - 0.5) * 0.005 : lng;

          return (
            <Marker
              key={room.id}
              position={[finalLat, finalLng]}
              icon={getIconByRoomType(isDefault ? null : room.room_type)}
            >
              <Popup>
                <strong>{room.title}</strong><br />
                {room.location}<br />
                Type: {room.room_type}
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
