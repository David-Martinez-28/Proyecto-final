import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useApiPost from '../../hooks/ApiDietista/useApiPost';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const CrearRutina = () => {
    const [nombre, setNombre] = useState('');
    const [disponibles, setDisponibles] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState(''); 
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const cargarEjercicios = async () => {
            const data = await useApiGet('/ejercicios');
            setDisponibles(Array.isArray(data) ? data : (data?.data || []));
        };
        cargarEjercicios();
    }, []);

    // Filtramos la lista de disponibles basándonos en el input de búsqueda
    const ejerciciosFiltrados = useMemo(() => {
        return disponibles.filter(ej => 
            ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
            (ej.grupo_muscular && ej.grupo_muscular.toLowerCase().includes(busqueda.toLowerCase()))
        );
    }, [disponibles, busqueda]);

    const añadirEjercicio = (ejercicio) => {
        setSeleccionados([...seleccionados, ejercicio]);
        setDisponibles(disponibles.filter(e => e.id !== ejercicio.id));
    };

    const quitarEjercicio = (ejercicio) => {
        setDisponibles([...disponibles, ejercicio]);
        setSeleccionados(seleccionados.filter(e => e.id !== ejercicio.id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (seleccionados.length === 0) {
            alert("Por favor, añade al menos un ejercicio a la rutina.");
            return;
        }

        setEnviando(true);
        const ids = seleccionados.map(e => e.id);
        
        try {
            const exito = await useApiPost('/rutinas', { nombre, ejercicios: ids });
            if (exito) {
                alert("Rutina creada exitosamente");
                setNombre(''); 
                setSeleccionados([]);
                // Recargamos el catálogo inicial de ejercicios disponibles
                const data = await useApiGet('/ejercicios');
                setDisponibles(Array.isArray(data) ? data : (data?.data || []));
            }
        } catch (error) {
            console.error("Error al guardar la rutina:", error);
            alert("Hubo un error al guardar la rutina. Revisa la consola.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        /* 🎨 GUÍA DE ESTILOS: Contenedor centrado, estrecho y estilizado a 850px de ancho máximo */
        <Container className="py-4 px-3 mx-auto" style={{ maxWidth: '850px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4 border-top border-primary border-4 bg-white">
                <h3 className="fw-bold text-dark mb-4">🏋️ Enseñar y Crear Nueva Rutina</h3>
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Nombre de la Rutina / Bloque</Form.Label>
                        <Form.Control 
                            placeholder="Ej: Empuje (Pecho/Hombro/Tríceps) - Día A" 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            required 
                            className="border-secondary-subtle py-2" 
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Buscador Integrado de Movimientos</Form.Label>
                        <Form.Control 
                            placeholder="Filtrar catálogo por nombre del ejercicio o grupo muscular..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)} 
                            className="border-secondary-subtle py-2 small"
                        />
                    </Form.Group>

                    <Row className="g-4">
                        {/* COLUMNA EJERCICIOS DISPONIBLES */}
                        <Col md={6}>
                            <h6 className="fw-bold text-secondary mb-2">📋 Catálogo Disponible</h6>
                            <ListGroup className="rounded-3 shadow-sm border border-light-subtle" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {ejerciciosFiltrados.length === 0 ? (
                                    <ListGroup.Item className="text-muted small text-center py-4 bg-light bg-opacity-25">
                                        No se hallaron ejercicios coincidentes.
                                    </ListGroup.Item>
                                ) : (
                                    ejerciciosFiltrados.map(ej => (
                                        <ListGroup.Item key={ej.id} className="d-flex justify-content-between align-items-center p-3 small">
                                            <div className="text-truncate" style={{ maxWidth: '80%' }}>
                                                <strong className="text-dark d-block text-truncate">{ej.nombre}</strong>
                                                <span className="badge bg-light text-primary border border-primary-subtle rounded-pill fw-medium mt-1" style={{ fontSize: '10px' }}>
                                                    {ej.grupo_muscular}
                                                </span>
                                            </div>
                                            <Button size="sm" variant="outline-primary" className="fw-bold p-1 px-2 shadow-none" onClick={() => añadirEjercicio(ej)}>＋</Button>
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                        </Col>
                        
                        {/* COLUMNA EJERCICIOS SELECCIONADOS */}
                        <Col md={6}>
                            <h6 className="fw-bold text-secondary mb-2">⚡ Estructura de la Rutina</h6>
                            <ListGroup className="rounded-3 shadow-sm border border-light-subtle" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {seleccionados.length === 0 ? (
                                    <ListGroup.Item className="text-muted small text-center py-5 bg-light bg-opacity-25">
                                        Asigna movimientos pulsando en el botón del catálogo lateral.
                                    </ListGroup.Item>
                                ) : (
                                    seleccionados.map(ej => (
                                        <ListGroup.Item key={ej.id} className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-10 small">
                                            <div className="text-truncate" style={{ maxWidth: '80%' }}>
                                                <strong className="text-dark d-block text-truncate">{ej.nombre}</strong>
                                                <span className="badge bg-light text-success border border-success-subtle rounded-pill fw-medium mt-1" style={{ fontSize: '10px' }}>
                                                    {ej.grupo_muscular}
                                                </span>
                                            </div>
                                            <Button size="sm" variant="outline-danger" className="fw-bold p-1 px-2 shadow-none" onClick={() => quitarEjercicio(ej)}>－</Button>
                                        </ListGroup.Item>
                                    ))
                                )}
                            </ListGroup>
                        </Col>
                    </Row>
                    
                    {/* Botón en Verde Secundario para las acciones finales de confirmación */}
                    <Button type="submit" variant="success" className="w-100 mt-4 fw-bold py-2 shadow-sm" disabled={enviando || !nombre}>
                        {enviando ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Construyendo tabla de entrenamiento...
                            </>
                        ) : 'Guardar y Publicar Rutina'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearRutina;