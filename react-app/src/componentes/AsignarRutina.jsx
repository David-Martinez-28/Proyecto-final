import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../hooks/ApiLogin/axios';

const AsignarRutina = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const paciente = location.state?.paciente;

    const [rutinasCatalogo, setRutinasCatalogo] = useState([]);
    const [rutinasPaciente, setRutinasPaciente] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    
    // Estado para el formulario
    const [asignacion, setAsignacion] = useState({
        rutina_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const cargarDatosPaciente = async () => {
        try {
            const res = await api.get(`/pacientes/${id}`);
            setRutinasPaciente(res.data.data?.rutinas || []);
        } catch (error) {
            console.error("Error cargando rutinas del paciente:", error);
        }
    };

    useEffect(() => {
        const inicializar = async () => {
            try {
                // Descargamos el catálogo de rutinas
                const resRutinas = await api.get('/rutinas');
                const dataRutinas = Array.isArray(resRutinas.data) ? resRutinas.data : resRutinas.data.data;
                setRutinasCatalogo(dataRutinas || []);
                await cargarDatosPaciente();
            } catch (error) {
                console.error("Error inicializando:", error);
            } finally {
                setCargando(false);
            }
        };
        inicializar();
    }, [id]);

    const handleAsignarRutina = async (e) => {
        e.preventDefault();
        if(!asignacion.rutina_id || !asignacion.fecha_inicio || !asignacion.fecha_fin) {
            return alert("Por favor, rellena todos los campos.");
        }

        try {
            setEnviando(true);
            await api.post(`/pacientes/${id}/asignar-rutina`, asignacion);
            await cargarDatosPaciente(); // Recargar la tabla
            setAsignacion({ rutina_id: '', fecha_inicio: '', fecha_fin: '' }); // Limpiar
        } catch (error) {
            console.error("Error al asignar:", error);
            alert("Hubo un error al guardar la rutina.");
        } finally {
            setEnviando(false);
        }
    };

    const handleEliminarRutina = async (rutinaId) => {
        if (!window.confirm("¿Seguro que quieres desvincular esta rutina del paciente?")) return;
        try {
            setEnviando(true);
            await api.delete(`/pacientes/${id}/quitar-rutina/${rutinaId}`);
            await cargarDatosPaciente();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al borrar.");
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="danger" />
            </Container>
        );
    }

    return (
        <Container className="py-5" fluid style={{ maxWidth: '1400px' }}>
            <div className="mb-4">
                <Button variant="link" className="text-decoration-none text-secondary p-0 mb-2 fw-bold" onClick={() => navigate(-1)}>
                    ← Volver a Mis Pacientes
                </Button>
                <h2 className="fw-bold mb-0 text-dark">
                    Asignar Bloques: <span className="text-danger">{paciente?.user?.name || `Paciente #${id}`}</span>
                </h2>
            </div>

            <Row className="g-4">
                {/* FORMULARIO DE ASIGNACIÓN */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-danger text-white rounded-top-4 py-3 border-0">
                            <h6 className="mb-0 fw-bold fs-5">➕ Nueva Asignación</h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleAsignarRutina}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-secondary small text-uppercase">Bloque de Entrenamiento</Form.Label>
                                    <Form.Select 
                                        value={asignacion.rutina_id}
                                        onChange={(e) => setAsignacion({...asignacion, rutina_id: e.target.value})}
                                        className="shadow-sm border-0 bg-light"
                                    >
                                        <option value="">-- Selecciona una Rutina --</option>
                                        {rutinasCatalogo.map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold text-secondary small text-uppercase">Fecha Inicio</Form.Label>
                                            <Form.Control 
                                                type="date"
                                                value={asignacion.fecha_inicio}
                                                onChange={(e) => setAsignacion({...asignacion, fecha_inicio: e.target.value})}
                                                className="shadow-sm border-0 bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold text-secondary small text-uppercase">Fecha Fin</Form.Label>
                                            <Form.Control 
                                                type="date"
                                                value={asignacion.fecha_fin}
                                                onChange={(e) => setAsignacion({...asignacion, fecha_fin: e.target.value})}
                                                className="shadow-sm border-0 bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="dark" type="submit" className="w-100 fw-bold py-2 rounded-pill shadow-sm" disabled={enviando}>
                                    {enviando ? <Spinner size="sm" /> : 'Asignar al Paciente'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* LISTADO DE RUTINAS ACTIVAS */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold text-secondary mb-4">Rutinas Vigentes</h5>
                            
                            {rutinasPaciente.length === 0 ? (
                                <div className="text-center py-5 opacity-50">
                                    <h1 className="display-4">📋</h1>
                                    <p>Este paciente no tiene rutinas asignadas aún.</p>
                                </div>
                            ) : (
                                <Table hover className="align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3">Rutina</th>
                                            <th className="py-3 text-center">Inicio</th>
                                            <th className="py-3 text-center">Fin</th>
                                            <th className="py-3 text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rutinasPaciente.map((r, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <p className="fw-bold text-dark mb-0">{r.nombre}</p>
                                                    <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '250px' }}>
                                                        {r.descripcion}
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg="secondary" className="fw-normal">{r.pivot.fecha_inicio}</Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg="danger" className="fw-normal">{r.pivot.fecha_fin}</Badge>
                                                </td>
                                                <td className="text-end">
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleEliminarRutina(r.id)}>
                                                        Quitar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AsignarRutina;