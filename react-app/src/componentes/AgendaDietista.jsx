import React, { useState, useEffect } from 'react';
// IMPORTANTE: Hemos añadido 'Modal' a la lista de importaciones
import { Container, Card, Table, Button, Badge, Spinner, Modal } from 'react-bootstrap';
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

    // --- NUEVO ESTADO PARA CONTROLAR LA VENTANA EMERGENTE ---
    const [modalInfo, setModalInfo] = useState({ show: false, evento: null });

    useEffect(() => {
        cargarCitas();
    }, [cargarCitas]);

    const handleCambiarEstado = async (citaId, nuevoEstado) => {
        const exito = await cambiarEstadoCita(citaId, nuevoEstado);
        if (!exito) alert("Error al actualizar la cita");
    };

    const formatearFecha = (str) => new Date(str).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    if (cargandoCitas) return <Container className="p-5 text-center"><Spinner animation="border" variant="success" /></Container>;

    const pendientes = citas.filter(c => c.estado === 'pendiente');
    const confirmadas = citas.filter(c => c.estado === 'confirmada');

    const eventosCalendario = citas.map(cita => {
        const fechaInicio = new Date(cita.fecha_hora);
        const fechaFin = new Date(fechaInicio.getTime() + 45 * 60000); 
        return {
            id: cita.id,
            title: `${cita.paciente?.user?.name || 'Paciente'} - ${cita.estado === 'confirmada' ? '✅' : '⏳'}`,
            pacienteNombre: cita.paciente?.user?.name || 'Paciente', // Añadimos esto para que quede mejor en la ventana
            start: fechaInicio,
            end: fechaFin,
            estado: cita.estado,
            motivo: cita.motivo
        };
    });

    const estiloEventos = (event) => {
        const backgroundColor = event.estado === 'confirmada' ? '#198754' : '#ffc107'; 
        const color = event.estado === 'confirmada' ? 'white' : 'black';
        return { style: { backgroundColor, color, borderRadius: '5px', border: 'none', fontWeight: 'bold', padding: '2px 5px' } };
    };

    const mensajesCalendario = {
        allDay: 'Todo el día', previous: 'Ant.', next: 'Sig.', today: 'Hoy',
        month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Lista',
        date: 'Fecha', time: 'Hora', event: 'Cita', noEventsInRange: 'No hay citas en este rango de fechas.',
    };

    // Función para cerrar la ventana modal
    const cerrarModal = () => setModalInfo({ show: false, evento: null });

    return (
        <Container className="py-5" style={{ maxWidth: '1400px' }}>
            <h2 className="mb-4 fw-bold">📅 Mi Agenda</h2>

            <Card className="shadow-sm border-0 mb-5 rounded-4 p-3">
                <div style={{ height: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={eventosCalendario}
                        startAccessor="start"
                        endAccessor="end"
                        eventPropGetter={estiloEventos}
                        messages={mensajesCalendario}
                        date={fechaActual} 
                        onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)} 
                        view={vistaActual} 
                        onView={(nuevaVista) => setVistaActual(nuevaVista)} 
                        views={['month', 'week', 'day']}
                        // AQUÍ HACEMOS QUE SE ABRA LA VENTANA EN VEZ DEL ALERT
                        onSelectEvent={(event) => setModalInfo({ show: true, evento: event })}
                    />
                </div>
            </Card>

            <div className="row">
                <div className="col-lg-6">
                    <Card className="shadow-sm border-0 mb-4 border-start border-warning border-4 h-100">
                        <Card.Header className="bg-white py-3"><h5 className="mb-0 text-warning fw-bold">Solicitudes Pendientes</h5></Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-center align-middle">
                                <thead className="bg-light"><tr><th>Fecha</th><th>Paciente</th><th>Acción</th></tr></thead>
                                <tbody>
                                    {pendientes.length === 0 ? <tr><td colSpan="3" className="py-4 text-muted">No hay citas pendientes.</td></tr> : 
                                        pendientes.map(cita => (
                                            <tr key={cita.id}>
                                                <td className="fw-bold">{formatearFecha(cita.fecha_hora)}</td>
                                                <td className="text-truncate" style={{ maxWidth: '150px' }}>{cita.paciente?.user?.name || 'Paciente'}</td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <Button variant="success" size="sm" onClick={() => handleCambiarEstado(cita.id, 'confirmada')}>✓</Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleCambiarEstado(cita.id, 'cancelada')}>✖</Button>
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

                <div className="col-lg-6">
                    <Card className="shadow-sm border-0 mb-4 border-start border-success border-4 h-100">
                        <Card.Header className="bg-white py-3"><h5 className="mb-0 text-success fw-bold">Próximas Confirmadas</h5></Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive className="mb-0 text-center align-middle">
                                <thead className="bg-light"><tr><th>Fecha</th><th>Paciente</th><th>Estado</th></tr></thead>
                                <tbody>
                                    {confirmadas.length === 0 ? <tr><td colSpan="3" className="py-4 text-muted">No tienes citas confirmadas.</td></tr> : 
                                        confirmadas.map(cita => (
                                            <tr key={cita.id}>
                                                <td className="fw-bold">{formatearFecha(cita.fecha_hora)}</td>
                                                <td className="text-truncate" style={{ maxWidth: '150px' }}>{cita.paciente?.user?.name || 'Paciente'}</td>
                                                <td><Badge bg="success">Confirmada</Badge></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            
            <Modal show={modalInfo.show} onHide={cerrarModal} centered size="sm">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fs-5 fw-bold text-success">Detalles de la Cita</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center pt-2 pb-4">
                    <h6 className="fw-bold mb-3 fs-5">{modalInfo.evento?.pacienteNombre}</h6>
                    
                    <div className="bg-light rounded p-3 text-start">
                        <p className="mb-1 text-muted small text-uppercase fw-bold">Motivo del paciente:</p>
                        <p className="mb-0 fw-medium">
                            {modalInfo.evento?.motivo || 'No ha especificado ningún motivo.'}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>

        </Container>
    );
};

export default AgendaDietista;