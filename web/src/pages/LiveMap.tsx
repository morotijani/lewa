import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet marker icon issue in webpack/vite
import L from 'leaflet';
// You might need to import marker images locally or set URLs manually
// For this snippet, we'll assume standard setup or just circles

const LiveMap = () => {
    // Mock courier data
    const couriers = [
        { id: 1, name: 'Kweku A', lat: 5.6037, lng: -0.1870, status: 'Active' }, // Accra
        { id: 2, name: 'Yaw B', lat: 5.6140, lng: -0.1960, status: 'Idle' },
    ];

    return (
        <div className="h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {couriers.map(courier => (
                    <Marker key={courier.id} position={[courier.lat, courier.lng]}>
                        <Popup>
                            <div className="text-center">
                                <strong className="block text-gray-800">{courier.name}</strong>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${courier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {courier.status}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
