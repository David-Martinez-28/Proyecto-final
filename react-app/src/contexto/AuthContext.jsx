import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../hooks/ApiLogin/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 1. Nuevo estado de carga

    // 2. Verificar sesión al recargar
    useEffect(() => {
        const verificarSesion = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Configuramos el token para todas las peticiones
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Pedimos al backend quién es el usuario actual
                    const { data } = await api.get('/user'); 
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem('token'); // Si el token es inválido, limpiamos
                }
            }
            setLoading(false); // Ya terminamos de comprobar
        };
        verificarSesion();
    }, []);

    const login = async (credentials) => {
        const { data } = await api.post('/login', credentials);
        localStorage.setItem('token', data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        await api.post('/logout').catch(() => {});
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};