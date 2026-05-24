import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/ApiLogin/useAuth';

// Importación de tus componentes y vistas
import Login from '../Login';
import VistaDietista from '../VistaDietista';
import VistaPaciente from '../VistaPaciente';
import Navegador from './Navegador';
import AsignarPlan from '../AsignarPlan';
import AsignarRutina from '../AsignarRutina'; // O la ruta donde lo hayas guardado

/**
 * 1. LAYOUT PROTEGIDO GLOBAL
 * Este componente envuelve a todas las rutas privadas.
 * Si el usuario no está logueado, lo echa al Login.
 * Si está logueado, le inyecta el <Navegador /> común arriba del todo.
 */
const LayoutProtegido = () => {
    const { user, loading } = useAuth();

    // Mientras el contexto comprueba si el token de localStorage es válido
    if (loading) {
        return (
            <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
                <h5 className="mt-3 text-muted">Verificando sesión...</h5>
            </Container>
        );
    }

    // Si terminó de cargar y no hay ningún usuario en el estado, redirige al Login público
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Si hay usuario, pintamos el Navegador reutilizable y el contenido interno (Outlet)
    return (
        <div className="bg-light min-vh-100">
            <Navegador />
            <Outlet />
        </div>
    );
};

/**
 * 2. GUARDA DE ROL
 * Controla que el usuario logueado tenga el rol permitido para esa URL.
 * Si un paciente intenta escribir "/admin/dashboard" a mano, este componente
 * lo detecta y lo redirige automáticamente a su zona correcta (" /mi-plan ").
 */
const FiltroPorRol = ({ rolesPermitidos }) => {
    const { user } = useAuth();

    if (!rolesPermitidos.includes(user?.role)) {
        return user?.role === 'dietista'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/mi-plan" replace />;
    }

    return <Outlet />;
};

/**
 * 3. COMPONENTE PRINCIPAL DE RUTAS
 */
const Rutas = () => {
    return (
        <Routes>
            {/* 🔓 RUTA PÚBLICA: Aquí el Navegador NO se renderiza */}
            <Route path="/" element={<Login />} />

            {/* 🔒 RUTAS PRIVADAS ANIDADAS: Todas estas comparten el Navegador automáticamente */}
            <Route element={<LayoutProtegido />}>

                {/* SECCIÓN EXCLUSIVA: DIETISTAS */}
                <Route element={<FiltroPorRol rolesPermitidos={['dietista']} />}>
                    <Route path="/admin/dashboard" element={<VistaDietista />} />
                    {/* Nueva ruta dinámica para gestionar el plan semanal de cada paciente */}
                    <Route path="/admin/paciente/:id/plan" element={<AsignarPlan />} />
                    <Route path="/admin/paciente/:id/rutina" element={<AsignarRutina />} />
                </Route>

                {/*  SECCIÓN EXCLUSIVA: PACIENTES */}
                <Route element={<FiltroPorRol rolesPermitidos={['paciente']} />}>
                    <Route path="/mi-plan" element={<VistaPaciente />} />
                    {/* Nueva ruta activa para ver la receta e ingredientes del plato en grande */}
                    
                </Route>

            </Route>

            {/* 🔄 REDIRECCIÓN POR DEFECTO: Si escriben cualquier otra cosa, al Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default Rutas;