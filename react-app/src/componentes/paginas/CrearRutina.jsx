import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col, Spinner } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const CrearRutina = () => {
    // Estados para el formulario de creación de rutina
    const [nombre, setNombre] = useState('');
    const [disponibles, setDisponibles] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [enviando, setEnviando] = useState(false);
    // Cargamos el catálogo de ejercicios disponibles al montar el componente
    useEffect(() => {
        const cargarEjercicios = async () => {
            const data = await useApiGet('/ejercicios');
            setDisponibles(Array.isArray(data) ? data : (data?.data || []));
        };
        cargarEjercicios();
    }, []);
    // Filtramos los ejercicios disponibles según la búsqueda, usando useMemo para optimizar el rendimiento y evitar cálculos innecesarios en cada renderizado 
    const ejerciciosFiltrados = useMemo(() => {
        return disponibles.filter(ej => 
            ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [disponibles, busqueda]);
    // Función para añadir ejercicio a la rutina, inicializando con valores por defecto de series, repeticiones y duración
    const añadirEjercicio = (ejercicio) => {
        // Inicializamos con valores estándar
        const nuevo = { ...ejercicio, series: 3, repeticiones: 12, duracion_segundos: 0 };
        setSeleccionados([...seleccionados, nuevo]);
        setDisponibles(disponibles.filter(e => e.id !== ejercicio.id));
    };
    // Función para quitar ejercicio de la rutina y devolverlo al catálogo
    const quitarEjercicio = (ejercicio) => {
        setDisponibles([...disponibles, ejercicio]);
        setSeleccionados(seleccionados.filter(e => e.id !== ejercicio.id));
    };

   // Función para actualizar campos dinámicamente (series, repeticiones, duración)
    const actualizarCampo = (id, campo, valor) => {
        setSeleccionados(prev => prev.map(e => 
            e.id === id ? { ...e, [campo]: parseInt(valor) || 0 } : e
        ));
    };
    // Función para enviar la rutina al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (seleccionados.length === 0) {
            alert("Debes añadir al menos un ejercicio a la rutina.");
            return;
        }

        setEnviando(true);
        
        const payload = { 
            nombre, 
            ejercicios: seleccionados.map(e => ({
                id: e.id,
                series: e.series,
                repeticiones: e.repeticiones,
                duracion_segundos: e.duracion_segundos
            }))
        };
        
        try {
            const exito = await useApiPost('/rutinas', payload);
            if (exito) {
                alert("Rutina creada con éxito");
                setNombre(''); 
                setSeleccionados([]);
            }
        } catch (error) {
            alert("Error al guardar la rutina.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container className="py-4" style={{ maxWidth: '900px' }}>
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h3 className="fw-bold mb-4">🏋️ Configurar Nueva Rutina</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Nombre de la Rutina</Form.Label>
                        <Form.Control 
                            value={nombre} 
                            onChange={e => setNombre(e.target.value)} 
                            placeholder="Ej: Rutina Hipertrofia A"
                            required 
                        />
                    </Form.Group>

                    <Row>
                        <Col md={5}>
                            <h6 className="fw-bold mb-3">Catálogo de Ejercicios</h6>
                            <Form.Control className="mb-2" placeholder="Buscar ejercicio..." onChange={e => setBusqueda(e.target.value)} />
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="border rounded p-2">
                                {ejerciciosFiltrados.length > 0 ? (
                                    ejerciciosFiltrados.map(ej => (
                                        <ListGroup.Item key={ej.id} className="d-flex justify-content-between align-items-center p-2 mb-1 border rounded-3">
                                            {ej.nombre}
                                            <Button size="sm" variant="primary" onClick={() => añadirEjercicio(ej)}>＋</Button>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    
                                    <div className="text-center text-muted py-4 small">
                                        No hay ejercicios disponibles.
                                    </div>
                                )}
                            </div>
                        </Col>
                        
                        <Col md={7}>
                            <h6 className="fw-bold mb-3">Estructura y Cargas</h6>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {seleccionados.length > 0 ? (
                                    seleccionados.map(ej => (
                                        <Card key={ej.id} className="mb-2 p-3 bg-light">
                                            <div className="d-flex justify-content-between mb-2">
                                                <strong>{ej.nombre}</strong>
                                                <Button size="sm" variant="danger" onClick={() => quitarEjercicio(ej)}>✕</Button>
                                            </div>
                                            <Row className="g-2">
                                                <Col><Form.Label className="small">Series</Form.Label><Form.Control type="number" size="sm" value={ej.series} onChange={e => actualizarCampo(ej.id, 'series', e.target.value)} /></Col>
                                                <Col><Form.Label className="small">Reps</Form.Label><Form.Control type="number" size="sm" value={ej.repeticiones} onChange={e => actualizarCampo(ej.id, 'repeticiones', e.target.value)} /></Col>
                                                <Col><Form.Label className="small">Segundos</Form.Label><Form.Control type="number" size="sm" value={ej.duracion_segundos} onChange={e => actualizarCampo(ej.id, 'duracion_segundos', e.target.value)} /></Col>
                                            </Row>
                                        </Card>
                                    ))
                                ) : (
                                    
                                    <div className="text-center text-muted py-5 border border-dashed rounded bg-light-subtle">
                                        <span className="fs-3 d-block mb-1">📋</span>
                                        La rutina está vacía. Añade ejercicios desde el catálogo izquierdo.
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Button type="submit" className="w-100 mt-4" disabled={enviando}>
                        {enviando ? <Spinner size="sm" animation="border" /> : 'Publicar Rutina'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearRutina;