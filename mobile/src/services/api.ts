import axios from 'axios';
import { Platform } from 'react-native';

// UPDATE THIS WITH YOUR LOCAL IP IF TESTING ON PHYSICAL DEVICE
// e.g., 'http://192.168.1.5:3000/api'
const BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.0.122:3000/api'
    : 'http://192.168.0.122:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
};

export const courierApi = {
    updateStatus: (data: { userId: string, isOnline: boolean, lat: number, lng: number }) => api.post('/couriers/status', data),
    createProfile: (data: { userId: string, vehicleType: string, licensePlate: string }) => api.post('/couriers/create', data),
    getProfile: (userId: string) => api.get(`/couriers/profile/${userId}`),
};

export const orderApi = {
    create: (data: any) => api.post('/orders', data),
    updateStatus: (orderId: string, status: string, userId: string) => api.patch(`/orders/${orderId}/status`, { status, userId }),
    getMyOrders: (userId: string) => api.get(`/orders/user/${userId}`),
};

export default api;
