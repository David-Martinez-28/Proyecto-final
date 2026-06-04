import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge, Alert } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// IMPORTAMOS TUS NUEVOS HOOKS DE API
import useApiGet from '../hooks/ApiDietista/useApiGet';
import useApiPost from '../hooks/ApiDietista/useApiPost';
import useApiDelete from '../hooks/ApiDietista/useApiDelete';

const AsignarPlan = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const pacienteBase = location.state?.paciente;

    // --- ESTADOS DE DATOS ---
    const [comidasCatalogo, setComidasCatalogo] = useState([]);
    const [planActual, setPlanActual] = useState([]);
    const [historialDietas, setHistorialDietas] = useState({});

    // --- ESTADOS DE UI ---
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('actual');
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const momentos = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

    // --- FUNCIÓN CENTRAL DE CARGA ---
    const cargarDatos = async () => {
    try {
        setCargando(true);
        setError(null);

        // 1. Usamos tu hook GET para traer todas las comidas
        const dataComidas = await useApiGet('/comidas');
        setComidasCatalogo(dataComidas || []);
        console.log("Comidas recibidas del catálogo:", dataComidas);
        
        // 2. Usamos tu hook GET para traer al paciente específico
        const resPaciente = await useApiGet(`/pacientes/${id}`);
        const todasLasComidasPivot = resPaciente?.comidas || [];
        console.log("Datos recibidos del paciente:", todasLasComidasPivot);
        
        // 3. Procesamos los datos
        // CORRECCIÓN AQUÍ: Filtramos para excluir las archivadas del plan actual editable
        setPlanActual(todasLasComidasPivot.filter(c => c.pivot.estado !== 'archivada'));
        
        const archivadas = todasLasComidasPivot.filter(c => c.pivot.estado === 'archivada');
        const agrupadasPorFecha = archivadas.reduce((grupos, comida) => {
            const rango = `Cerrada el ${comida.pivot.fecha_fin || 'fecha desconocida'}`;
            if (!grupos[rango]) grupos[rango] = [];
            grupos[rango].push(comida);
            return grupos;
        }, {});

        setHistorialDietas(agrupadasPorFecha);
    } catch (err) {
        setError("No se pudieron cargar los datos.");
    } finally {
        setCargando(false);
    }
};

    useEffect(() => { cargarDatos(); }, [id]);

    const esEditable = periodoSeleccionado === 'actual';

    // --- LÓGICA DE ASIGNACIÓN (Click y Drag&Drop) ---
    const Asignar = async (diaSemanaIndex, momentoDia, comidaId) => {
        if (!esEditable) return;
        try {
            setEnviando(true);
            // Usamos tu hook POST
            await useApiPost(`/pacientes/${id}/asignar-comida`, {
                comida_id: comidaId,
                dia_semana: diaSemanaIndex,
                momento: momentoDia
            });
            await cargarDatos(); // Recargar la tabla
            setPlatoSeleccionado(null); // Resetea selección
        } catch (error) {
            alert("Error al asignar el plato.");
        } finally {
            setEnviando(false);
        }
    };

    // Funciones de Drag & Drop para escritorio
    const DragStart = (e, comidaId) => { if (esEditable) e.dataTransfer.setData('comida_id', comidaId); };
    const Drop = (e, dia, mom) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('comida_id');
        if (id) Asignar(dia, mom, id);
    };

    // --- ELIMINAR Y ARCHIVAR ---
    const EliminarPlato = async (diaSemanaIndex, momentoDia) => {
        if (!esEditable || !window.confirm("¿Quitar plato?")) return;
        try {
            setEnviando(true);
            // Usamos tu hook DELETE
            await useApiDelete(`/pacientes/${id}/quitar-comida`, {
                dia_semana: diaSemanaIndex,
                momento: momentoDia
            });
            await cargarDatos();
        } finally { setEnviando(false); }
    };

    const ArchivarDieta = async () => {
        if (!window.confirm("¿Archivar dieta completa?")) return;
        try {
            setEnviando(true);
            // Usamos tu hook POST para acciones sin body
            await useApiPost(`/pacientes/${id}/archivar-plan`);
            await cargarDatos();
        } finally { setEnviando(false); }
    };

    const obtenerPlatoCelda = (idxDia, momento) => {
        const fuente = periodoSeleccionado === 'actual' ? planActual : (historialDietas[periodoSeleccionado] || []);
        return fuente.find(p => Number(p.pivot.dia_semana) === idxDia && p.pivot.momento === momento);
    };

    // --- RENDERIZADO ---
    if (cargando) return <Container className="d-flex justify-content-center p-5"><Spinner animation="border" variant="success" /></Container>;

    if (error) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5" fluid style={{ maxWidth: '1600px' }}>
            {/* Aviso de selección para móviles */}
            {platoSeleccionado && (
                <Alert variant="primary" className="sticky-top shadow-sm" onClose={() => setPlatoSeleccionado(null)} dismissible>
                    Has seleccionado <strong>{platoSeleccionado.nombre}</strong>. Toca una casilla en la tabla para asignarlo.
                </Alert>
            )}

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
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-secondary small text-uppercase">Visualizar:</span>
                        <Form.Select
                            value={periodoSeleccionado}
                            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                            className={`shadow-sm fw-bold border-2 ${esEditable ? 'border-success text-success' : 'border-secondary text-secondary'}`}
                            style={{ width: 'auto', minWidth: '300px' }}
                        >
                            <option value="actual">🟢 Plan Actual (Editable)</option>
                            {Object.keys(historialDietas).map(r => <option key={r} value={r}>📁 Histórico: {r}</option>)}
                        </Form.Select>
                    </div>

                    {esEditable && (
                        <Button
                            variant="warning"
                            className="fw-bold rounded-pill px-4 shadow-sm"
                            onClick={ArchivarDieta}
                            disabled={enviando || planActual.length === 0}
                        >
                            {enviando ? <Spinner size="sm" /> : '📦 Archivar Plan'}
                        </Button>
                    )}
                </div>
            </div>

            <Row className="g-4">
                {/* PANEL IZQUIERDO: Catálogo */}
                <Col lg={3}>
                    <Card className={`border-0 shadow-sm rounded-4 position-sticky ${!esEditable ? 'opacity-50' : ''}`} style={{ top: '30px', maxHeight: '85vh' }}>
                        <Card.Header className="bg-success text-white rounded-top-4 py-3 border-0">
                            <h6 className="mb-0 fw-bold fs-5">🥗 Catálogo Maestro</h6>
                        </Card.Header>
                        <Card.Body className="p-3 d-flex flex-column h-100">
                            <div className="flex-grow-1 overflow-auto pe-2" style={{ maxHeight: '600px' }}>
                                {comidasCatalogo.map(comida => (
                                    <div
                                        key={comida.id}
                                        onClick={() => esEditable && setPlatoSeleccionado(comida)}
                                        draggable={esEditable}
                                        onDragStart={(e) => DragStart(e, comida.id)}
                                        className={`p-3 mb-2 bg-white border rounded-3 shadow-sm ${platoSeleccionado?.id === comida.id ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                                        style={{
                                            cursor: esEditable ? 'grab' : 'not-allowed',
                                            transition: 'transform 0.2s',
                                            borderLeft: esEditable
                                                ? (platoSeleccionado?.id === comida.id ? '4px solid #0d6efd' : '4px solid #198754')
                                                : '4px solid #6c757d'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <span className="fw-bold text-dark lh-sm small">{comida.nombre}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* PANEL DERECHO: Tabla */}
                <Col lg={9}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Body className="p-0">
                            {!esEditable && (
                                <div className="bg-secondary text-white text-center py-2 fw-bold w-100">
                                    ⚠️ Estás visualizando un PLAN HISTÓRICO archivado (Modo lectura).
                                </div>
                            )}
                            <Table responsive bordered className="mb-0 text-center align-middle" style={{ tableLayout: 'fixed' }}>
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th className="bg-light py-3" style={{ width: '120px' }}>⏰ Turno</th>
                                        {diasSemana.map(d => <th key={d} className="bg-light py-3 text-secondary fw-bold">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {momentos.map(momento => (
                                        <tr key={momento}>
                                            <td className="text-capitalize fw-bold text-secondary bg-light small">{momento}</td>
                                            {diasSemana.map((_, i) => {
                                                const plato = obtenerPlatoCelda(i, momento);
                                                return (
                                                    <td
                                                        key={i}
                                                        style={{ height: '110px', cursor: (esEditable && platoSeleccionado) ? 'cell' : 'default' }}
                                                        onDragOver={esEditable ? (e) => e.preventDefault() : undefined}
                                                        onDrop={esEditable ? (e) => Drop(e, i, momento) : undefined}
                                                        onClick={() => { if (esEditable && platoSeleccionado) Asignar(i, momento, platoSeleccionado.id); }}
                                                    >
                                                        {plato ? (
                                                            <div className={`h-100 position-relative d-flex flex-column justify-content-center align-items-center border rounded p-2 shadow-sm ${esEditable ? 'bg-success bg-opacity-10 border-success' : 'bg-secondary bg-opacity-10 border-secondary'}`}>
                                                                {esEditable && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); EliminarPlato(i, momento); }}
                                                                        className="position-absolute top-0 end-0 btn btn-sm text-danger p-0 mt-1 me-2 border-0 bg-transparent"
                                                                        disabled={enviando}
                                                                    >✖</button>
                                                                )}
                                                                <span className={`fw-bold small lh-sm mb-1 text-wrap text-truncate px-2 ${esEditable ? 'text-success' : 'text-muted'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                    {plato.nombre}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-100 w-100 border border-dashed rounded d-flex justify-content-center align-items-center bg-light" style={{ borderColor: esEditable ? '#198754' : '#ccc', borderStyle: esEditable ? 'dashed' : 'solid' }}>
                                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                    {esEditable ? 'Asignar' : '-'}
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