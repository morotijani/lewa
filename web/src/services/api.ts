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

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    registerMerchant: (data: any) => api.post('/auth/register-merchant', data),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getCouriers: () => api.get('/admin/couriers'),
    getOrders: () => api.get('/admin/orders'),
    getMerchants: () => api.get('/admin/merchants'),
    verifyMerchant: (id: string, status: string) => api.patch(`/admin/merchants/${id}/status`, { status }),
};

export const merchantApi = {
    getMenu: (merchantId: string) => api.get(`/merchant/${merchantId}/menu`),
    addMenuItem: (merchantId: string, item: any) => api.post(`/merchant/${merchantId}/menu`, item),
    updateMenuItem: (itemId: string, item: any) => api.patch(`/merchant/menu/${itemId}`, item),
    deleteMenuItem: (itemId: string) => api.delete(`/merchant/menu/${itemId}`),
    getOrders: (merchantId: string) => api.get(`/merchant/${merchantId}/orders`),
    updateOrderStatus: (orderId: string, status: string) => api.patch(`/orders/${orderId}/status`, { status }),

    updateMerchant: (merchantId: string, data: any) => api.patch(`/merchant/${merchantId}`, data),
};

export default api;
