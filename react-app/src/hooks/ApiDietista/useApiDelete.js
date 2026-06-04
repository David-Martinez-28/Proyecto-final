import api from '../ApiLogin/axios';

const useApiDelete = async (endpoint, datos = null) => {
    try {
        // En Axios, para mandar un body en un DELETE hay que envolverlo en 'data'
        const res = await api.delete(endpoint, { data: datos });
        
        // Lo habitual en un delete es devolver 'true' si fue bien
        return true; 
    } catch (error) {
        console.error("Error en DELETE:", error);
        return false; // Retorna falso para que puedas mostrar un alert() si falla
    }
};

export default useApiDelete;