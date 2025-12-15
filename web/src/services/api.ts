import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Env variable in real app
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptors for auth token injection here later
// api.interceptors.request.use((config) => { ... });

export default api;
