import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Table, Badge, Nav, Modal } from 'react-bootstrap';
import useApiPost from '../hooks/ApiDietista/useApiPost'; 
import { useClinica } from '../contexto/contexto.jsx'; 

const SolicitarCita = () => {
    const { citasPaciente, cargarCitasPaciente, cambiarEstadoCita } = useClinica();
    
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [motivo, setMotivo] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [filtroActual, setFiltroActual] = useState('todas');

    // --- ESTADOS PARA EL MODAL DE CANCELACIÓN ---
    const [modalCancelacion, setModalCancelacion] = useState({ show: false, citaId: null });
    const [motivoCancelacion, setMotivoCancelacion] = useState('');

    useEffect(() => {
        cargarCitasPaciente();
    }, [cargarCitasPaciente]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);
        const fechaHoraFormateada = `${fecha} ${hora}:00`;

        try {
            await useApiPost('/citas', { fecha_hora: fechaHoraFormateada, motivo: motivo });
            setMensaje({ tipo: 'success', texto: '¡Cita solicitada correctamente!' });
            setFecha(''); setHora(''); setMotivo('');
            await cargarCitasPaciente(); 
        } catch (error) {
            setMensaje({ tipo: 'danger', texto: 'Error al solicitar la cita. Elige una fecha futura.' });
        } finally {
            setEnviando(false);
        }
    };

    const abrirModalCancelacion = (id) => {
        setModalCancelacion({ show: true, citaId: id });
        setMotivoCancelacion('');
    };

    const ejecutarCancelarCita = async () => {
        try {
            const exito = await cambiarEstadoCita(modalCancelacion.citaId, 'cancelada', {
                motivo_cancelacion: motivoCancelacion
            });
            
            if (exito) {
                setMensaje({ tipo: 'info', texto: 'Cita cancelada correctamente con el motivo indicado.' });
                setModalCancelacion({ show: false, citaId: null });
            }
        } catch (error) {
            alert("No se pudo procesar la cancelación.");
        }
    };

    const hoy = new Date().toISOString().split('T')[0];
    const formatearFecha = (str) => new Date(str).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    const obtenerBadgeEstado = (estado) => {
        switch (estado) {
            case 'confirmada': return <Badge bg="success">Confirmada</Badge>;
            case 'pendiente': return <Badge bg="warning" text="dark">Pendiente</Badge>;
            case 'rechazada': return <Badge bg="danger">Rechazada</Badge>;
            case 'cancelada': return <Badge bg="secondary">Cancelada</Badge>;
            default: return <Badge bg="info">{estado}</Badge>;
        }
    };

    const citasFiltradas = (citasPaciente || []).filter(cita => {
        if (filtroActual === 'todas') return true;
        if (filtroActual === 'pendiente') return cita.estado === 'pendiente';
        if (filtroActual === 'confirmada') return cita.estado === 'confirmada';
        if (filtroActual === 'pasadas') return cita.estado === 'cancelada' || cita.estado === 'rechazada';
        return true;
    });

    return (
        <Container className="py-4" style={{ maxWidth: '850px' }}>
            {/* FORMULARIO */}
            <Card className="shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
                <Card.Header className="bg-primary text-white text-center py-3 border-0">
                    <h4 className="mb-0 fw-bold">📅 Pedir Cita al Dietista</h4>
                </Card.Header>
                <Card.Body className="p-4 bg-white">
                    {mensaje && <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>{mensaje.texto}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Fecha</Form.Label>
                            <Form.Control type="date" min={hoy} value={fecha} onChange={e => setFecha(e.target.value)} required className="border-secondary-subtle" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Hora</Form.Label>
                            <Form.Control type="time" value={hora} onChange={e => setHora(e.target.value)} required className="border-secondary-subtle" />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Motivo (Opcional)</Form.Label>
                            <Form.Control as="textarea" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Ajustar macronutrientes o revisar evolución..." className="border-secondary-subtle" />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100 fw-bold py-2 shadow-sm" disabled={enviando || !fecha || !hora}>
                            {enviando ? 'Procesando...' : 'Solicitar Cita'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* TABLA DE HISTORIAL */}
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Header className="bg-white pt-3 pb-0 border-bottom-0">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 px-2">
                        <h5 className="mb-2 fw-bold text-dark">📋 Mis Citas</h5>
                        <Badge bg="primary" pill>Resultados: {citasFiltradas.length}</Badge>
                    </div>
                    <Nav variant="tabs" activeKey={filtroActual} onSelect={(k) => setFiltroActual(k)}>
                        <Nav.Item><Nav.Link eventKey="todas" className="small text-primary fw-semibold">Todas</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="pendiente" className="small text-warning fw-semibold">⏳ Pendientes</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="confirmada" className="small text-success fw-semibold">✅ Confirmadas</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="pasadas" className="small text-muted fw-semibold">✖ Canceladas/Rechazadas</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0 bg-white">
                    <Table responsive className="mb-0 text-center align-middle">
                        <thead className="table-light border-top">
                            <tr>
                                <th>Fecha y Hora</th>
                                <th style={{ width: '45%' }}>Motivo / Seguimiento</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-4 text-muted small">No se encontraron citas en este bloque.</td>
                                </tr>
                            ) : (
                                citasFiltradas.map((cita) => {
                                    const razonCancelacion = cita.motivo_cancelacion || cita.pivot?.motivo_cancelacion;

                                    return (
                                        <tr key={cita.id} style={{ minHeight: '65px' }}>
                                            <td className="fw-bold text-dark small">{formatearFecha(cita.fecha_hora)}</td>
                                            <td className="text-start small px-3">
                                                <div 
                                                    className="text-dark fw-medium mb-1"
                                                    style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                    title={cita.motivo}
                                                >
                                                    {cita.motivo || <span className="text-black-50 text-opacity-40 style-italic">Sin motivo inicial</span>}
                                                </div>
                                                
                                                {['cancelada', 'rechazada'].includes(cita.estado) && razonCancelacion && (
                                                    <div className="mt-1 p-1 px-2 rounded bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                                                        <strong>Motivo cancelación:</strong> "{razonCancelacion}"
                                                    </div>
                                                )}
                                            </td>
                                            <td>{obtenerBadgeEstado(cita.estado)}</td>
                                            <td>
                                                {['pendiente', 'confirmada'].includes(cita.estado) ? (
                                                    <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={() => abrirModalCancelacion(cita.id)}>Cancelar</Button>
                                                ) : <span className="text-muted small">-</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL DE CANCELACIÓN */}
            <Modal show={modalCancelacion.show} onHide={() => setModalCancelacion({ show: false, citaId: null })} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-danger fs-5">Cancelar Cita</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <Form.Group>
                        <Form.Label className="fw-semibold small text-secondary mb-2">Indica el motivo de la cancelación (le llegará al dietista):</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Ej: Me ha surgido un imprevisto laboral / Quiero cambiar el día..."
                            value={motivoCancelacion}
                            onChange={e => setMotivoCancelacion(e.target.value)}
                            className="border-secondary-subtle"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setModalCancelacion({ show: false, citaId: null })} className="fw-medium">Volver atrás</Button>
                    <Button variant="danger" className="fw-bold shadow-sm" onClick={ejecutarCancelarCita}>Confirmar Cancelación</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SolicitarCita;