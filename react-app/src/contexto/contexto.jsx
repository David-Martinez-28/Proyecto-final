import React, { createContext, useState, useCallback, useContext } from "react";
import useApiGet from "../hooks/ApiDietista/useApiGet.js";
import useApiPost from "../hooks/ApiDietista/useApiPost.js";
import useApiDelete from "../hooks/ApiDietista/useApiDelete.js";

export const contextoClinica = createContext();

export const ClinicaProvider = ({ children }) => {
    // --- ESTADOS DE PACIENTES Y PLANES ---
    const [pacientes, setPacientes] = useState([]);
    const [datosPlan, setDatosPlan] = useState(null);
    const [historialDietas, setHistorialDietas] = useState({});

    // --- NUEVOS ESTADOS DE CITAS ---
    const [citas, setCitas] = useState([]);
    const [cargandoCitas, setCargandoCitas] = useState(true);

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
                    grupos[clave].push(comida);
                    return grupos;
                }, {});
                setHistorialDietas(agrupadas);
            }
        }
    }, []);
    const registrarEstadistica = async (nuevasStats, pacienteId = null) => {
    // Si hay ID, lo pasamos en la URL, si no, lo dejamos vacío
    const url = pacienteId ? `/pacientes/estadisticas/${pacienteId}` : '/pacientes/estadisticas';
    const exito = await useApiPost(url, nuevasStats);
    
    if (exito) {
        // En la vista del dietista, podrías querer recargar la lista de pacientes
        await iniciarPacientes(); 
        return true;
    }
    return false;
};

    // ----------------------------------------------------
    // NUEVA LOGICA DE CITAS (DIETISTA)
    // ----------------------------------------------------
    const cargarCitas = useCallback(async () => {
        setCargandoCitas(true);
        const data = await useApiGet('/dietista/mis-citas');
        if (data) {
            setCitas(Array.isArray(data) ? data : []);
        }
        setCargandoCitas(false);
    }, []);

    const cambiarEstadoCita = async (citaId, nuevoEstado) => {
        try {
            await useApiPost(`/citas/${citaId}/estado`, { estado: nuevoEstado });
            await cargarCitas(); // Recargamos para refrescar el calendario automáticamente
            return true;
        } catch (error) {
            console.error("Error al actualizar la cita", error);
            return false;
        }
    };

    // --- EXPORTACIÓN GENERAL ---
    const exportacion = {
        pacientes, 
        iniciarPacientes, 
        insertarPaciente, 
        eliminarPaciente,
        datosPlan, 
        historialDietas, 
        cargarMiPlan,
        citas,
        cargandoCitas,
        cargarCitas,
        cambiarEstadoCita, // <--- AQUÍ FALTABA ESTA COMA
        registrarEstadistica // <--- PROPIEDAD AÑADIDA
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