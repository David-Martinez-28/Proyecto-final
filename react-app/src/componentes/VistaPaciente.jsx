import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, ListGroup, Modal, Button, ProgressBar } from 'react-bootstrap';
import { useClinica } from '../contexto/contexto.jsx';
import html2pdf from 'html2pdf.js';

const VistaPaciente = () => {
    const { datosPlan, historialDietas, cargarMiPlan } = useClinica();
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [dietaVisualizada, setDietaVisualizada] = useState({ nombre: "Plan Actual", comidas: [] });
    const [comidaActiva, setComidaActiva] = useState(null);
    const [showDetalle, setShowDetalle] = useState(false);
    const [ejercicioActivo, setEjercicioActivo] = useState(null);
    const [showModalEjercicio, setShowModalEjercicio] = useState(false);

    const pdfRef = useRef(); 

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const momentos = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

    const caloriasMaximasDieta = datosPlan?.calorias_maximas || 2000;
    const caloriasTotalesSemana = dietaVisualizada.comidas.reduce((acc, comida) => acc + (Number(comida.calorias) || 0), 0);
    const promedioDiarioReal = (caloriasTotalesSemana / 7).toFixed(0);

    useEffect(() => {
        const init = async () => {
            try {
                setCargando(true);
                await cargarMiPlan();
            } catch (err) {
                setError("No se pudo cargar tu plan.");
            } finally {
                setCargando(false);
            }
        };
        init();
    }, [cargarMiPlan]);

    useEffect(() => {
        if (datosPlan?.comidas) {
            setDietaVisualizada({
                nombre: "Plan Actual",
                comidas: datosPlan.comidas.filter(c => c.pivot.estado !== 'archivada')
            });
        }
    }, [datosPlan]);

    const obtenerPlatoCelda = (idx, momento) =>
        dietaVisualizada.comidas.find(p => Number(p.pivot.dia_semana) === idx && p.pivot.momento === momento);

    const descargarPDF = () => {
        const elemento = pdfRef.current;
        
        const opciones = {
            margin: 10,
            filename: `Plan_${dietaVisualizada.nombre.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opciones).from(elemento).save();
    };

    if (cargando) return <div className="d-flex justify-content-center p-5"><Spinner animation="border" variant="success" /></div>;
    if (error) return <Container className="p-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="vista-paciente px-3 py-4">
            
            {/* CABECERA: TÍTULO CENTRADO Y BOTÓN A 1/4 (ALINEADO A LA DERECHA) */}
            <header className="plan-header mb-4">
                <Row className="align-items-center g-3">
                    <Col md={3} className="d-none d-md-block"></Col>
                    
                    <Col xs={12} md={6} className="text-center">
                        <h2 className="fw-bold mb-2">Mi Plan de Salud</h2>
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                            <Badge bg="dark" className="bg-opacity-75">Objetivo: {caloriasMaximasDieta} kcal</Badge>
                            <Badge bg="primary">Semanal: {caloriasTotalesSemana.toLocaleString()} kcal</Badge>
                            <Badge bg="info">Promedio: {promedioDiarioReal} kcal/día</Badge>
                        </div>
                    </Col>
                    
                    <Col xs={12} md={3} className="text-end">
                        <Button className="fw-bold px-4 py-2 shadow-sm w-100" onClick={descargarPDF}>
                            Descargar Plan en PDF
                        </Button>
                    </Col>
                </Row>
            </header>

            <Row className="g-4">
                <Col xs={12} lg={2}>
                    <div className="bg-light p-3 rounded-4 mb-3 mb-lg-0">
                        <h6 className="fw-bold text-success mb-3 px-1">Mis Dietas</h6>
                        <ListGroup variant="flush" className="rounded-3 shadow-sm">
                            <ListGroup.Item action className="fw-bold" onClick={() => setDietaVisualizada({ nombre: "Plan Actual", comidas: datosPlan?.comidas?.filter(c => c.pivot.estado !== 'archivada') || [] })}>Plan Actual</ListGroup.Item>
                            {Object.keys(historialDietas || {}).map(p => (
                                <ListGroup.Item action key={p} className="small text-muted" onClick={() => setDietaVisualizada({ nombre: p, comidas: historialDietas[p] })}>{p.replace("Plan cerrado el ", "")}</ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Col>

                <Col xs={12} lg={10}>
                    {/* VISTA EN PANTALLA RECTIFICADA */}
                    <div className="p-3 bg-white shadow-sm rounded-4">
                        <div className="d-none d-md-block">
                            <TablaNutricional momentos={momentos} diasSemana={diasSemana} obtenerPlato={obtenerPlatoCelda} titulo={dietaVisualizada.nombre} setComida={setComidaActiva} setShow={setShowDetalle} />
                        </div>

                        <div className="d-block d-md-none mobile-diet-view">
                            <h5 className="fw-bold text-success mb-3 text-center">{dietaVisualizada.nombre}</h5>
                            {diasSemana.map((dia, diaIdx) => (
                                <Card key={dia} className="border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
                                    <Card.Header className="bg-success text-white fw-bold py-2">{dia}</Card.Header>
                                    <ListGroup variant="flush">
                                        {momentos.map(m => {
                                            const p = obtenerPlatoCelda(diaIdx, m);
                                            return (
                                                <ListGroup.Item key={m} className={`d-flex justify-content-between align-items-center py-3 ${p ? 'bg-success bg-opacity-10' : ''}`} onClick={() => p && (setComidaActiva(p), setShowDetalle(true))}>
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

                    {/* SECCIÓN DE RUTINAS */}
                    <h4 className="fw-bold mt-5 mb-4 text-center text-md-start">Mis Rutinas Activas</h4>
                    <Row className="g-4">
                        {datosPlan?.rutinas?.map((rutina) => (
                            <Col xs={12} sm={6} md={4} key={rutina.id}>
                                <Card className="h-100 border-0 shadow-sm rounded-4 border-bottom border-primary border-4">
                                    <Card.Body>
                                        <Card.Title className="fw-bold text-primary">{rutina.nombre}</Card.Title>
                                        <ListGroup variant="flush">
                                            {rutina.ejercicios?.map(ej => (
                                                <ListGroup.Item key={ej.id} action className="px-0 small" onClick={() => { setEjercicioActivo(ej); setShowModalEjercicio(true); }}>
                                                    <span className="text-primary me-2">•</span>{ej.nombre}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>

            {/* CONTENEDOR OCULTO PARA IMPRESIÓN SIN RECORTE */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                <div ref={pdfRef} style={{ width: '1000px', padding: '20px', background: 'white' }}>
                    <div className="text-center mb-4">
                        <h2 style={{ color: '#198754', fontWeight: 'bold' }}>Plan Nutricional</h2>
                        <p>Paciente: {datosPlan?.user?.name || "Sin nombre"}</p>
                    </div>
                    <TablaNutricional momentos={momentos} diasSemana={diasSemana} obtenerPlato={obtenerPlatoCelda} titulo={dietaVisualizada.nombre} isPDF={true} />
                </div>
            </div>

            {/* MODALES DE DETALLE */}
            <ModalDetalleComida show={showDetalle} onHide={() => setShowDetalle(false)} comida={comidaActiva} maxCal={caloriasMaximasDieta} />
            <ModalEjercicio show={showModalEjercicio} onHide={() => setShowModalEjercicio(false)} ejercicio={ejercicioActivo} />
        </Container>
    );
};

const TablaNutricional = ({ momentos, diasSemana, obtenerPlato, titulo, setComida, setShow, isPDF = false }) => (
    <Card className="border-0 shadow-sm">
        <Card.Header className="bg-success text-white py-3 border-0">
            <h5 className="mb-0 fw-bold">{titulo}</h5>
        </Card.Header>
        <Table bordered className="mb-0 text-center align-middle" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead className="table-light">
                <tr>
                    <th style={{ width: '100px' }}>Horario</th>
                    {diasSemana.map(d => <th key={d}>{d.substring(0, 3)}</th>)}
                </tr>
            </thead>
            <tbody>
                {momentos.map(m => (
                    <tr key={m} style={{ height: '75px' }}>
                        <td className="text-muted text-capitalize fw-semibold bg-light small">{m}</td>
                        {diasSemana.map((_, i) => {
                            const p = obtenerPlato(i, m);
                            return (
                                <td key={i} 
                                    onClick={() => !isPDF && p && (setComida(p), setShow(true))} 
                                    className={p ? "bg-success bg-opacity-10" : ""}
                                    style={{ fontSize: isPDF ? '10px' : 'inherit' }}
                                >
                                    {p ? <div><div className="fw-bold text-success small">{p.nombre}</div><Badge bg="success" style={{fontSize: '9px'}}>{p.calorias} kcal</Badge></div> : "-"}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </Table>
    </Card>
);

const ModalDetalleComida = ({ show, onHide, comida, maxCal }) => (
    <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">{comida?.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
            {comida?.imagen && <img src={comida.imagen} className="img-fluid mb-3 rounded-4 shadow-sm mx-auto d-block" style={{maxHeight: '240px', objectFit: 'cover'}} alt="Comida" />}
            <Row className="g-3 mb-3 text-center">
                <Col xs={6}><Card className="bg-success bg-opacity-10 p-2"><span>Plato</span><span className="fw-bold">{comida?.calorias} kcal</span></Card></Col>
                <Col xs={6}><Card className="bg-danger bg-opacity-10 p-2"><span>Máximo</span><span className="fw-bold">{maxCal} kcal</span></Card></Col>
            </Row>
            <ProgressBar variant={ (comida?.calorias / maxCal) > 0.4 ? "warning" : "success" } now={(comida?.calorias / maxCal) * 100} className="mb-3" />
            <h6>Descripción</h6><p className="small text-muted">{comida?.descripcion}</p>
            <h6>Receta</h6><p className="small" style={{whiteSpace: 'pre-line'}}>{comida?.receta}</p>
            <h6>Ingredientes</h6>
            <ul>
                {comida?.ingredientes?.map((ing, idx) => (
                    <li key={idx} className="small">{ing.nombre} - {ing.pivot.cantidad} {ing.pivot.unidad}</li>
                ))}
            </ul>
        </Modal.Body>
    </Modal>
);

const ModalRegistrarMedidas = ({ show, onHide, paciente }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">Registrar medidas para {paciente?.user?.name}</Modal.Title></Modal.Header>
        <Modal.Body className="text-center pt-2 pb-4">
            <h6 className="fw-bold mb-3 fs-5">{paciente?.user?.name}</h6>
            
            <div className="bg-light rounded p-3 text-start">
                <p className="mb-   1 text-muted small text-uppercase fw-bold">Motivo del paciente:</p>
                <p className="mb-3">{paciente?.motivo_consulta || "No especificado"}</p>

                <p className="mb-1 text-muted small text-uppercase fw-bold">Medidas actuales:</p>
                <ul>
                    <li className="small">Peso: {paciente?.peso} kg</li>
                    <li className="small">Altura: {paciente?.altura} cm</li>
                    <li className="small">Masa Muscular: {paciente?.masa_muscular} kg</li>
                    <li className="small">Porcentaje Graso: {paciente?.porcentaje_graso} %</li>
                </ul>

                <p className="mb-1 text-muted small text-uppercase fw-bold">Registrar nuevas medidas:</p>
                {/* Aquí iría el formulario para registrar nuevas medidas */}
            </div>
        </Modal.Body>
    </Modal>
);

const ModalDetalleRutina = ({ show, onHide, rutina }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-primary">{rutina?.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
            <h6>Ejercicios</h6>
            <ListGroup variant="flush">
                {rutina?.ejercicios?.map(ej => (
                    <ListGroup.Item key={ej.id}>
                        <span className="text-primary me-2">•</span>{ej.nombre}
                        <p className="small text-muted">{ej.instrucciones}</p>
                    </ListGroup.Item>
                ))}
            </ListGroup>    
        </Modal.Body>
    </Modal>
);

const ModalEjercicio = ({ show, onHide, ejercicio }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-primary">{ejercicio?.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
            <p><strong>Grupo:</strong> <Badge bg="info">{ejercicio?.grupo_muscular}</Badge></p>
            <h6>Instrucciones</h6><p className="small">{ejercicio?.instrucciones}</p>
        </Modal.Body>
    </Modal>
);

export default VistaPaciente;