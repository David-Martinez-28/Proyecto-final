import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../hooks/ApiLogin/axios';
import { useAuth } from '../hooks/ApiLogin/useAuth';
import { useNavigate } from 'react-router-dom';

const VistaDietista = () => {
    const [pacientes, setPacientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();
    const [nuevoPaciente, setNuevoPaciente] = useState({
        name: '', email: '', password: '', nick: ''
    });

    const { user, logout } = useAuth();

    const cargarPacientes = async () => {
        try {
            setCargando(true);
            const res = await api.get('/pacientes');
            const dataData = Array.isArray(res.data) ? res.data : res.data.data;
            setPacientes(dataData || []);
        } catch (err) {
            console.error("Error cargando pacientes:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPacientes();
    }, []);

    const handleCrearPaciente = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register', { ...nuevoPaciente, role: 'paciente' });
            setMostrarForm(false);
            setNuevoPaciente({ name: '', email: '', password: '', nick: '' });
            cargarPacientes();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error al crear el paciente. Verifica los datos.");
        }
    };

    // --- PANTALLA DE CARGA ---
    if (cargando) {
        return (
            <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
                <h5 className="mt-3 text-muted">Cargando panel de control...</h5>
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ maxWidth: '1200px' }}>
            <main>
                {/* Título de sección y botón de acción */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 fw-bold">Mis Pacientes</h3>
                    <Button
                        variant={mostrarForm ? "secondary" : "success"}
                        className="fw-bold px-4"
                        onClick={() => setMostrarForm(!mostrarForm)}
                    >
                        {mostrarForm ? 'Cancelar' : '+ Nuevo Paciente'}
                    </Button>
                </div>

                {/* Formulario Dinámico de Creación */}
                {mostrarForm && (
                    <Card className="mb-5 border-0 shadow-sm bg-light">
                        <Card.Body className="p-4">
                            <Card.Title className="mb-4 text-dark fw-bold">
                                Registrar Nuevo Paciente
                            </Card.Title>

                            <Form onSubmit={handleCrearPaciente}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Nombre Completo:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ej. Juan Pérez"
                                                value={nuevoPaciente.name}
                                                onChange={e => setNuevoPaciente({ ...nuevoPaciente, name: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Nick único (para la app):</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ej. juanp88"
                                                value={nuevoPaciente.nick}
                                                onChange={e => setNuevoPaciente({ ...nuevoPaciente, nick: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Correo Electrónico:</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="juan@correo.com"
                                                value={nuevoPaciente.email}
                                                onChange={e => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Contraseña Temporal:</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Mínimo 8 caracteres"
                                                value={nuevoPaciente.password}
                                                onChange={e => setNuevoPaciente({ ...nuevoPaciente, password: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit" className="w-100 fw-bold mt-3 py-2">
                                    Guardar y Crear Acceso
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {/* Listado de Pacientes / Estado Vacío */}
                {pacientes.length === 0 ? (
                    <Alert variant="info" className="text-center p-5 mt-4 border rounded">
                        <h5 className="text-info fw-bold">No tienes pacientes asignados todavía.</h5>
                        <p className="mb-0 text-muted">¡Haz clic en el botón de arriba para registrar a tu primer paciente!</p>
                    </Alert>
                ) : (
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="table-light border-bottom">
                                <tr>
                                    <th className="py-3 ps-4">Paciente</th>
                                    <th className="py-3">Nick</th>
                                    <th className="py-3">Email</th>
                                    <th className="py-3 text-center pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.map(p => (
                                    <tr key={p.id}>
                                        <td className="py-3 ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img
                                                    src={p.user.avatar || `https://ui-avatars.com/api/?background=e9ecef&color=333&name=${p.user.name || 'U'}`}
                                                    alt={`Avatar de ${p.user.name}`}
                                                    className="rounded-circle object-fit-cover border shadow-sm"
                                                    width="45"
                                                    height="45"
                                                />
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">{p.user.name || 'Sin nombre'}</h6>

                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3">
                                            <Badge bg="success" className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success">
                                                @{p.nick}
                                            </Badge>
                                        </td>

                                        <td className="py-3 text-secondary">{p.user?.email}</td>

                                        <td className="py-3 text-center pe-4">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="me-2 fw-bold shadow-sm rounded-pill px-3"
                                                // 👇 AQUÍ ESTÁ LA MAGIA DEL ENRUTAMIENTO
                                                onClick={() => navigate(`/admin/paciente/${p.id}/plan`, { state: { paciente: p } })}
                                            >
                                                🥗 Plan
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="me-2 fw-bold shadow-sm rounded-pill px-3"
                                                onClick={() => navigate(`/admin/paciente/${p.id}/rutina`, { state: { paciente: p } })}
                                            >
                                                🏋️ Rutina
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="fw-bold text-dark border shadow-sm rounded-pill px-3"
                                                onClick={() => alert(`Editar perfil de: ${p.nick}`)}
                                            >
                                                ⚙️ Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                )}
            </main>
        </Container>
    );
};

export default VistaDietista;