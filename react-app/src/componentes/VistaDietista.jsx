import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Badge, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useClinica } from '../contexto/contexto.jsx';

const VistaDietista = () => {
    const navigate = useNavigate();
    const { pacientes, iniciarPacientes, insertarPaciente, registrarEstadistica } = useClinica();
    const [busqueda, setBusqueda] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [nuevoPaciente, setNuevoPaciente] = useState({ name: '', email: '', password: '', nick: '' });

    const [showModalStats, setShowModalStats] = useState(false);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [nuevasStats, setNuevasStats] = useState({ peso: '', altura: '', porcentaje_graso: '', masa_muscular: '' });

    useEffect(() => {
        const cargar = async () => {
            setCargando(true);
            await iniciarPacientes();
            setCargando(false);
        };
        cargar();
    }, [iniciarPacientes]);

    const pacientesFiltrados = pacientes.filter(p =>
        p.user.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.nick.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.user.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleCrearPaciente = async (e) => {
        e.preventDefault();
        setEnviando(true);
        if (await insertarPaciente(nuevoPaciente)) {
            setMostrarForm(false);
            setNuevoPaciente({ name: '', email: '', password: '', nick: '' });
        }
        setEnviando(false);
    };

    const handleGuardarStats = async (e) => {
        e.preventDefault();
        setEnviando(true);
        if (await registrarEstadistica(nuevasStats, pacienteSeleccionado.id)) {
            setShowModalStats(false);
            setNuevasStats({ peso: '', altura: '', porcentaje_graso: '', masa_muscular: '' });
        }
        setEnviando(false);
    };

    if (cargando) return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="py-4 px-3" style={{ maxWidth: '1540px', minHeight: '90vh' }}>
            
            {/* CABECERA CON MÁRGENES ADAPTADOS */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light-subtle">
                <h3 className="fw-bold text-dark m-0 "> Mis Pacientes</h3>
                <Button 
                    variant={mostrarForm ? "secondary" : "success"} 
                    className="fw-bold px-3 shadow-sm" 
                    onClick={() => setMostrarForm(!mostrarForm)}
                >
                    {mostrarForm ? 'Cancelar' : '＋ Nuevo Paciente'}
                </Button>
            </div>

            {/* FORMULARIO DE ALTA (Borde superior Verde Secundario) */}
            {mostrarForm && (
                <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden border-top border-success border-4 animate__animated animate__fadeIn">
                    <Card.Body className="p-4 bg-white">
                        <Form onSubmit={handleCrearPaciente}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-semibold text-muted">Nombre Completo</Form.Label>
                                    <Form.Control placeholder="Ej: Carlos Martínez" value={nuevoPaciente.name} onChange={e => setNuevoPaciente({ ...nuevoPaciente, name: e.target.value })} required className="border-secondary-subtle" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-semibold text-muted">Nick / Alias</Form.Label>
                                    <Form.Control placeholder="Ej: carlos_mtz" value={nuevoPaciente.nick} onChange={e => setNuevoPaciente({ ...nuevoPaciente, nick: e.target.value })} required className="border-secondary-subtle" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-semibold text-muted">Correo Electrónico</Form.Label>
                                    <Form.Control type="email" placeholder="carlos@ejemplo.com" value={nuevoPaciente.email} onChange={e => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })} required className="border-secondary-subtle" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-semibold text-muted">Contraseña temporal</Form.Label>
                                    <Form.Control type="password" placeholder="••••••••" value={nuevoPaciente.password} onChange={e => setNuevoPaciente({ ...nuevoPaciente, password: e.target.value })} required className="border-secondary-subtle" />
                                </Col>
                            </Row>
                            <Button variant="success" type="submit" className="mt-4 w-100 fw-bold py-2 shadow-sm" disabled={enviando}>
                                {enviando ? <Spinner size="sm" animation="border" /> : 'Registrar Paciente'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {/* BARRA DE FILTRADO CON MARGEN */}
            <div className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, nick o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="shadow-sm py-2 px-3 border-secondary-subtle rounded-3"
                />
            </div>

            {/* TABLA DE PACIENTES ACOTADA CON ALTURA MÁXIMA (Borde superior Azul Principal) */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-primary border-4 bg-white">
                {/* max-height de 480px y scroll vertical activo para que la lista no crezca indefinidamente */}
                <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                    <Table hover className="align-middle mb-0 text-center text-nowrap">
                        <thead className="table-light sticky-top bg-white border-bottom" style={{ zIndex: 1 }}>
                            <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>
                                <th style={{ width: '80px' }}>Avatar</th>
                                <th className="text-start ps-4">Paciente</th>
                                <th>Nick</th>
                                <th>Email</th>
                                <th className="pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientesFiltrados.length > 0 ? (
                                pacientesFiltrados.map(p => (
                                    <tr key={p.id} style={{ height: '60px' }}>
                                        <td className="ps-3">
                                            <img 
                                                className="rounded-circle shadow-sm border border-light-subtle" 
                                                src={p.user.imagen || '/default-avatar.png'} 
                                                alt="Avatar" 
                                                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                                            />
                                        </td>
                                        <td className="text-start ps-4 fw-bold text-dark">{p.user.name}</td>
                                        <td>
                                            <Badge bg="light" text="primary" className="px-2 py-1 border border-primary-subtle rounded-pill">
                                                {p.nick}
                                            </Badge>
                                        </td>
                                        <td className="text-secondary small">{p.user.email}</td>
                                        <td className="pe-4">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button size="sm" variant="outline-success" className="fw-semibold px-2" onClick={() => navigate(`/dietista/paciente/${p.id}/plan`)}>🥗 Plan</Button>
                                                <Button size="sm" variant="outline-primary" className="fw-semibold px-2" onClick={() => navigate(`/dietista/paciente/${p.id}/rutina`)}>💪 Rutina</Button>
                                                <Button size="sm" variant="primary" className="fw-semibold px-2 shadow-sm" onClick={() => { setPacienteSeleccionado(p); setShowModalStats(true); }}>📈 Medidas</Button>
                                                <Button size="sm" variant="secondary" className="fw-medium px-2" onClick={() => navigate(`/dietista/paciente/${p.id}/estadisticas`)}>Evolución</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">
                                        No se encontraron perfiles de pacientes vinculados que coincidan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* VENTANA MODAL PARA REGISTRO ANTROPOMÉTRICO */}
            <Modal show={showModalStats} onHide={() => setShowModalStats(false)} centered className="rounded-4">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-primary fs-5">Mediciones para {pacienteSeleccionado?.user?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    <Form onSubmit={handleGuardarStats}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="small fw-semibold text-secondary">Peso Actual (kg)</Form.Label>
                                <Form.Control type="number" step="0.1" placeholder="Ej: 78.4" value={nuevasStats.peso} onChange={e => setNuevasStats({ ...nuevasStats, peso: e.target.value })} required className="border-secondary-subtle" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-semibold text-secondary">Estatura (cm)</Form.Label>
                                <Form.Control type="number" placeholder="Ej: 180" value={nuevasStats.altura} onChange={e => setNuevasStats({ ...nuevasStats, altura: e.target.value })} required className="border-secondary-subtle" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-semibold text-secondary">% Masa Grasa</Form.Label>
                                <Form.Control type="number" step="0.1" placeholder="Ej: 15.4" value={nuevasStats.porcentaje_graso} onChange={e => setNuevasStats({ ...nuevasStats, porcentaje_graso: e.target.value })} className="border-secondary-subtle" />
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small fw-semibold text-secondary">Masa Muscular (kg)</Form.Label>
                                <Form.Control type="number" step="0.1" placeholder="Ej: 38.2" value={nuevasStats.masa_muscular} onChange={e => setNuevasStats({ ...nuevasStats, masa_muscular: e.target.value })} className="border-secondary-subtle" />
                            </Col>
                        </Row>
                        <Button variant="success" type="submit" className="mt-4 w-100 fw-bold py-2 shadow-sm" disabled={enviando}>
                            {enviando ? <Spinner size="sm" animation="border" /> : 'Guardar y Archivar'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default VistaDietista;