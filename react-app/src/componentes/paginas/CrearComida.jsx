import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup, Row, Col, Table } from 'react-bootstrap';
import useApiGet from '../../hooks/ApiDietista/useApiGet';
import useApiPost from '../../hooks/ApiDietista/useApiPost';

const CrearComida = () => {
    // 1. Estado local: nada se guarda en BD hasta que pulsamos el botón
    const [comida, setComida] = useState({ nombre: '', receta: '', ingredientes: [] });
    const [catalogo, setCatalogo] = useState([]);

    // 2. Carga inicial del catálogo
    useEffect(() => {
        useApiGet('/ingredientes').then(data => setCatalogo(data || []));
    }, []);

    // 3. SOLO gestiona el estado (Sin llamadas a API)
    const añadirIngrediente = (ing) => {
        if (comida.ingredientes.find(i => i.id === ing.id)) return;
        setComida(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { ...ing, cantidad: 0, unidad: 'g' }]
        }));
    };

    // 4. Acción exclusiva del botón (Aquí se envía todo de golpe)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpieza de datos antes de enviar
        const payload = {
            nombre: comida.nombre,
            receta: comida.receta,
            ingredientes: comida.ingredientes.map(i => ({
                id: i.id,
                cantidad: parseFloat(i.cantidad),
                unidad: i.unidad
            }))
        };

        try {
            await useApiPost('/comidas', payload);
            alert("Comida creada con éxito");
            setComida({ nombre: '', receta: '', ingredientes: [] });
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar. Revisa la consola.");
        }
    };

    return (
        <Container className="py-5">
            <Card className="p-4 shadow-sm border-0 rounded-4">
                <h3>Crear Nueva Comida</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Control className="mb-2" placeholder="Nombre" value={comida.nombre} 
                        onChange={e => setComida({...comida, nombre: e.target.value})} required />
                    <Form.Control className="mb-3" as="textarea" placeholder="Receta" value={comida.receta} 
                        onChange={e => setComida({...comida, receta: e.target.value})} />

                    <Row>
                        <Col md={4}>
                            <h6>Ingredientes</h6>
                            <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {catalogo.map(ing => (
                                    <ListGroup.Item key={ing.id} action onClick={() => añadirIngrediente(ing)}>
                                        {ing.nombre}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                        <Col md={8}>
                            <Table size="sm">
                                <thead><tr><th>Nombre</th><th>Cant.</th><th>Unid.</th></tr></thead>
                                <tbody>
                                    {comida.ingredientes.map((ing, idx) => (
                                        <tr key={idx}>
                                            <td>{ing.nombre}</td>
                                            <td><Form.Control type="number" size="sm" onChange={e => {
                                                const nuevos = [...comida.ingredientes];
                                                nuevos[idx].cantidad = e.target.value;
                                                setComida({...comida, ingredientes: nuevos});
                                            }} /></td>
                                            <td><Form.Control size="sm" value={ing.unidad} onChange={e => {
                                                const nuevos = [...comida.ingredientes];
                                                nuevos[idx].unidad = e.target.value;
                                                setComida({...comida, ingredientes: nuevos});
                                            }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Button type="submit" variant="success" className="w-100 mt-3">Guardar Comida</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default CrearComida;