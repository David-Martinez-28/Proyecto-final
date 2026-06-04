import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import useApiPost from '../../hooks/ApiDietista/useApiPost';
import useApiGet from '../../hooks/ApiDietista/useApiGet';

const CrearRutina = () => {
    const [nombre, setNombre] = useState('');
    const [disponibles, setDisponibles] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState(''); // Estado para el filtro

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
        const ids = seleccionados.map(e => e.id);
        const exito = await useApiPost('/rutinas', { nombre, ejercicios: ids });
        if (exito) {
            alert("Rutina creada");
            setNombre(''); setSeleccionados([]);
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h3>Crear Nueva Rutina</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Control placeholder="Nombre de la rutina" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Control 
                            placeholder="Buscar por nombre o grupo muscular..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)} 
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <h6>Disponibles:</h6>
                            <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {ejerciciosFiltrados.map(ej => (
                                    <ListGroup.Item key={ej.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{ej.nombre}</strong><br/>
                                            <small className="text-muted">{ej.grupo_muscular}</small>
                                        </div>
                                        <Button size="sm" variant="outline-success" onClick={() => añadirEjercicio(ej)}>+</Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                        <Col md={6}>
                            <h6>Seleccionados:</h6>
                            <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {seleccionados.map(ej => (
                                    <ListGroup.Item key={ej.id} className="d-flex justify-content-between align-items-center">
                                        {ej.nombre}
                                        <Button size="sm" variant="outline-danger" onClick={() => quitarEjercicio(ej)}>-</Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                    </Row>
                    
                    <Button type="submit" variant="success" className="w-100 mt-4">Guardar Rutina</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearRutina;