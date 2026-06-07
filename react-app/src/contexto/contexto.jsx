import React, { createContext, useState, useCallback, useContext, useEffect } from "react"; 
import useApiGet from "../hooks/ApiDietista/useApiGet.js";
import useApiPost from "../hooks/ApiDietista/useApiPost.js";
import useApiDelete from "../hooks/ApiDietista/useApiDelete.js";

export const contextoClinica = createContext();

export const ClinicaProvider = ({ children }) => {
    // --- ESTADOS DE PACIENTES Y PLANES ---
    const [pacientes, setPacientes] = useState([]);
    const [datosPlan, setDatosPlan] = useState(null);
    const [historialDietas, setHistorialDietas] = useState({});

    // --- ESTADOS DE CITAS Y NOTIFICACIONES ---
    const [citas, setCitas] = useState([]); // Historial del Dietista
    const [citasPaciente, setCitasPaciente] = useState([]); // Historial del Paciente logueado
    const [cargandoCitas, setCargandoCitas] = useState(true);
    const [notificaciones, setNotificaciones] = useState([]);

    // ----------------------------------------------------
    // LOGICA DE PACIENTES
    // ----------------------------------------------------
    const iniciarPacientes = useCallback(async () => {
        const data = await useApiGet('/pacientes');
        if (data) {
            setPacientes(Array.isArray(data) ? data : (data.data || []));
        }
    }, []);

    const insertarPaciente = async (nuevoPaciente) => {
        const exito = await useApiPost('/register', { ...nuevoPaciente, role: 'paciente' });
        if (exito) {
            await iniciarPacientes();
            return true;
        }
        return false;
    };

    const eliminarPaciente = async (identificador) => {
        const exito = await useApiDelete(`/pacientes/${identificador}`);
        if (exito) {
            await iniciarPacientes();
        }
    };
    

    // ----------------------------------------------------
    // LOGICA DEL PLAN DEL PACIENTE
    // ----------------------------------------------------
    const cargarMiPlan = useCallback(async () => {
        const data = await useApiGet('/mi-plan');
        if (data) {
            const planData = data.data || data;
            setDatosPlan(planData);

            if (planData?.comidas) {
                const archivadas = planData.comidas.filter(c => c.pivot?.estado === 'archivada');
                const agrupadas = archivadas.reduce((grupos, comida) => {
                    const clave = comida.pivot.fecha_fin ? `Plan cerrado el ${comida.pivot.fecha_fin}` : "Plan antiguo";
                    if (!grupos[clave]) grupos[clave] = [];
                    groups[clave].push(comida);
                    return grupos;
                }, {});
                setHistorialDietas(agrupadas);
            }
        }
    }, []);

    const registrarEstadistica = async (nuevasStats, pacienteId = null) => {
        const url = pacienteId ? `/pacientes/estadisticas/${pacienteId}` : '/pacientes/estadisticas';
        const exito = await useApiPost(url, nuevasStats);

        if (exito) {
            await iniciarPacientes();
            return true;
        }
        return false;
    };

    // ----------------------------------------------------
    // LOGICA DE CITAS (DIETISTA Y PACIENTE)
    // ----------------------------------------------------
    const cargarCitas = useCallback(async () => {
        setCargandoCitas(true);
        const data = await useApiGet('/dietista/mis-citas');
        if (data) {
            setCitas(Array.isArray(data) ? data : []);
        }
        setCargandoCitas(false);
    }, []);

    const cargarCitasPaciente = useCallback(async () => {
        const data = await useApiGet('/paciente/mis-citas');
        if (data) {
            setCitasPaciente(Array.isArray(data) ? data : []);
        }
    }, []);

    // 🔥 TOTALMENTE CORREGIDO: Ahora acepta el payload con el motivo de cancelación y refresca todo en caliente
    const cambiarEstadoCita = async (citaId, nuevoEstado, datosAdicionales = {}) => {
        try {
            // Mandamos el estado obligatorio junto con el motivo_cancelacion (si viene) en el body
            await useApiPost(`/citas/${citaId}/estado`, { 
                estado: nuevoEstado, 
                ...datosAdicionales 
            });

            // Forzamos la actualización inmediata de ambos perfiles en la caché del contexto
            await cargarCitas();         
            await cargarCitasPaciente(); 
            return true;
        } catch (error) {
            console.error("Error al actualizar la cita con el motivo:", error);
            return false;
        }
    };

    // ----------------------------------------------------
    // SISTEMA DE NOTIFICACIONES (SHORT POLLING)
    // ----------------------------------------------------
    const cargarNotificaciones = useCallback(async () => {
        const data = await useApiGet('/notificaciones');
        if (data) {
            setNotificaciones(Array.isArray(data) ? data : (data.data || []));
        }
    }, []);

    const marcarNotificacionLeida = async (id) => {
        const exito = await useApiPost(`/notificaciones/${id}/leer`);
        if (exito) {
            setNotificaciones(prev => prev.filter(n => n.id !== id));
        }
    };

    useEffect(() => {
        cargarNotificaciones();

        // Sondeo asíncrono cada 30 segundos
        const intervalo = setInterval(() => {
            cargarNotificaciones();
        }, 30000); 

        return () => clearInterval(intervalo); 
    }, [cargarNotificaciones]);

    // --- EXPORTACIÓN GENERAL DE SERVERLINK ---
    const exportacion = {
        pacientes,
        iniciarPacientes,
        insertarPaciente,
        eliminarPaciente,
        datosPlan,
        historialDietas,
        cargarMiPlan,
        citas,
        citasPaciente, // Exportado para SolicitarCita.jsx
        cargandoCitas,
        cargarCitas,
        cargarCitasPaciente, // Exportado para SolicitarCita.jsx
        cambiarEstadoCita, // ¡Reparado con soporte para motivos!
        registrarEstadistica,
        notificaciones,
        cargarNotificaciones,
        marcarNotificacionLeida
    };

    return (
        <contextoClinica.Provider value={exportacion}>
            {children}
        </contextoClinica.Provider>
    );
};

export const useClinica = () => {
    const context = useContext(contextoClinica);
    if (!context) throw new Error("useClinica debe usarse dentro de ClinicaProvider");
    return context;
};

export default ClinicaProvider;