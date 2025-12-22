import axios from 'axios';

// IMPORTANT: Update this if testing on a different device, but for localhost dev it's fine.
// If using from another device on network, use LAN IP (192.168.0.122)
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getCouriers: () => api.get('/admin/couriers'),
    getOrders: () => api.get('/admin/orders'),
};

export default api;
