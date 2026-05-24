import axios from 'axios';

const api = axios.create({
    // AJUSTE IMPORTANTE: Pon la URL de tu API de Laravel
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Este bloque busca el token en el almacenamiento del navegador 
// y lo mete en la "mochila" de cada petición automáticamente.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;