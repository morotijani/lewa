import axios from 'axios';
import { Platform } from 'react-native';

// UPDATE THIS WITH YOUR LOCAL IP IF TESTING ON PHYSICAL DEVICE
// e.g., 'http://192.168.1.5:3000/api'
const BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.0.122:3000/api' // 'http://10.0.2.2:3000/api'
    : 'http://192.168.0.122:3000/api' // 'http://localhost:3000/api';

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

export default api;
