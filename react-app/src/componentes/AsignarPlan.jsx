import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge, Alert } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../hooks/ApiLogin/axios';

const AsignarPlan = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos los datos básicos del paciente pasados por la ruta
    const pacienteBase = location.state?.paciente;

    // --- ESTADOS ---
    const [comidasCatalogo, setComidasCatalogo] = useState([]); // Todos los platos disponibles (izquierda)
    const [filtro, setFiltro] = useState(''); // Buscador del catálogo
    
    // Estados para la gestión de la cuadrícula y el historial
    const [planActual, setPlanActual] = useState([]); // Platos activos (hoy)
    const [historialDietas, setHistorialDietas] = useState({}); // Platos antiguos agrupados por fechas
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('actual'); // Qué estamos viendo ('actual' o rango de fechas)

    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    // Estructura fija de la cuadrícula
    // IMPORTANTE: Asegúrate de que coincidan en mayúsculas/minúsculas con tu base de datos
    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const momentos = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

    // --- CARGA DE DATOS ---
    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError(null);

            // 1. Cargamos el catálogo de platos (panel izquierdo)
            const resComidas = await api.get('/comidas');
            const dataComidas = Array.isArray(resComidas.data) ? resComidas.data : resComidas.data.data;
            setComidasCatalogo(dataComidas || []);

            // 2. Cargamos todos los platos del paciente (incluyendo historial)
            const resPaciente = await api.get(`/pacientes/${id}`);
            const todasLasComidasPivot = resPaciente.data.data?.comidas || [];

            // 3. Separamos los platos ACTIVOS
            const activas = todasLasComidasPivot.filter(c => c.pivot.estado === 'activa' || !c.pivot.estado);
            setPlanActual(activas);

            // 4. Separamos los ARCHIVADOS y los agrupamos por su rango de fechas
            const archivadas = todasLasComidasPivot.filter(c => c.pivot.estado === 'archivada');
            const agrupadasPorFecha = archivadas.reduce((grupos, comida) => {
                // Creamos una clave única por rango de fechas (ej: "Cerrada el 2026-05-15")
                const rango = `Cerrada el ${comida.pivot.fecha_fin || 'fecha desconocida'}`;
                if (!grupos[rango]) grupos[rango] = [];
                grupos[rango].push(comida);
                return grupos;
            }, {});

            setHistorialDietas(agrupadasPorFecha);

        } catch (err) {
            console.error("Error inicializando datos:", err);
            setError("No se pudieron cargar los datos del plan. Verifica la conexión o la base de datos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    // --- LÓGICA DE FILTRADO (Catálogo Izquierdo) ---
    const comidasFiltradas = comidasCatalogo.filter(c => {
        const busqueda = filtro.toLowerCase();
        const coincideNombre = c.nombre.toLowerCase().includes(busqueda);
        const coincideIngrediente = c.ingredientes && c.ingredientes.some(ing => 
            ing.nombre.toLowerCase().includes(busqueda)
        );
        return coincideNombre || coincideIngrediente;
    });

    // --- LÓGICA DE SEGURIDAD: ¿Es editable la vista actual? ---
    // Solo podemos editar (arrastrar/borrar) si estamos viendo el 'Plan Actual'
    const esEditable = periodoSeleccionado === 'actual';

    // --- EVENTOS DRAG & DROP (Solo activos si esEditable) ---
    const handleDragStart = (e, comidaId) => {
        if (!esEditable) return;
        e.dataTransfer.setData('comida_id', comidaId);
    };

    const handleDrop = async (e, diaSemanaIndex, momentoDia) => {
        e.preventDefault();
        if (!esEditable) return; // Bloqueo de seguridad

        const comidaId = e.dataTransfer.getData('comida_id');
        if (!comidaId) return;

        try {
            setEnviando(true);
            // Llamada original para asignar
            await api.post(`/pacientes/${id}/asignar-comida`, {
                comida_id: comidaId,
                dia_semana: diaSemanaIndex,
                momento: momentoDia
                // Nota: Laravel asignará 'activa' por defecto en el controlador
            });
            await cargarDatos(); // Recargamos para ver el cambio
        } catch (error) {
            console.error("Error asignando comida:", error);
            alert("Hubo un error al asignar el plato. Verifica la consola.");
        } finally {
            setEnviando(false);
        }
    };

    const handleDragOver = (e) => {
        if (!esEditable) return;
        e.preventDefault();
    };

    // --- LÓGICA: Eliminar plato (Solo activa si esEditable) ---
    const handleEliminarPlato = async (diaSemanaIndex, momentoDia) => {
        if (!esEditable || !window.confirm("¿Seguro que quieres quitar este plato del plan actual?")) return;
        
        try {
            setEnviando(true);
            await api.delete(`/pacientes/${id}/quitar-comida`, {
                data: { dia_semana: diaSemanaIndex, momento: momentoDia }
            });
            await cargarDatos();
        } catch (error) {
            console.error("Error eliminando comida:", error);
            alert("Hubo un error al quitar el plato.");
        } finally {
            setEnviando(false);
        }
    };

    // --- LÓGICA: Archivar Plan Completo ---
    const handleArchivarDieta = async () => {
        if (planActual.length === 0) return alert("No hay platos activos para archivar.");
        if (!window.confirm("¿Seguro que quieres archivar esta dieta completa? La cuadrícula se vaciará para empezar una nueva, pero podrás consultar esta dieta siempre en el desplegable de historial.")) return;
        
        try {
            setEnviando(true);
            // Llamada al nuevo endpoint de Laravel
            await api.post(`/pacientes/${id}/archivar-plan`);
            await cargarDatos(); // Recargamos todo
            setPeriodoSeleccionado('actual'); // Volvemos a la vista editable
            alert("Dieta archivada con éxito.");
        } catch (error) {
            console.error("Error archivando el plan:", error);
            alert("Hubo un error interno al archivar la dieta. Verifica Laravel.");
        } finally {
            setEnviando(false);
        }
    };

    // --- BUSCADOR DE PLATOS PARA LA CUADRÍCULA (Dinámico) ---
    const obtenerPlatoCelda = (idxDia, momento) => {
        // Si vemos el plan actual, buscamos en el estado 'planActual'
        if (periodoSeleccionado === 'actual') {
            return planActual.find(plato => 
                Number(plato.pivot.dia_semana) === idxDia && 
                plato.pivot.momento === momento
            );
        }
        
        // Si vemos el historial, buscamos en el bloque seleccionado dentro de 'historialDietas'
        const dietaPasada = historialDietas[periodoSeleccionado];
        if (!dietaPasada) return null;
        return dietaPasada.find(plato => 
            Number(plato.pivot.dia_semana) === idxDia && 
            plato.pivot.momento === momento
        );
    };

    // --- RENDER ---
    if (cargando) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
                <h5 className="ms-3 text-muted">Cargando plan nutricional...</h5>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>¡Ups! Algo salió mal</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={cargarDatos}>Reintentar carga</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5" fluid style={{ maxWidth: '1600px' }}>
            {/* CABECERA UNIFICADA */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <Button variant="link" className="text-decoration-none text-secondary p-0 mb-2 fw-bold" onClick={() => navigate(-1)}>
                        ← Volver a Mis Pacientes
                    </Button>
                    <h2 className="fw-bold mb-0 text-dark">
                        Calendario de <span className="text-success">{pacienteBase?.user?.name || `Paciente #${id}`}</span>
                    </h2>
                </div>
                
                <div className="d-flex gap-3 align-items-center bg-white p-3 rounded-4 shadow-sm border">
                    {/* SELECTOR DE HISTORIAL */}
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-secondary small text-uppercase">Visualizar:</span>
                        <Form.Select 
                            value={periodoSeleccionado} 
                            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                            className={`shadow-sm fw-bold border-2 ${esEditable ? 'border-success text-success' : 'border-secondary text-secondary'}`}
                            style={{ width: 'auto', minWidth: '300px' }}
                        >
                            <option value="actual">🟢 Plan Actual (Editable)</option>
                            {Object.keys(historialDietas).map((rangoFecha) => (
                                <option key={rangoFecha} value={rangoFecha}>
                                    📦 Histórico: {rangoFecha}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    {/* BOTÓN MÁGICO DE ARCHIVAR (Solo visible si estamos en 'actual') */}
                    {esEditable && (
                        <Button 
                            variant="warning" 
                            className="fw-bold rounded-pill px-4 shadow-sm" 
                            onClick={handleArchivarDieta} 
                            disabled={enviando || planActual.length === 0}
                        >
                            {enviando ? <Spinner size="sm" /> : '📦 Archivar y Limpiar Cuadrícula'}
                        </Button>
                    )}
                </div>
            </div>

            <Row className="g-4">
                {/* PANEL IZQUIERDO: Catálogo de Platos */}
                {/* Se difumina (opacity-50) si estamos viendo el historial */}
                <Col lg={3}>
                    <Card className={`border-0 shadow-sm rounded-4 position-sticky ${!esEditable ? 'opacity-50' : ''}`} style={{ top: '30px', maxHeight: '85vh' }}>
                        <Card.Header className="bg-success text-white rounded-top-4 py-3 border-0">
                            <h6 className="mb-0 fw-bold fs-5">🥗 Catálogo Maestro</h6>
                        </Card.Header>
                        <Card.Body className="p-3 d-flex flex-column h-100">
                            <Form.Control 
                                type="text" 
                                placeholder={esEditable ? "Buscar plato o ingrediente..." : "Habilita 'Plan Actual' para buscar"}
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="mb-3 rounded-pill bg-light border-0 shadow-sm px-4"
                                disabled={!esEditable}
                            />
                            
                            <div className="flex-grow-1 overflow-auto pe-2" style={{ maxHeight: '600px' }}>
                                {comidasFiltradas.length === 0 ? (
                                    <p className="text-muted text-center mt-4 small">No hay platos disponibles.</p>
                                ) : (
                                    comidasFiltradas.map(comida => (
                                        <div 
                                            key={comida.id}
                                            draggable={esEditable}
                                            onDragStart={(e) => handleDragStart(e, comida.id)}
                                            className="p-3 mb-2 bg-white border rounded-3 shadow-sm"
                                            style={{ 
                                                cursor: esEditable ? 'grab' : 'not-allowed', 
                                                transition: 'transform 0.2s',
                                                borderLeft: esEditable ? '4px solid #198754' : '4px solid #6c757d'
                                            }}
                                            onDragEnd={(e) => e.target.style.opacity = '1'}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <span className="fw-bold text-dark lh-sm small">{comida.nombre}</span>
                                                <Badge bg="success" pill style={{ fontSize: '0.65rem' }}>{comida.calorias} kcal</Badge>
                                            </div>
                                            {esEditable && (
                                                <div className="mt-1">
                                                    <small className="text-success" style={{ fontSize: '0.7rem' }}>
                                                        ☰ Arrástrame a la tabla
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* PANEL DERECHO: Cuadrícula Interactiva/Histórica */}
                <Col lg={9}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Body className="p-0">
                            {/* Banner de aviso si estamos viendo el pasado */}
                            {!esEditable && (
                                <div className="bg-secondary text-white text-center py-2 fw-bold w-100">
                                    ⚠️ Estás visualizando un PLAN HISTÓRICO archivado (Modo lectura).
                                </div>
                            )}
                            
                            <Table responsive bordered className="mb-0 text-center align-middle" style={{ tableLayout: 'fixed' }}>
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th className="bg-light py-3" style={{ width: '120px' }}>⏰ Turno</th>
                                        {diasSemana.map(dia => (
                                            <th key={dia} className="bg-light py-3 text-secondary fw-bold">{dia}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {momentos.map(momento => (
                                        <tr key={momento}>
                                            <td className="text-capitalize fw-bold text-secondary bg-light small">
                                                {momento}
                                            </td>
                                            
                                            {diasSemana.map((dia, idxDia) => {
                                                const plato = obtenerPlatoCelda(idxDia, momento);
                                                
                                                return (
                                                    <td 
                                                        key={`${momento}-${idxDia}`} 
                                                        className="p-2 position-relative" 
                                                        style={{ height: '110px' }}
                                                        // Solo activamos los eventos de Drop si es editable
                                                        onDragOver={esEditable ? handleDragOver : undefined}
                                                        onDrop={esEditable ? (e) => handleDrop(e, idxDia, momento) : undefined}
                                                    >
                                                        {plato ? (
                                                            // Estilo dinámico: Verde si es actual, gris si es histórico
                                                            <div className={`h-100 position-relative d-flex flex-column justify-content-center align-items-center border rounded p-2 shadow-sm ${
                                                                esEditable 
                                                                ? 'bg-success bg-opacity-10 border-success' 
                                                                : 'bg-secondary bg-opacity-10 border-secondary'
                                                            }`}>
                                                                {/* BOTÓN DE BORRAR (Solo visible si es editable) */}
                                                                {esEditable && (
                                                                    <button 
                                                                        onClick={() => handleEliminarPlato(idxDia, momento)}
                                                                        className="position-absolute top-0 end-0 btn btn-sm text-danger p-0 mt-1 me-2 border-0 bg-transparent"
                                                                        title="Quitar plato"
                                                                        disabled={enviando}
                                                                    >
                                                                        ✖
                                                                    </button>
                                                                )}

                                                                <span className={`fw-bold small lh-sm mb-1 text-wrap text-truncate px-2 ${esEditable ? 'text-success' : 'text-muted'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                    {plato.nombre}
                                                                </span>
                                                                <Badge bg={esEditable ? 'success' : 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                                                                    {plato.calorias} kcal
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            // Celda vacía (con estilo punteado si es editable)
                                                            <div className="h-100 w-100 border border-dashed rounded d-flex justify-content-center align-items-center bg-light" style={{ borderColor: esEditable ? '#198754' : '#ccc', borderStyle: esEditable ? 'dashed' : 'solid' }}>
                                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                    {esEditable ? 'Soltar aquí' : '-'}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AsignarPlan;