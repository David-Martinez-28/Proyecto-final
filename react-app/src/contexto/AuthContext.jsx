import { createContext, useState, useEffect } from 'react';
import api from '../hooks/ApiLogin/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/user')
                .then(res => setUser(res.data))
                .catch(() => logout()) 
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            const res = await api.post('/login', credentials);
            
            // 1. Guardamos el token en localStorage
            localStorage.setItem('token', res.data.access_token);
            
            // 2. Configuramos axios para que use el token en futuras peticiones
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
            
            // 3. Actualizamos el estado global
            setUser(res.data.user);

            // --- LÍNEA CLAVE ---
            // Devolvemos los datos del usuario para que el Login.jsx 
            // pueda leer el .role y redirigir.
            return res.data.user; 

        } catch (error) {
            // --- LÍNEA CLAVE ---
            // Lanzamos el error para que el 'catch' del componente Login.jsx
            // se ejecute y muestre el alert de error.
            throw error; 
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization']; // Limpiamos cabecera
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};