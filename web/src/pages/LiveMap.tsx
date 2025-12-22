import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { adminApi } from '../services/api';

// Fix for leaflet marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const courierIcon = L.divIcon({
    html: '<div style="background-color: white; border-radius: 50%; padding: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 20px; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center;">🚴</div>',
    className: '', // Clear default styles
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Center
    popupAnchor: [0, -16]
});

const LiveMap = () => {
    const [couriers, setCouriers] = useState<any[]>([]);

    useEffect(() => {
        const fetchCouriers = async () => {
            try {
                const res = await adminApi.getCouriers();
                setCouriers(res.data);
            } catch (err) {
                console.error('Failed to fetch couriers', err);
            }
        };

        fetchCouriers();
        // Poll every 5s for live movement
        const interval = setInterval(fetchCouriers, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapContainer center={[5.6037, -0.1870]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {couriers.map(courier => (
                    <Marker
                        key={courier.id}
                        position={[parseFloat(courier.current_lat), parseFloat(courier.current_lng)]}
                        icon={courierIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <strong className="block text-gray-800">{courier.full_name}</strong>
                                <div className="text-xs text-gray-500 mb-1">{courier.vehicle_type}</div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    Online
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
