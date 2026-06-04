import api from '../ApiLogin/axios';

const useApiGet = async (endpoint) => {
    try {
        const res = await api.get(endpoint);
        // Retornamos el array o el objeto envuelto en data
        return Array.isArray(res.data) ? res.data : res.data.data;
    } catch (error) {
        console.error("Error en GET:", error);
        return null;
    }
};

export default useApiGet;