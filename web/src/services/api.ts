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

export const merchantApi = {
    getMenu: (merchantId: string) => api.get(`/merchant/${merchantId}/menu`),
    addMenuItem: (merchantId: string, data: any) => api.post(`/merchant/${merchantId}/menu`, data),
    updateMenuItem: (itemId: string, data: any) => api.patch(`/merchant/menu/${itemId}`, data),
    deleteMenuItem: (itemId: string) => api.delete(`/merchant/menu/${itemId}`),
    getOrders: (merchantId: string) => api.get(`/merchant/${merchantId}/orders`),
    updateOrderStatus: (orderId: string, status: string) => api.patch(`/orders/${orderId}/status`, { status, userId: 'merchant-demo' }),
};

export default api;
