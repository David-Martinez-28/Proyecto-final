import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import useApiPost from '../hooks/ApiDietista/useApiPost'; 

const SolicitarCita = () => {
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [motivo, setMotivo] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        const fechaHoraFormateada = `${fecha} ${hora}:00`;

        try {
            await useApiPost('/citas', { fecha_hora: fechaHoraFormateada, motivo: motivo });
            setMensaje({ tipo: 'success', texto: '¡Cita solicitada correctamente!' });
            setFecha(''); setHora(''); setMotivo('');
        } catch (error) {
            setMensaje({ tipo: 'danger', texto: 'Error al solicitar la cita. Elige una fecha futura.' });
        } finally {
            setEnviando(false);
        }
    };

    const hoy = new Date().toISOString().split('T')[0];

    return (
        <Container className="py-4" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Header className="bg-primary text-white text-center py-3">
                    <h4 className="mb-0 fw-bold">📅 Pedir Cita al Dietista</h4>
                </Card.Header>
                <Card.Body className="p-4">
                    {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control type="date" min={hoy} value={fecha} onChange={e => setFecha(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Hora</Form.Label>
                            <Form.Control type="time" value={hora} onChange={e => setHora(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Motivo (Opcional)</Form.Label>
                            <Form.Control as="textarea" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={enviando || !fecha || !hora}>
                            {enviando ? 'Enviando...' : 'Solicitar Cita'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SolicitarCita;