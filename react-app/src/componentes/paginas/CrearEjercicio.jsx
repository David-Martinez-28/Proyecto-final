import React, { useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const CrearEjercicio = () => {
    // Estado para almacenar los datos del nuevo ejercicio
    const [ejercicio, setEjercicio] = useState({ nombre: '', descripcion: '', grupo_muscular: '', imagen: null });
    const [enviando, setEnviando] = useState(false);
    const [notificacion, setNotificacion] = useState({ show: false, variante: '', texto: '' });
    // Manejo del cambio de archivo para la imagen del ejercicio
    const handleFileChange = (e) => {
        setEjercicio({ ...ejercicio, imagen: e.target.files[0] });
    };
    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setNotificacion({ show: false, variante: '', texto: '' });

        // 1. Construir FormData manualmente
        const formData = new FormData();
        formData.append('nombre', ejercicio.nombre);
        formData.append('grupo_muscular', ejercicio.grupo_muscular);
        formData.append('descripcion', ejercicio.descripcion || '');

        const fileInput = document.getElementById('imagen-ejercicio');
        if (fileInput && fileInput.files[0]) {
            formData.append('imagen', fileInput.files[0]);
        }

        try {
            // 2. Llamada directa a axios sin usar el hook genérico
            // Axios detectará automáticamente que es FormData y pondrá el boundary necesario
            await axios.post('http://212.227.178.175/api/ejercicios', formData, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // NO añadir 'Content-Type' aquí
                }
            });

            setNotificacion({ 
                show: true, 
                variante: 'success', 
                texto: '✅ Ejercicio registrado correctamente.' 
            });
            
            // Limpiar formulario
            setEjercicio({ nombre: '', descripcion: '', grupo_muscular: '', imagen: null });
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error("Error al guardar:", error.response?.data || error);
            setNotificacion({ 
                show: true, 
                variante: 'danger', 
                texto: '❌ Error al guardar. Asegúrate de que la imagen sea válida (máx 2MB).' 
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">💪 Registrar Nuevo Ejercicio</h3>

                {notificacion.show && (
                    <Alert variant={notificacion.variante} onClose={() => setNotificacion({ ...notificacion, show: false })} dismissible>
                        {notificacion.texto}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Nombre del Ejercicio</Form.Label>
                        <Form.Control 
                            placeholder="Ej: Press de Banca Plano"
                            value={ejercicio.nombre} 
                            onChange={e => setEjercicio({...ejercicio, nombre: e.target.value})} 
                            required 
                            className="border-secondary-subtle py-2"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Grupo Muscular Principal</Form.Label>
                        <Form.Control 
                            placeholder="Ej: Pecho, Espalda, Pierna, Hombro..."
                            value={ejercicio.grupo_muscular} 
                            onChange={e => setEjercicio({...ejercicio, grupo_muscular: e.target.value})} 
                            required
                            className="border-secondary-subtle py-2"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Imagen de Referencia</Form.Label>
                        <Form.Control 
                            type="file" 
                            id="imagen-ejercicio"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleFileChange} 
                            className="border-secondary-subtle"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Descripción Técnica</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            value={ejercicio.descripcion} 
                            onChange={e => setEjercicio({...ejercicio, descripcion: e.target.value})} 
                            className="border-secondary-subtle"
                        />
                    </Form.Group>

                    <Button 
                        type="submit" 
                        variant="success" 
                        className="w-100 fw-bold py-2 shadow-sm" 
                        disabled={enviando}
                    >
                        {enviando ? (
                            <><Spinner size="sm" animation="border" className="me-2" /> Guardando...</>
                        ) : 'Guardar y Publicar Ejercicio'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearEjercicio;