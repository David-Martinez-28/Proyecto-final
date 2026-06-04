import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Table, Badge, Spinner, Alert, Row, Col, Modal } from 'react-bootstrap';
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
        <main className="dashboard-dietista">
            <div className="header-section">
                <h3>Mis Pacientes</h3>
                <Button variant={mostrarForm ? "secondary" : "success"} onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo Paciente'}
                </Button>
            </div>

            {/* --- AQUÍ ESTABA EL BLOQUE QUE FALTABA --- */}
            {mostrarForm && (
                <Card className="form-card mb-4 shadow-sm">
                    <Card.Body>
                        <Form onSubmit={handleCrearPaciente}>
                            <Row className="g-3">
                                <Col md={6}><Form.Control placeholder="Nombre" value={nuevoPaciente.name} onChange={e => setNuevoPaciente({ ...nuevoPaciente, name: e.target.value })} required /></Col>
                                <Col md={6}><Form.Control placeholder="Nick" value={nuevoPaciente.nick} onChange={e => setNuevoPaciente({ ...nuevoPaciente, nick: e.target.value })} required /></Col>
                                <Col md={6}><Form.Control type="email" placeholder="Email" value={nuevoPaciente.email} onChange={e => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })} required /></Col>
                                <Col md={6}><Form.Control type="password" placeholder="Contraseña" value={nuevoPaciente.password} onChange={e => setNuevoPaciente({ ...nuevoPaciente, password: e.target.value })} required /></Col>
                            </Row>
                            <Button variant="success" type="submit" className="mt-3 w-100" disabled={enviando}>{enviando ? <Spinner size="sm" /> : 'Guardar Paciente'}</Button>
                        </Form>
                    </Card.Body>
                </Card>
            )}
            <div className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Buscar paciente por nombre, nick o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="shadow-sm"
                />
            </div>

            <div className="table-container shadow-sm rounded-3 overflow-hidden">
                {/* Añadimos 'table-responsive' para que la tabla no rompa el layout en móviles */}
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0 text-nowrap">
                        <thead className="table-light">
                            <tr>
                                <th>Avatar</th>
                                <th>Paciente</th>
                                <th>Nick</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider tabla-pacientes">
                            {pacientesFiltrados.length > 0 ? (
                                pacientesFiltrados.map(p => (
                                    <tr key={p.id}>
                                        <td><img className="foto-perfil" src={p.user.imagen} alt="" /></td>
                                        <td>{p.user.name}</td>
                                        <td><Badge bg="light" text="dark">{p.nick}</Badge></td>
                                        <td>{p.user.email}</td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Button size="sm" className='button' onClick={() => navigate(`/dietista/paciente/${p.id}/plan`)}>🥗 Plan</Button>
                                                <Button size="sm" className='button' onClick={() => navigate(`/dietista/paciente/${p.id}/rutina`)}>💪 Rutina</Button>
                                                <Button size="sm" className='button' onClick={() => { setPacienteSeleccionado(p); setShowModalStats(true); }}>📈 Medidas</Button>
                                                <Button size="sm" className='button' onClick={() => navigate(`/dietista/paciente/${p.id}/estadisticas`)}>Ver Evolución</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        No se encontraron pacientes que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showModalStats} onHide={() => setShowModalStats(false)} centered>
                <Modal.Header closeButton><Modal.Title>Registrar medidas para {pacienteSeleccionado?.user?.name}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleGuardarStats}>
                        <Row className="g-3">
                            <Col md={6}><Form.Control type="number" placeholder="Peso (kg)" value={nuevasStats.peso} onChange={e => setNuevasStats({ ...nuevasStats, peso: e.target.value })} required /></Col>
                            <Col md={6}><Form.Control type="number" placeholder="Altura (cm)" value={nuevasStats.altura} onChange={e => setNuevasStats({ ...nuevasStats, altura: e.target.value })} required /></Col>
                            <Col md={6}><Form.Control type="number" placeholder="% Graso" value={nuevasStats.porcentaje_graso} onChange={e => setNuevasStats({ ...nuevasStats, porcentaje_graso: e.target.value })} /></Col>
                            <Col md={6}><Form.Control type="number" placeholder="Masa Muscular (kg)" value={nuevasStats.masa_muscular} onChange={e => setNuevasStats({ ...nuevasStats, masa_muscular: e.target.value })} /></Col>
                        </Row>
                        <Button variant="success" type="submit" className="mt-3 w-100" disabled={enviando}>Guardar</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </main>
    );
};

export default VistaDietista;