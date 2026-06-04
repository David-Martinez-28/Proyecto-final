import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

// Hooks de API modulares
import useApiGet from '../hooks/ApiDietista/useApiGet';
import useApiPost from '../hooks/ApiDietista/useApiPost';
import useApiDelete from '../hooks/ApiDietista/useApiDelete';

const AsignarRutina = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [rutinasCatalogo, setRutinasCatalogo] = useState([]);
    const [rutinasPaciente, setRutinasPaciente] = useState([]);
    const [infoPaciente, setInfoPaciente] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    const [asignacion, setAsignacion] = useState({
        rutina_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

   const cargarDatosPaciente = async () => {
    const res = await useApiGet(`/pacientes/${id}`);
    console.log("JSON recibido de la API:", res);
    
    // Si res.data existe, usamos eso. Si res viene directo, usamos res.
    const pacienteData = res.data || res; 
    
    if (pacienteData) {
        setInfoPaciente(pacienteData);
        // AQUÍ ESTABA EL ERROR: Acceder a "rutinas" dentro de "pacienteData"
        setRutinasPaciente(pacienteData.rutinas || []);
    }
};

    useEffect(() => {
        const inicializar = async () => {
            setCargando(true);
            try {
                const dataRutinas = await useApiGet('/rutinas');
                if (dataRutinas) setRutinasCatalogo(dataRutinas);
                await cargarDatosPaciente();
            } catch (error) {
                console.error("Error inicializando:", error);
            } finally {
                setCargando(false);
            }
        };
        inicializar();
    }, [id]);

    // Renombrado para evitar conflicto con el nombre del componente
    const handleEnviarAsignacion = async (e) => {
        e.preventDefault();
        if (!asignacion.rutina_id || !asignacion.fecha_inicio || !asignacion.fecha_fin) {
            return alert("Por favor, rellena todos los campos.");
        }

        setEnviando(true);
        const exito = await useApiPost(`/pacientes/${id}/asignar-rutina`, asignacion);

        if (exito) {
            await cargarDatosPaciente();
            setAsignacion({ rutina_id: '', fecha_inicio: '', fecha_fin: '' });
        } else {
            alert("Hubo un error al guardar la rutina.");
        }
        setEnviando(false);
    };

    const handleEliminarRutina = async (rutinaId) => {
        if (!window.confirm("¿Seguro que quieres desvincular esta rutina?")) return;

        setEnviando(true);
        const exito = await useApiDelete(`/pacientes/${id}/quitar-rutina/${rutinaId}`);

        if (exito) {
            await cargarDatosPaciente();
        } else {
            alert("Hubo un error al borrar la rutina.");
        }
        setEnviando(false);
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
                    Asignar Bloques:
                    <span className="text-danger ms-2">
                        {/* Accedemos a user.name */}
                        {infoPaciente?.user?.name || 'Paciente'}
                    </span>
                </h2>
            </div>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-danger text-white rounded-top-4 py-3 border-0">
                            <h6 className="mb-0 fw-bold fs-5">➕ Nueva Asignación</h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleEnviarAsignacion}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-secondary small text-uppercase">Bloque de Entrenamiento</Form.Label>
                                    <Form.Select
                                        value={asignacion.rutina_id}
                                        onChange={(e) => setAsignacion({ ...asignacion, rutina_id: e.target.value })}
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
                                            <Form.Control type="date" value={asignacion.fecha_inicio} onChange={(e) => setAsignacion({ ...asignacion, fecha_inicio: e.target.value })} className="shadow-sm border-0 bg-light" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold text-secondary small text-uppercase">Fecha Fin</Form.Label>
                                            <Form.Control type="date" value={asignacion.fecha_fin} onChange={(e) => setAsignacion({ ...asignacion, fecha_fin: e.target.value })} className="shadow-sm border-0 bg-light" />
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

                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold text-secondary mb-4">Rutinas Vigentes</h5>
                            {rutinasPaciente.length === 0 ? (
                                <div className="text-center py-5 opacity-50">
                                    <p>Este paciente no tiene rutinas asignadas aún.</p>
                                </div>
                            ) : (
                                <Table hover className="align-middle">
                                    <thead className="bg-light"><tr><th>Rutina</th><th className="text-center">Inicio</th><th className="text-center">Fin</th><th className="text-end">Acciones</th></tr></thead>
                                    <tbody>
                                        {rutinasPaciente.map((r, index) => (
                                            <tr key={index}>
                                                <td><p className="fw-bold text-dark mb-0">{r.nombre}</p></td>
                                                <td className="text-center"><Badge bg="secondary">{r.pivot?.fecha_inicio}</Badge></td>
                                                <td className="text-center"><Badge bg="danger">{r.pivot?.fecha_fin}</Badge></td>
                                                <td className="text-end"><Button variant="outline-danger" size="sm" onClick={() => handleEliminarRutina(r.id)}>Quitar</Button></td>
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