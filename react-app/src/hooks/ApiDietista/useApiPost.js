import api from '../ApiLogin/axios';

const useApiPost = async (endpoint, datos) => {
    try {
        const res = await api.post(endpoint, datos);
        // Normalmente en un POST devolvemos la respuesta completa o un boolean
        return res.data; 
    } catch (error) {
        console.error("Error en POST:", error);
        return null; // Devuelve null si falla para que el componente lo sepa
    }
};

export default useApiPost;