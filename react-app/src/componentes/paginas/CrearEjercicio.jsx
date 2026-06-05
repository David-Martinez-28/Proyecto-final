import React, { useState } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearEjercicio = () => {
    const [ejercicio, setEjercicio] = useState({ nombre: '', descripcion: '', grupo_muscular: '' });
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        
        try {
            const exito = await useApiPost('/ejercicios', ejercicio);
            if (exito) {
                alert("Ejercicio registrado exitosamente");
                setEjercicio({ nombre: '', descripcion: '', grupo_muscular: '' });
            }
        } catch (error) {
            console.error("Error al registrar el ejercicio:", error);
            alert("Hubo un error al guardar el ejercicio. Inténtalo de nuevo.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        /* 🎨 GUÍA DE ESTILOS: Contenedor estrecho, centrado y estilizado a 850px de ancho máximo */
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">💪 Registrar Nuevo Ejercicio</h3>
                
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

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Descripción Técnica / Ejecución</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            placeholder="Describe detalladamente la técnica, rango de movimiento o consejos de seguridad para este ejercicio..."
                            value={ejercicio.descripcion} 
                            onChange={e => setEjercicio({...ejercicio, descripcion: e.target.value})} 
                            className="border-secondary-subtle"
                        />
                    </Form.Group>

                    {/* Botón en Verde Secundario para las acciones finales de confirmación */}
                    <Button 
                        type="submit" 
                        variant="success" 
                        className="w-100 fw-bold py-2 shadow-sm" 
                        disabled={enviando || !ejercicio.nombre || !ejercicio.grupo_muscular}
                    >
                        {enviando ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Guardando en el catálogo...
                            </>
                        ) : 'Guardar y Publicar Ejercicio'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearEjercicio;