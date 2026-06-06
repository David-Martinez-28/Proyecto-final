import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/ApiLogin/useAuth';

// Importación de tus componentes y vistas base
import Login from '../Login';
import VistaDietista from '../VistaDietista';
import VistaPaciente from '../VistaPaciente';
import Navegador from './Navegador';
import AsignarPlan from '../AsignarPlan';
import AsignarRutina from '../AsignarRutina'; 
import CrearEjercicio from '../paginas/CrearEjercicio';
import CrearIngrediente from '../paginas/CrearIngrediente';
import CrearRutina from '../paginas/CrearRutina';
import CrearComida from '../paginas/CrearComida';
import SolicitarCita from '../SolicitarCita';
import AgendaDietista from '../AgendaDietista';
import EstadisticasPaciente from '../EstadisticasPaciente';
import Perfil from '../Perfil';

// 🔥 NUEVAS IMPORTACIONES: Vistas de consulta e indexación de catálogos
import ListarEjercicios from '../paginas/ListarEjercicios';
import ListarIngredientes from '../paginas/ListarIngredientes';
import ListarRutinas from '../paginas/ListarRutinas';
import ListarComidas from '../paginas/ListarComidas';

/**
 * 1. LAYOUT PROTEGIDO GLOBAL
 * Si el usuario está logueado, le inyecta el <Navegador /> común arriba del todo.
 */
const LayoutProtegido = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
                <h5 className="mt-3 text-muted">Verificando sesión...</h5>
            </Container>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

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
            {/* 🔓 RUTA PÚBLICA */}
            <Route path="/" element={<Login />} />

            {/* 🔒 RUTAS PRIVADAS ANIDADAS */}
            <Route element={<LayoutProtegido />}>
                
                {/* 👨‍⚕️ SECCIÓN EXCLUSIVA: DIETISTAS */}
                <Route element={<FiltroPorRol rolesPermitidos={['dietista']} />}>
                    <Route path="/admin/dashboard" element={<VistaDietista />} />
                    <Route path="/dietista/paciente/:id/plan" element={<AsignarPlan />} />
                    <Route path="/dietista/paciente/:id/rutina" element={<AsignarRutina />} />
                    <Route path="/dietista/agenda" element={<AgendaDietista />} />
                    <Route path="/dietista/paciente/:id/estadisticas" element={<EstadisticasPaciente />} />
                    
                    {/* Formulación y Alta (Catálogos) */}
                    <Route path="/dietista/ejercicios" element={<CrearEjercicio />} />
                    <Route path="/dietista/ingredientes" element={<CrearIngrediente />} />
                    <Route path="/dietista/rutinas" element={<CrearRutina />} />
                    <Route path="/dietista/comidas" element={<CrearComida />} />
                    
                    {/* 🔥 NUEVAS RUTAS: Indexación y visualización de catálogos */}
                    <Route path="/dietista/listar-ejercicios" element={<ListarEjercicios />} />
                    <Route path="/dietista/listar-ingredientes" element={<ListarIngredientes />} />
                    <Route path="/dietista/listar-rutinas" element={<ListarRutinas />} />
                    <Route path="/dietista/listar-comidas" element={<ListarComidas />} />
                </Route>

                {/* 👤 SECCIÓN EXCLUSIVA: PACIENTES */}
                <Route element={<FiltroPorRol rolesPermitidos={['paciente']} />}>
                    <Route path="/mi-plan" element={<VistaPaciente />} />
                    <Route path="/paciente/estadisticas" element={<EstadisticasPaciente />} />
                    <Route path="/paciente/pedir-cita" element={<SolicitarCita />} />
                </Route>

                {/* 👥 RUTA DE PERFIL (ACCESIBLE PARA AMBOS ROLES) */}
                <Route path="/perfil" element={<Perfil />} />
            </Route>

            {/* 🔄 REDIRECCIÓN POR DEFECTO */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default Rutas;