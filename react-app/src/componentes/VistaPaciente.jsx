import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert, ListGroup } from 'react-bootstrap';
import api from '../hooks/ApiLogin/axios';

const VistaPaciente = () => {
    const [datosPlan, setDatosPlan] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [historialDietas, setHistorialDietas] = useState({});
    const [dietaVisualizada, setDietaVisualizada] = useState({ nombre: "Plan Actual (Activo)", comidas: [] });

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const momentos = ["desayuno", "almuerzo", "comida", "merienda", "cena"];

    useEffect(() => {
        const cargarMiPlan = async () => {
            try {
                const res = await api.get('/mi-plan');
                const data = res.data.data;
                setDatosPlan(data);
                
                setDietaVisualizada({ 
                    nombre: "Plan Actual (Activo)", 
                    comidas: data.comidas.filter(c => c.pivot.estado !== 'archivada') 
                });

                const archivadas = data.comidas.filter(c => c.pivot.estado === 'archivada');
                const agrupadas = archivadas.reduce((grupos, comida) => {
                    const clave = comida.pivot.fecha_fin ? `Plan cerrado el ${comida.pivot.fecha_fin}` : "Plan antiguo";
                    if (!grupos[clave]) grupos[clave] = [];
                    grupos[clave].push(comida);
                    return grupos;
                }, {});
                setHistorialDietas(agrupadas);
            } catch (err) {
                setError("No se pudo cargar tu plan.");
            } finally {
                setCargando(false);
            }
        };
        cargarMiPlan();
    }, []);

    const obtenerPlatoCelda = (idxDia, momento) => {
        return dietaVisualizada.comidas.find(plato =>
            Number(plato.pivot.dia_semana) === idxDia &&
            plato.pivot.momento === momento
        );
    };

    if (cargando) return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="success" /></Container>;

    return (
        <Container className="py-4" fluid>
            <Row>
                {/* LISTA LATERAL IZQUIERDA (Historial - Ancho Fijo y Pegado) */}
                <Col lg={2} className="pe-0">
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-success text-white rounded-top-4 py-3 border-0">
                            <h6 className="mb-0 fw-bold">📦 Mis Dietas</h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item action active={dietaVisualizada.nombre === "Plan Actual (Activo)"} onClick={() => setDietaVisualizada({ nombre: "Plan Actual (Activo)", comidas: datosPlan.comidas.filter(c => c.pivot.estado !== 'archivada') })}>
                                🟢 Plan Actual
                            </ListGroup.Item>
                            {Object.keys(historialDietas).map((periodo) => (
                                <ListGroup.Item action key={periodo} active={dietaVisualizada.nombre === periodo} onClick={() => setDietaVisualizada({ nombre: periodo, comidas: historialDietas[periodo] })}>
                                    📁 {periodo.replace("Plan cerrado el ", "")}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                {/* CUADRÍCULA CENTRAL (Ocupa el resto del espacio) */}
                <Col lg={10}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h4 className="fw-bold mb-0 text-success">{dietaVisualizada.nombre}</h4>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive bordered className="mb-0 text-center align-middle" style={{ tableLayout: 'fixed' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }} className="bg-light">Horario</th>
                                        {diasSemana.map(d => <th key={d} className="bg-light py-3">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {momentos.map(m => (
                                        <tr key={m}>
                                            <td className="fw-bold text-secondary bg-light text-capitalize">{m}</td>
                                            {diasSemana.map((_, i) => {
                                                const p = obtenerPlatoCelda(i, m);
                                                return <td key={i} style={{ height: '90px' }}>{p ? <Badge bg="success" className="text-wrap">{p.nombre}</Badge> : "-"}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* SECCIÓN RUTINAS (Ahora más ancha) */}
                    <h4 className="fw-bold mb-3 text-dark">🏋️ Entrenamientos</h4>
                    <Row className="g-3">
                        {datosPlan?.rutinas?.map((rutina, index) => (
                            <Col md={6} lg={4} key={index}>
                                <Card className="border-0 shadow-sm rounded-4">
                                    <Card.Header className="bg-danger text-white border-0 py-2">{rutina.nombre}</Card.Header>
                                    <Card.Body className="small">
                                        {rutina.descripcion}
                                        <div className="mt-2 d-flex gap-2">
                                            <Badge bg="light" text="dark" className="border">Inicio: {rutina.pivot.fecha_inicio}</Badge>
                                            <Badge bg="danger">Fin: {rutina.pivot.fecha_fin}</Badge>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default VistaPaciente;