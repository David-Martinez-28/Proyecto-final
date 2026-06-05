import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useClinica } from '../contexto/contexto.jsx';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

const AgendaDietista = () => {
    const { citas, cargandoCitas, cargarCitas, cambiarEstadoCita } = useClinica();

    const [fechaActual, setFechaActual] = useState(new Date());
    const [vistaActual, setVistaActual] = useState('month');
    const [modalInfo, setModalInfo] = useState({ show: false, evento: null });

    const [buscarPacientePendiente, setBuscarPacientePendiente] = useState('');
    const [buscarPacienteConfirmado, setBuscarPacienteConfirmado] = useState('');

    // --- ESTADOS PARA GESTIONAR LA CANCELACIÓN CON MOTIVO DEL DIETISTA ---
    const [modalAccionDietista, setModalAccionDietista] = useState({ show: false, citaId: null, nuevoEstado: '' });
    const [motivoDietista, setMotivoDietista] = useState('');

    useEffect(() => {
        cargarCitas();
    }, [cargarCitas]);

    // Disparador del modal intermedio
    const abrirModalGestion = (id, estado) => {
        if (estado === 'confirmada') {
            cambiarEstadoCita(id, 'confirmada');
        } else {
            setModalAccionDietista({ show: true, citaId: id, nuevoEstado: estado });
            setMotivoDietista('');
        }
    };

    const ejecutarAccionDietista = async () => {
        const exito = await cambiarEstadoCita(modalAccionDietista.citaId, modalAccionDietista.nuevoEstado, {
            motivo_cancelacion: motivoDietista
        });
        if (exito) {
            setModalAccionDietista({ show: false, citaId: null, nuevoEstado: '' });
            cerrarModal(); 
        } else {
            alert("Error al actualizar la cita");
        }
    };

    const formatearFecha = (str) => new Date(str).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    if (cargandoCitas) return <Container className="p-5 text-center"><Spinner animation="border" variant="success" /></Container>;

    const pendientesFiltradas = citas.filter(cita => {
        if (cita.estado !== 'pendiente') return false;
        return (cita.paciente?.user?.name || 'Paciente').toLowerCase().includes(buscarPacientePendiente.toLowerCase());
    });

    // 🔥 CORREGIDO: Filtramos de forma estricta para mostrar SOLO las confirmadas activas
    const confirmadasFiltradas = citas.filter(cita => {
        if (cita.estado !== 'confirmada') return false;
        return (cita.paciente?.user?.name || 'Paciente').toLowerCase().includes(buscarPacienteConfirmado.toLowerCase());
    });

    const eventosCalendario = citas
        .filter(cita => cita.estado === 'pendiente' || cita.estado === 'confirmada')
        .map(cita => {
            const fechaInicio = new Date(cita.fecha_hora);
            return {
                id: cita.id,
                title: `${cita.paciente?.user?.name || 'Paciente'} - ${cita.estado === 'confirmada' ? '✅' : '⏳'}`,
                pacienteNombre: cita.paciente?.user?.name || 'Paciente',
                start: fechaInicio,
                end: new Date(fechaInicio.getTime() + 45 * 60000),
                estado: cita.estado,
                motivo: cita.motivo,
                motivo_cancelacion: cita.motivo_cancelacion 
            };
        });

    const estiloEventos = (event) => ({
        style: { backgroundColor: event.estado === 'confirmada' ? '#198754' : '#ffc107', color: event.estado === 'confirmada' ? 'white' : 'black', borderRadius: '5px', border: 'none', fontWeight: 'bold' }
    });

    const cerrarModal = () => setModalInfo({ show: false, evento: null });

    return (
        <Container className="py-5" style={{ maxWidth: '1400px' }}>
            <h2 className="mb-4 fw-bold">📅 Mi Agenda</h2>

            {/* CALENDARIO */}
            <Card className="shadow-sm border-0 mb-5 rounded-4 p-3">
                <div style={{ height: '600px' }}>
                    <Calendar localizer={localizer} events={eventosCalendario} startAccessor="start" endAccessor="end" eventPropGetter={estiloEventos} messages={{today:'Hoy', month:'Mes', week:'Semana', day:'Día'}} date={fechaActual} onNavigate={f => setFechaActual(f)} view={vistaActual} onView={v => setVistaActual(v)} views={['month', 'week', 'day']} onSelectEvent={e => setModalInfo({ show: true, evento: e })} />
                </div>
            </Card>

            {/* TABLAS */}
            <div className="row g-4">
                {/* SOLICITUDES PENDIENTES */}
                <div className="col-lg-6">
                    <Card className="shadow-sm border-0 mb-4 border-top border-warning border-4 rounded-4 overflow-hidden">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-warning fw-bold">Solicitudes Pendientes</h5>
                            <Form.Control type="text" size="sm" placeholder="Buscar..." value={buscarPacientePendiente} onChange={e => setBuscarPacientePendiente(e.target.value)} style={{ maxWidth: '200px' }} className="rounded-pill" />
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-center align-middle">
                                <thead className="bg-light"><tr><th>Fecha</th><th>Paciente / Motivo</th><th>Acción</th></tr></thead>
                                <tbody>
                                    {pendientesFiltradas.length === 0 ? <tr><td colSpan="3" className="py-4 text-muted small">No hay solicitudes pendientes.</td></tr> : 
                                        pendientesFiltradas.map(cita => (
                                            <tr key={cita.id}>
                                                <td className="fw-bold small">{formatearFecha(cita.fecha_hora)}</td>
                                                <td className="text-start small px-3">
                                                    <div className="fw-bold text-dark">{cita.paciente?.user?.name}</div>
                                                    <div className="text-muted text-truncate" style={{ maxWidth: '250px' }} title={cita.motivo}>
                                                        {cita.motivo || <span className="text-black-50 text-opacity-30 italic">Sin motivo especificado</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <Button variant="success" size="sm" onClick={() => abrirModalGestion(cita.id, 'confirmada')}>✓</Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => abrirModalGestion(cita.id, 'cancelada')}>✖</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>

                {/* PRÓXIMAS CONFIRMADAS */}
                <div className="col-lg-6">
                    <Card className="shadow-sm border-0 mb-4 border-top border-success border-4 rounded-4 overflow-hidden">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-success fw-bold">Próximas Confirmadas</h5>
                            <Form.Control type="text" size="sm" placeholder="Buscar..." value={buscarPacienteConfirmado} onChange={e => setBuscarPacienteConfirmado(e.target.value)} style={{ maxWidth: '200px' }} className="rounded-pill" />
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-center align-middle">
                                <thead className="bg-light"><tr><th>Fecha</th><th>Paciente</th><th>Estado</th><th>Acción</th></tr></thead>
                                <tbody>
                                    {confirmadasFiltradas.length === 0 ? <tr><td colSpan="4" className="py-4 text-muted small">No tienes próximas citas confirmadas.</td></tr> : 
                                        confirmadasFiltradas.map(cita => (
                                            <tr key={cita.id} style={{ height: '55px' }}>
                                                <td className="fw-bold small">{formatearFecha(cita.fecha_hora)}</td>
                                                <td className="text-start small px-3">
                                                    <div className="fw-bold text-dark">{cita.paciente?.user?.name}</div>
                                                </td>
                                                <td><Badge bg="success">Confirmada</Badge></td>
                                                <td><Button variant="outline-danger" size="sm" onClick={() => abrirModalGestion(cita.id, 'cancelada')}>Eliminar</Button></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* DETALLES CALENDARIO */}
            <Modal show={modalInfo.show} onHide={cerrarModal} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fs-5 fw-bold text-success">Detalles</Modal.Title></Modal.Header>
                <Modal.Body className="pt-2 pb-4">
                    <h6 className="fw-bold text-center">{modalInfo.evento?.pacienteNombre}</h6>
                    <div className="bg-light rounded p-3 mb-3 small">
                        <strong>Motivo consulta:</strong>
                        <p className="mb-0 mt-1 text-secondary">{modalInfo.evento?.motivo || 'Sin especificar.'}</p>
                    </div>

                    {modalInfo.evento?.estado === 'pendiente' && (
                        <div className="d-flex gap-2 justify-content-center">
                            <Button variant="success" className="w-50" onClick={() => abrirModalGestion(modalInfo.evento.id, 'confirmada')}>Aceptar</Button>
                            <Button variant="danger" className="w-50" onClick={() => abrirModalGestion(modalInfo.evento.id, 'cancelada')}>Rechazar</Button>
                        </div>
                    )}
                    {modalInfo.evento?.estado === 'confirmada' && (
                        <Button variant="outline-danger" className="w-100 fw-bold" onClick={() => abrirModalGestion(modalInfo.evento.id, 'cancelada')}>🗑️ Cancelar Cita</Button>
                    )}
                </Modal.Body>
            </Modal>

            {/* MODAL PARA EL MOTIVO DE RECHAZO/CANCELACIÓN */}
            <Modal show={modalAccionDietista.show} onHide={() => setModalAccionDietista({ show: false, citaId: null, nuevoEstado: '' })} centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold text-danger fs-5">Razón de la Cancelación</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="small text-muted fw-semibold">Escribe una breve explicación para el paciente:</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Ej: Tengo una urgencia médica / Ese día la clínica estará cerrada por festivo..." value={motivoDietista} onChange={e => setMotivoDietista(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setModalAccionDietista({ show: false, citaId: null, nuevoEstado: '' })}>Volver</Button>
                    <Button variant="danger" className="fw-bold" onClick={ejecutarAccionDietista}>Enviar y Cancelar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AgendaDietista;