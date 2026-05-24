// componentes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};