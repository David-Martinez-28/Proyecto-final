import { useState } from 'react';
import api from '../ApiLogin/axios';

export const useApiPut = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const putData = async (endpoint, datos) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.put(endpoint, datos);
            return res.data;
        } catch (err) {
            setError(err);
            throw err; // Lanzamos el error para manejarlo en el componente
        } finally {
            setLoading(false);
        }
    };

    return { putData, loading, error };
}; 