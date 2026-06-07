import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, ListGroup, Modal, Button, ProgressBar } from 'react-bootstrap';
import { useClinica } from '../contexto/contexto.jsx';
import html2pdf from 'html2pdf.js';

const VistaPaciente = () => {
    const { datosPlan, historialDietas, cargarMiPlan } = useClinica();
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estado local para alternar entre el Plan Actual y las dietas archivadas
    const [dietaVisualizada, setDietaVisualizada] = useState({ nombre: "Plan Actual", comidas: [] });
    const [comidaActiva, setComidaActiva] = useState(null);
    const [showDetalle, setShowDetalle] = useState(false);
    const [ejercicioActivo, setEjercicioActivo] = useState(null);
    const [showModalEjercicio, setShowModalEjercicio] = useState(false);

    const pdfRef = useRef();

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const momentos = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

    // Cálculo calórico e indicadores de rendimiento
    const caloriasMaximasDieta = datosPlan?.calorias_maximas || 2000;
    const caloriasTotalesSemana = dietaVisualizada.comidas.reduce((acc, comida) => acc + (Number(comida.calorias) || 0), 0);
    const promedioDiarioReal = (caloriasTotalesSemana / 7).toFixed(0);

    // Cargar los datos del plan de salud al montar el componente
    useEffect(() => {
        const init = async () => {
            try {
                setCargando(true);
                await cargarMiPlan();
            } catch (err) {
                setError("No se pudo cargar tu plan de salud.");
            } finally {
                setCargando(false);
            }
        };
        init();
    }, [cargarMiPlan]);

    // Sincronizar la dieta visualizada por defecto cuando se reciben los datos del servidor
    useEffect(() => {
        if (datosPlan?.comidas) {
            setDietaVisualizada({
                nombre: "Plan Actual",
                comidas: datosPlan.comidas.filter(c => c.pivot?.estado !== 'archivada')
            });
        }
    }, [datosPlan]);
    console.log("Datos del Plan de Salud:", datosPlan);

    // Helper para localizar qué comida va en cada celda de la tabla
    const obtenerPlatoCelda = (idx, momento) =>
        dietaVisualizada.comidas.find(p => Number(p.pivot?.dia_semana) === idx && p.pivot?.momento === momento);

    // Generación del reporte en PDF horizontal
    const descargarPDF = () => {
        const elemento = pdfRef.current;
        const opciones = {
            margin: 10,
            filename: `Plan_${dietaVisualizada.nombre.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2pdf: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opciones).from(elemento).save();
    };

    if (cargando) return <div className="d-flex justify-content-center p-5"><Spinner animation="border" variant="primary" /></div>;
    if (error) return <Container className="p-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="vista-paciente px-3 py-4">

            {/* --- CABECERA DE SEGUIMIENTO METABÓLICO --- */}
            <header className="plan-header mb-4">
                <Row className="align-items-center g-3">
                    <Col md={3} className="d-none d-md-block"></Col>

                    <Col xs={12} md={6} className="text-center">
                        <h2 className="fw-bold mb-2 text-dark">Mi Plan de Salud</h2>
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                            <Badge bg="dark" className="bg-opacity-75 np-badge">Objetivo: {caloriasMaximasDieta} kcal</Badge>
                            <Badge bg="primary" className="np-badge">Semanal: {caloriasTotalesSemana.toLocaleString()} kcal</Badge>
                            <Badge bg="success" className="np-badge">Promedio: {promedioDiarioReal} kcal/día</Badge>
                        </div>
                    </Col>

                    <Col xs={12} md={3} className="text-end">
                        <Button variant="primary" className="fw-bold px-4 py-2 shadow-sm w-100" onClick={descargarPDF}>
                            Descargar Plan en PDF
                        </Button>
                    </Col>
                </Row>

                {/* 🔥 NUEVO: Bloque informativo visible en la Interfaz de Usuario para Paciente y Dietista */}
                <Row className="mt-3 justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <Card className="border-0 shadow-sm rounded-3 bg-white py-2 px-3">
                            <Row className="text-center small text-secondary">
                                <Col xs={6} className="border-end border-light-subtle">
                                    <span className="d-block text-muted style-italic" style={{ fontSize: '11px' }}>Paciente Activo</span>
                                    <strong className="text-dark fs-6">{datosPlan?.user?.name || 'Cargando...'}</strong>
                                </Col>
                                <Col xs={6}>
                                    <span className="d-block text-muted style-italic" style={{ fontSize: '11px' }}>Dietista Asignado</span>
                                    <strong className="text-dark fs-6">{datosPlan?.dietista?.user?.name || 'Profesional Asignado'}</strong>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </header>

            <Row className="g-4">
                {/* --- MENÚ LATERAL: HISTORIAL DE DIETAS --- */}
                <Col xs={12} lg={2}>
                    <div className="bg-light p-3 rounded-4 mb-3 mb-lg-0 border-top border-success border-4 shadow-sm">
                        <h6 className="fw-bold text-success mb-3 px-1">Mis Dietas</h6>
                        <ListGroup variant="flush" className="rounded-3 overflow-hidden">
                            <ListGroup.Item
                                action
                                className={`fw-bold small ${dietaVisualizada.nombre === 'Plan Actual' ? 'text-success bg-success bg-opacity-10' : ''}`}
                                onClick={() => setDietaVisualizada({
                                    nombre: "Plan Actual",
                                    comidas: datosPlan?.comidas?.filter(c => c.pivot?.estado !== 'archivada') || []
                                })}
                            >
                                Plan Actual
                            </ListGroup.Item>
                            {Object.keys(historialDietas || {}).map(p => (
                                <ListGroup.Item
                                    action
                                    key={p}
                                    className={`small fw-medium ${dietaVisualizada.nombre === p ? 'text-success bg-success bg-opacity-10' : 'text-muted'}`}
                                    onClick={() => setDietaVisualizada({ nombre: p, comidas: historialDietas[p] })}
                                >
                                    {p.replace("Plan cerrado el ", "")}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Col>

                {/* --- CONTENIDO PRINCIPAL: CUADRÍCULA NUTRICIONAL --- */}
                <Col xs={12} lg={10}>
                    <div className="p-3 bg-white shadow-sm rounded-4">
                        {/* Tabla para pantallas grandes */}
                        <div className="d-none d-md-block">
                            <TablaNutricional momentos={momentos} diasSemana={diasSemana} obtenerPlato={obtenerPlatoCelda} titulo={dietaVisualizada.nombre} setComida={setComidaActiva} setShow={setShowDetalle} />
                        </div>

                        {/* Vista de tarjetas apiladas para dispositivos móviles */}
                        <div className="d-block d-md-none mobile-diet-view">
                            <h5 className="fw-bold text-success mb-3 text-center">{dietaVisualizada.nombre}</h5>
                            {diasSemana.map((dia, diaIdx) => (
                                <Card key={dia} className="border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
                                    <Card.Header className="bg-success text-white fw-bold py-2">{dia}</Card.Header>
                                    <ListGroup variant="flush">
                                        {momentos.map(m => {
                                            const p = obtenerPlatoCelda(diaIdx, m);
                                            return (
                                                <ListGroup.Item
                                                    key={m}
                                                    className={`d-flex justify-content-between align-items-center py-3 ${p ? 'bg-success bg-opacity-10' : ''}`}
                                                    onClick={() => p && (setComidaActiva(p), setShowDetalle(true))}
                                                    style={{ cursor: p ? 'pointer' : 'default' }}
                                                >
                                                    <div className="text-capitalize fw-semibold text-muted small">{m}</div>
                                                    <div className="text-end">
                                                        {p ? (
                                                            <>
                                                                <span className="fw-bold text-success d-block small">{p.nombre}</span>
                                                                <Badge bg="success">{p.calorias} kcal</Badge>
                                                            </>
                                                        ) : (
                                                            <span className="text-black-50">-</span>
                                                        )}
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* --- SECCIÓN DE ENTRENAMIENTO --- */}
                    <h4 className="fw-bold mt-5 mb-4 text-center text-md-start text-dark">Mis Rutinas Activas</h4>
                    <Row className="g-4">
                        {/* Comprobamos de forma segura si el array existe y está vacío */}
                        {datosPlan?.rutinas?.length === 0 ? (
                            <Col xs={12}>
                                <Alert variant="info" className="text-center rounded-4">
                                    No tienes rutinas asignadas para este periodo.
                                </Alert>
                            </Col>
                        ) : (
                            datosPlan?.rutinas?.map((rutina) => (
                                <Col xs={12} sm={6} md={4} key={rutina.id}>
                                    <Card className="h-100 border-0 shadow-sm rounded-4 border-bottom border-primary border-4 shadow-hover">
                                        <Card.Body>
                                            <Card.Title className="fw-bold text-primary mb-3">{rutina.nombre}</Card.Title>
                                            <ListGroup variant="flush">

                                                {/* 🔥 CORRECCIÓN: Cambiado 'exercises' por 'ejercicios' */}
                                                {rutina.ejercicios?.map(ej => (
                                                    <ListGroup.Item
                                                        key={ej.id}
                                                        action
                                                        className="px-0 small d-flex align-items-center border-0 py-2"
                                                        onClick={() => { setEjercicioActivo(ej); setShowModalEjercicio(true); }}
                                                    >
                                                        <span className="text-primary me-2 fw-bold">✓</span> {ej.nombre}
                                                    </ListGroup.Item>
                                                ))}

                                                {/* Opcional: Mensaje por si la rutina existe pero no tiene ejercicios */}
                                                {(!rutina.ejercicios || rutina.ejercicios.length === 0) && (
                                                    <p className="text-muted small mb-0">Sin ejercicios asignados.</p>
                                                )}

                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Col>
            </Row>

            {/* --- CONTENEDOR OCULTO CON ESTRUCTURA FIJA PARA EXPORTAR EL PDF --- */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                <div ref={pdfRef} style={{ width: '1024px', padding: '40px', background: 'white' }}>
                    <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-2" style={{ borderColor: '#198754' }}>
                        <div>
                            <h1 style={{ color: '#198754', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '28px' }}>StrongHell</h1>
                            <p style={{ color: '#6c757d', margin: 0, fontSize: '14px', fontWeight: '500' }}>Reporte de Planificación Nutricional Integrada</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#212529', lineHeight: '1.5' }}>
                            <div><strong>Paciente:</strong> {datosPlan?.user?.name || 'Cargando...'}</div>
                            <div><strong>Dietista:</strong> {datosPlan?.dietista?.user?.name || 'Profesional Asignado'}</div>
                            <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-ES')}</div>
                        </div>
                    </div>
                    <TablaNutricional momentos={momentos} diasSemana={diasSemana} obtenerPlato={obtenerPlatoCelda} titulo={dietaVisualizada.nombre} isPDF={true} />
                </div>
            </div>

            {/* --- VENTANAS MODALES --- */}
            <ModalDetalleComida show={showDetalle} onHide={() => setShowDetalle(false)} comida={comidaActiva} maxCal={caloriasMaximasDieta} />
            <ModalEjercicio show={showModalEjercicio} onHide={() => setShowModalEjercicio(false)} ejercicio={ejercicioActivo} />
        </Container>
    );
};

// ============================================================================
// COMPONENTE SECUNDARIO: TABLA NUTRICIONAL GENERAL
// ============================================================================
const TablaNutricional = ({ momentos, diasSemana, obtenerPlato, titulo, setComida, setShow, isPDF = false }) => (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-success text-white py-3 border-0">
            <h5 className="mb-0 fw-bold">{titulo}</h5>
        </Card.Header>
        <Table bordered className="mb-0 text-center align-middle" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead className="table-light">
                <tr>
                    <th style={{ width: '110px', fontSize: '13px' }}>Horario</th>
                    {diasSemana.map(d => <th key={d} className="fw-bold" style={{ fontSize: '13px' }}>{d.substring(0, 3)}</th>)}
                </tr>
            </thead>
            <tbody>
                {momentos.map(m => (
                    <tr key={m} style={{ height: '80px' }}>
                        <td className="text-muted text-capitalize fw-semibold bg-light small" style={{ fontSize: '12px' }}>{m}</td>
                        {diasSemana.map((_, i) => {
                            const p = obtenerPlato(i, m);
                            return (
                                <td key={i}
                                    onClick={() => !isPDF && p && (setComida(p), setShow(true))}
                                    className={p ? "bg-success bg-opacity-10 target-celda" : ""}
                                    style={{
                                        fontSize: isPDF ? '10px' : '13px',
                                        cursor: (p && !isPDF) ? 'pointer' : 'default',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {p ? (
                                        <div>
                                            <div className="fw-bold text-success text-truncate mb-1">{p.nombre}</div>
                                            <Badge bg="success" style={{ fontSize: '9px', padding: '4px 6px' }}>{p.calorias} kcal</Badge>
                                        </div>
                                    ) : (
                                        <span className="text-black-50">-</span>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </Table>
    </Card>
);

// ============================================================================
// COMPONENTE SECUNDARIO: MODAL DETALLE DE COMIDAS
// ============================================================================
const ModalDetalleComida = ({ show, onHide, comida, maxCal }) => {
    
    // Función para calcular totales de macronutrientes
    const calcularMacro = (campo) => {
        if (!comida?.ingredientes) return 0;
        return comida.ingredientes.reduce((sum, ing) => {
            // (valor del ingrediente por cada 100g / 100) * cantidad usada
            const valorPorGramo = parseFloat(ing[campo] || 0) / 100;
            const cantidad = parseFloat(ing.pivot?.cantidad || 0);
            return sum + (valorPorGramo * cantidad);
        }, 0).toFixed(1);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="rounded-4">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-success fs-4">{comida?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
                {comida?.imagen && (
                    <img
                        src={comida.imagen}
                        className="img-fluid mb-4 rounded-4 shadow-sm mx-auto d-block"
                        style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
                        alt="Plato nutricional"
                    />
                )}

                {/* Grid de Nutrientes Principales */}
                <Row className="g-2 mb-4 text-center">
                    <Col xs={3}>
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                            <small className="text-muted d-block small">Prot.</small>
                            <span className="fw-bold text-primary">{calcularMacro('proteinas')}g</span>
                        </div>
                    </Col>
                    <Col xs={3}>
                        <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                            <small className="text-muted d-block small">Grasas</small>
                            <span className="fw-bold text-warning">{calcularMacro('grasas')}g</span>
                        </div>
                    </Col>
                    <Col xs={3}>
                        <div className="bg-info bg-opacity-10 p-2 rounded-3">
                            <small className="text-muted d-block small">Carbos</small>
                            <span className="fw-bold text-info">{calcularMacro('carbohidratos')}g</span>
                        </div>
                    </Col>
                    <Col xs={3}>
                        <div className="bg-danger bg-opacity-10 p-2 rounded-3">
                            <small className="text-muted d-block small">Kcal</small>
                            <span className="fw-bold text-danger">{comida?.calorias || 0}</span>
                        </div>
                    </Col>
                </Row>

                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Impacto calórico diario</span>
                <ProgressBar
                    variant={(comida?.calorias / maxCal) > 0.4 ? "warning" : "success"}
                    now={Math.min(((comida?.calorias || 0) / maxCal) * 100, 100)}
                    className="mb-4 rounded-pill"
                    style={{ height: '10px' }}
                />

                <h6 className="fw-bold text-dark"><span className="text-success">■</span> Descripción del Menú</h6>
                <p className="small text-muted mb-4 bg-light p-3 rounded-3">{comida?.descripcion || 'Sin descripción disponible.'}</p>

                <h6 className="fw-bold text-dark"><span className="text-success">■</span> Modo de Preparación</h6>
                <p className="small text-secondary mb-4 bg-light p-3 rounded-3" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{comida?.receta || 'Consúltale a tu dietista los pasos detallados.'}</p>

                <h6 className="fw-bold text-dark mb-2"><span className="text-success">■</span> Ingredientes Detallados</h6>
                <div className="bg-light p-3 rounded-3">
                    <ul className="mb-0 ps-3">
                        {comida?.ingredientes?.map((ing, idx) => (
                            <li key={idx} className="small text-secondary mb-1">
                                <strong className="text-dark">{ing.nombre}</strong> 
                                — {ing.pivot?.cantidad} {ing.pivot?.unidad} 
                                <span className="text-muted ms-1">({ing.proteinas}p/{ing.grasas}g/{ing.carbohidratos}c)</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Modal.Body>
        </Modal>
    );
};

// ============================================================================
// COMPONENTE SECUNDARIO: MODAL DE INSTRUCCIONES DE EJERCICIO
// ============================================================================

const ModalEjercicio = ({ show, onHide, ejercicio }) => (
    <Modal show={show} onHide={onHide} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-primary fs-4">🏋️ {ejercicio?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3 pb-4">

            <div className="mb-3">
                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Grupo Muscular Focalizado:</span>
                <Badge bg="primary" className="px-3 py-2 rounded-pill fw-bold text-uppercase np-badge">{ejercicio?.grupo_muscular || 'Cuerpo Completo'}</Badge>
            </div>

            {/* --- NUEVO: Ficha de datos técnicos del PIVOT --- */}
            <div className="mb-4 bg-white border border-primary border-opacity-25 shadow-sm p-3 rounded-3">
                <Row className="text-center align-items-center">
                    <Col xs={6}>
                        <span className="d-block text-muted small fw-bold text-uppercase">Series</span>
                        <span className="fw-bold text-primary fs-5">{ejercicio?.pivot?.series || '-'}</span>
                    </Col>
                    <Col xs={6} className="border-start">
                        <span className="d-block text-muted small fw-bold text-uppercase">
                            {ejercicio?.pivot?.repeticiones ? 'Repeticiones' : 'Tiempo'}
                        </span>
                        <span className="fw-bold text-primary fs-5">
                            {ejercicio?.pivot?.repeticiones || ejercicio?.pivot?.tiempo || '-'}
                        </span>
                    </Col>
                </Row>
            </div>
            {/* ----------------------------------------------- */}

            <div>
                <span className="text-muted small fw-bold text-uppercase d-block mb-1">Instrucciones de Ejecución técnica:</span>
                <p className="small text-secondary bg-light p-3 rounded-3 mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {ejercicio?.descripcion || 'Realiza las series pautadas manteniendo una técnica controlada. Pregunta a tu entrenador si tienes dudas.'}
                </p>
            </div>
        </Modal.Body>
    </Modal>
);

export default VistaPaciente;