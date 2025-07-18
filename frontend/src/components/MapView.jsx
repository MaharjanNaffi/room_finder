import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ rooms }) => {
  return (
    <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {rooms.map((room) => (
        <Marker
          key={room.id}
          position={[room.latitude || 27.7172, room.longitude || 85.3240]}
        >
          <Popup>
            <strong>{room.title}</strong><br />
            {room.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
