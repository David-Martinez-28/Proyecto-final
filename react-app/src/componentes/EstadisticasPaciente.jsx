// src/components/EvolucionPaciente.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/ApiLogin/useAuth'; // Para reconocer al paciente si entra solo
import api from '../hooks/ApiLogin/axios'; // Usamos la instancia directa de axios para evitar romper los Hooks
import EvolucionCorporal from './EvolucionCorporal';

const EstadisticasPaciente = () => {
    const { id } = useParams(); // Captura el :id si entra el dietista
    const { user } = useAuth(); // Captura el usuario logueado si entra el paciente
    const navigate = useNavigate();
    
    const [stats, setStats] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarStats = async () => {
            // DOBLE VALIDACIÓN: Si hay ID en la URL lo usa (dietista). Si no, usa el del paciente logueado.
            const targetId = id || user?.paciente?.id;

            if (!targetId) {
                setCargando(false);
                return;
            }

            try {
                setCargando(true);
                // Evitamos el error 304 Not Modified añadiendo un timestamp aleatorio
                const timestamp = new Date().getTime();
                
                const response = await api.get(`/paciente/${targetId}/estadisticas?t=${timestamp}`);
                setStats(response.data);
            } catch (err) {
                console.error("Error al obtener la evolución corporal:", err);
                setError("No se pudo cargar el historial de evolución corporal.");
            } finally {
                setCargando(false);
            }
        };

        if (user) {
            cargarStats();
        }
    }, [id, user]);

    // 1. Estado de carga
    if (cargando) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    // 2. Estado de error de la API
    if (error) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger">{error}</Alert>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Volver</Button>
            </Container>
        );
    }

    // 3. Renderizado correcto pasando las props al hijo
    return (
        <Container className="py-4">
            <Button 
                variant="link" 
                onClick={() => navigate(-1)} 
                className="mb-3 text-decoration-none text-secondary p-0"
            >
                ← Volver atrás
            </Button>
            
            {/* Aquí inyectamos los datos por props al componente de los gráficos */}
            <EvolucionCorporal stats={stats} />
        </Container>
    );
};

export default EstadisticasPaciente;